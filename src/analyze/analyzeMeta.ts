import getPixels from "get-pixels";
import fetch from "node-fetch";
import mime from "mime-types";
import path from "path";

import * as config from "../config";
import { Control } from "./control";
import { PullRequest, GithubClient, File } from "../services/github";
import { promisify } from "util";
import { uploadImage, createUrl } from "../services/cloudinary";

export const analyzeMeta = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest
): Promise<Control[]> => {
  const controls: Control[] = [];

  const { data: files } = await github.pullRequests.listFiles({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    number: pullRequest.number
  });

  /**
   * look for the manifest file
   */
  const manifestFile = files.find(
    f =>
      f.filename === "manifest.json" ||
      f.filename === "js13kgames-manifest.json"
  );

  controls.push({
    conclusion: manifestFile ? "success" : "failure",
    name: "manifest-found",
    files: files.map(f => f.filename)
  });

  const manifestContent =
    manifestFile &&
    (await fetch(manifestFile.raw_url, {
      headers: { Accept: "application/octet-stream" }
    }).then(res => res.text()));

  /**
   * fetch the manifest
   */
  let manifest;
  try {
    manifest = JSON.parse(manifestContent);
    controls.push({
      conclusion: "success",
      name: "manifest-read",
      manifest
    });
  } catch (err) {
    controls.push({
      conclusion: "failure",
      name: "manifest-read"
    });
    manifest = {};
  }

  /**
   * read meta
   */
  controls.push(
    {
      conclusion: manifest.name ? "success" : "failure",
      name: "name-found",
      gameName: manifest.name
    },
    {
      conclusion: manifest.description ? "success" : "failure",
      name: "description-found",
      gameDescription: manifest.description
    }
  );

  /**
   * read images
   */
  const images = {};
  for (const [name, spec] of Object.entries(config.rules.images)) {
    images[name] = await analyzeImage(files, manifest, name, spec);
  }

  controls.push({
    conclusion: Object.values(images).every((i: any) => !i.error)
      ? "success"
      : "failure",
    name: "images-found",
    images
  });

  return controls;
};

const analyzeImage = async (
  files: File[],
  manifest: any,
  name: string,
  spec: any
) => {
  const filename = (manifest.images && manifest.images[name]) || name;

  const imageFile = files.find(
    f =>
      f.filename === filename ||
      (trimExtension(f.filename) === filename && isImage(f.filename))
  );

  if (!imageFile) {
    return { error: "not-found", filename };
  }

  const imageContent = await fetch(imageFile.raw_url, {
    headers: { Accept: "application/octet-stream" }
  }).then(res => res.arrayBuffer());

  const imageType = imageFile && mime.lookup(imageFile.filename);

  const {
    shape: [width, height]
  } = await promisify(getPixels)(Buffer.from(imageContent), imageType);

  if (
    !numberEqual(spec.width / spec.height, width / height) ||
    width < spec.width ||
    height < spec.height
  ) {
    return {
      error: "size",
      target: { width: spec.width, height: spec.height },
      origin: { width, height }
    };
  }

  const imageUrl = await uploadImage(Buffer.from(imageContent));

  return createUrl(imageUrl, {
    width: spec.width,
    height: spec.height,
    crop: "fit",
    format: "jpg"
  });
};

const numberEqual = (a, b) => Math.abs(a - b) < 0.001;

const trimExtension = filename => {
  const ext = path.extname(filename);
  return filename.slice(0, -ext.length);
};

const isImage = filename => !!(mime.lookup(filename) || "").match(/^image/);
