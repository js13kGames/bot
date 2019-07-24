import { Release, GithubClient } from "../services/github";
import { readBundle } from "./readBundle";
import { createUploader } from "../services/s3";
import { analyzeGame } from "./analyzeGame";
import { Control } from "./control";
import * as config from "../config";

export const analyzeRelease = ({ github }: { github: GithubClient }) => async (
  release: Release
): Promise<Control[]> => {
  let files: { [key: string]: any };
  let bundleSize: number;
  let bundleHash: string;

  const controls: Control[] = [];

  /**
   * read the bundle
   */
  try {
    const res = await readBundle({ github })(release.assets);
    files = res.files;
    bundleSize = res.bundleSize;
    bundleHash = res.bundleHash;

    controls.push(
      {
        name: "bundle-found",
        conclusion: "success",
        assetFiles: release.assets.map(a => a.name)
      },
      { name: "bundle-unzipped", conclusion: "success" }
    );
  } catch (err) {
    if (err.message === "could not find a zip file") {
      controls.push({
        name: "bundle-found",
        conclusion: "failure",
        assetFiles: release.assets.map(a => a.name)
      });
      return controls;
    } else {
      controls.push({
        name: "bundle-found",
        conclusion: "success",
        assetFiles: release.assets.map(a => a.name)
      });
    }

    if (err.message === "failed to unzip") {
      controls.push({ name: "bundle-unzipped", conclusion: "failure" });
      return controls;
    } else {
      controls.push({ name: "bundle-unzipped", conclusion: "success" });
    }

    throw err;
  }

  /**
   * check the bundle size
   */
  controls.push({
    name: "bundle-size",
    conclusion:
      bundleSize > config.rules.bundleSizeLimit ? "failure" : "success",
    bundleSize,
    sizeLimit: config.rules.bundleSizeLimit
  });

  /**
   * upload files
   */
  const { upload } = await createUploader(bundleHash);

  let index: string;
  for (const [filename, content] of Object.entries(files)) {
    const url = await upload(filename, content as any);

    if (filename === "index.html") index = url;
  }

  /**
   * check for the index html
   */
  controls.push({
    name: "index-found",
    conclusion: index ? "success" : "failure",
    deployUrl: index,
    bundleFiles: Object.keys(files)
  });

  if (index) {
    controls.push(...(await analyzeGame({ upload })(index)));
  }

  return controls;
};
