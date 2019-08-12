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
  pullRequest: PullRequest,
  commitSha: string
): Promise<Control[]> => {
  const controls: Control[] = [];

  const files = await getFiles({ github })(pullRequest, commitSha);

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
   * read the user
   */
  controls.push({
    conclusion: "success",
    name: "user-found",
    user: {
      name: pullRequest.head.repo.owner.login,
      github: pullRequest.head.repo.owner.login,
      ...manifest.user
    },
    repositoryName: pullRequest.head.repo.name
  });

  /**
   * read categories
   */
  controls.push({
    conclusion:
      Array.isArray(manifest.categories) &&
      manifest.categories.every(c =>
        config.rules.categories.includes(c.toLowerCase())
      )
        ? "success"
        : "failure",
    name: "categories-found",
    gameCategories: manifest.categories
  });

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
    return {
      error: "not-found",
      target: { width: spec.width, height: spec.height },
      filename
    };
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
      filename,
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

const trimExtension = (filename: string) => {
  const ext = path.extname(filename);
  return filename.slice(0, -ext.length);
};

const isImage = (filename: string) =>
  !!(mime.lookup(filename) || "").match(/^image/);

export const getFiles = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest,
  commitSha?: string
): Promise<File[]> => {
  const { data: commits } = await github.pullRequests.listCommits({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    number: pullRequest.number,
    per_page: 300
  });

  const files = {};

  for (const sha of removeAfter(commits.map(c => c.sha), commitSha)) {
    const { data: commit } = await github.repos.getCommit({
      owner: pullRequest.base.repo.owner.login,
      repo: pullRequest.base.repo.name,
      sha
    });

    for (const file of commit.files) {
      files[file.filename] = file;
    }
  }

  return Object.values(files);
};

const removeAfter = <T>(arr: T[], x: T): T[] => {
  const i = arr.indexOf(x);
  return i === -1 ? arr : arr.slice(0, 1 + i);
};
