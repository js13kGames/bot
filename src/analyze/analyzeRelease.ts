import { Release } from "../types/github";
import { GithubClient } from "../services/github";
import { readBundle } from "./readBundle";
import { ReleaseReport } from "../report/releaseReport";
import { upload } from "../services/s3";
import path from "path";
import { runGame } from "./runGame";
import { Check } from "./check";

const SIZE_LIMIT = 13 * 1024;

export const readRelease = (release: Release): ReleaseReport => ({
  releaseId: release.id.toString(),
  releaseName: release.tag_name,
  releaseUrl: release.html_url,
  deployUrl: undefined,
  checks: []
});

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
      { name: "bundle-found", status: "success" },
      { name: "bundle-unziped", status: "success" }
    );
  } catch (err) {
    if (err.message === "could not find a zip file") {
      checks.push({ name: "bundle-found", status: "failure" });
      return checks;
    } else {
      checks.push({ name: "bundle-found", status: "success" });
    }

    if (err.message === "failed to unzip") {
      checks.push({ name: "bundle-unziped", status: "failure" });
      return checks;
    } else {
      checks.push({ name: "bundle-unziped", status: "success" });
    }

    throw err;
  }

  /**
   * check the bundle size
   */
  checks.push({
    name: "bundle-size",
    status: bundleSize > SIZE_LIMIT ? "failure" : "success",
    statusDetail:
      bundleSize > SIZE_LIMIT ? `${bundleSize} > ${SIZE_LIMIT}` : undefined
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
    status: index ? "success" : "failure",
    statusDetail: index
  });

  /**
   * check run
   */
  if (index) {
    checks.push(...(await runGame(index)));
  }

  return checks;
};
