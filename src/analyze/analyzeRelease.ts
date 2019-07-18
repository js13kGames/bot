import { Release } from "../types/github";
import { GithubClient } from "../services/github";
import { readBundle } from "./readBundle";
import { upload } from "../services/s3";
import path from "path";
import { runGame } from "./runGame";
import { Check } from "./check";

const SIZE_LIMIT = 13 * 1024;

export const analyzeRelease = ({ github }: { github: GithubClient }) => async (
  release: Release
): Promise<Check[]> => {
  let files: { [key: string]: any };
  let bundleSize: number;

  const checks: Check[] = [];

  /**
   * read the bundle
   */
  try {
    const res = await readBundle({ github })(release.assets);
    files = res.files;
    bundleSize = res.bundleSize;

    checks.push(
      {
        name: "bundle-found",
        conclusion: "success",
        assetFiles: release.assets.map(a => a.name)
      },
      { name: "bundle-unziped", conclusion: "success" }
    );
  } catch (err) {
    if (err.message === "could not find a zip file") {
      checks.push({
        name: "bundle-found",
        conclusion: "failure",
        assetFiles: release.assets.map(a => a.name)
      });
      return checks;
    } else {
      checks.push({
        name: "bundle-found",
        conclusion: "success",
        assetFiles: release.assets.map(a => a.name)
      });
    }

    if (err.message === "failed to unzip") {
      checks.push({ name: "bundle-unziped", conclusion: "failure" });
      return checks;
    } else {
      checks.push({ name: "bundle-unziped", conclusion: "success" });
    }

    throw err;
  }

  /**
   * check the bundle size
   */
  checks.push({
    name: "bundle-size",
    conclusion: bundleSize > SIZE_LIMIT ? "failure" : "success",
    bundleSize,
    sizeLimit: SIZE_LIMIT
  });

  /**
   * upload files
   */
  let index: string;
  for (const [filename, content] of Object.entries(files)) {
    const url = await upload(
      path.join(release.tag_name, filename),
      content as any
    );

    if (filename === "index.html") index = url;
  }

  /**
   * check for the index html
   */
  checks.push({
    name: "index-found",
    conclusion: index ? "success" : "failure",
    deployUrl: index,
    bundleFiles: Object.keys(files)
  });

  /**
   * check run
   */
  if (index) {
    checks.push(...(await runGame(index)));
  }

  return checks;
};
