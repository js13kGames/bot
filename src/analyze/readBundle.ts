import fetch from "node-fetch";
import Zip from "node-zip";
import { Asset } from "../types/github";
import { GithubClient } from "../services/github";

const downloadAsset = (url: string) =>
  fetch(url, {
    headers: {
      Accept: "application/octet-stream"
    }
  }).then(res => res.arrayBuffer());

/**
 * read the bundle
 * the strategy is to take whatever have the mim type zip and unzip it
 */
const readZipFile = ({ github }: { github: GithubClient }) => async (
  assets: Asset[]
) => {
  /*
   * search for a zip file
   */
  const asset = assets.find(a => a.content_type === "application/zip");

  if (!asset) throw new Error("could not find a zip file");

  /*
   * download the file
   */
  const bundleContent = await downloadAsset(asset.browser_download_url);

  /*
   * unzip it
   */
  try {
    const zip = Zip(Buffer.from(bundleContent).toString("base64"), {
      base64: true,
      checkCRC32: true
    });

    const files = Object.fromEntries(
      Object.entries(zip.files)
        .filter(([, file]: any) => !file.dir)
        .map(([name, file]: any) => [name, file.asNodeBuffer()])
    );

    return { files, bundleSize: asset.size };
  } catch (err) {
    const error = new Error("failed to unzip");

    // @ts-ignore
    error.error = err;
    throw error;
  }
};

/**
 * read bundle entry files
 */
export const readBundle = ({ github }: { github: GithubClient }) => async (
  assets: Asset[]
) => {
  return readZipFile({ github })(assets);
};
