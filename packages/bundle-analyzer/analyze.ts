import { unzip } from "./unzip";
import { parse as parseUrl } from "url";
import * as path from "path";
import { getHash } from "./md5";
import { upload } from "./s3";
import { runGame } from "./browserstack";
import { promisify } from "util";
import { Rules } from "js13kGames-bot-rules";
import getPixels from "get-pixels";
import { checkDescriptions, Result, CheckId } from "./checks";

export const analyze = async (rules: Rules, bundleContent: Buffer) => {
  const key = getHash(bundleContent);
  const report = createInitialReport();

  report.checks.bundle_size.result =
    bundleContent.length <= rules.bundle.max_size ? "ok" : "failed";

  // unzip
  let files: ReturnType<typeof unzip>;
  try {
    files = unzip(bundleContent);
    report.checks.bundle_valid_zip.result = "ok";
  } catch (error: any) {
    report.checks.bundle_valid_zip.result = "failed";
    report.checks.bundle_valid_zip.details = error.message;
    return report;
  }

  // check index.html
  {
    const ok = files.some((x) => x.filename === "index.html");

    if (ok) {
      report.checks.bundle_contains_index.result = "ok";
    } else {
      report.checks.bundle_contains_index.result = "failed";

      const htmlFile = files.find((x) => x.filename.endsWith(".html"));

      if (htmlFile && htmlFile.filename.endsWith("index.html"))
        report.checks.bundle_contains_index.details = `Can you try moving "${htmlFile.filename}" to the root of the zip ?`;
      if (htmlFile && !htmlFile.filename.endsWith("index.html"))
        report.checks.bundle_contains_index.details = `Can you try renaming "${htmlFile.filename}" to "index.html" ?`;
    }
  }

  // deploy
  let gameUrl = await uploadFiles(key, files);

  if (!gameUrl) {
    return report;
  } else {
    report.deployUrl = gameUrl;
  }

  // test game
  const { urls, errorlogs, base64screenShot } = await runGame(gameUrl);

  /// check for errors
  {
    report.checks.game_no_error.result = errorlogs.length ? "failed" : "ok";

    if (errorlogs.length)
      report.checks.game_no_error.details =
        `got ${errorlogs.length} errors:\n` +
        errorlogs.map((message) => `  ${message}`).join("\n");
  }

  // check for forbidden requests
  {
    const [baseUrl] = gameUrl.split("/index.html");
    const externalUrls = urls
      .filter((url) => !url.startsWith(baseUrl))
      .filter(
        (url) =>
          !rules.game.http_request_whitelist_regexp.some((re) =>
            url.match(new RegExp(re))
          )
      );

    report.checks.game_no_external_http.result = externalUrls.length
      ? "failed"
      : "ok";

    if (externalUrls.length)
      report.checks.game_no_external_http.details =
        `got ${externalUrls.length} forbidden requests:\n` +
        externalUrls
          .map((url) => {
            const hostname = parseUrl(url).hostname;
            const baseHostname = parseUrl(baseUrl).hostname;

            if (hostname && hostname === baseHostname)
              return `- ${
                url.split(hostname)[1]
              } Can you try importing this resource with a relative path ?`;

            return `- ${url}`;
          })
          .join("\n");
  }

  // check for blank screen
  {
    const getPixelsP = promisify(getPixels);
    const { data: dataImage } = await getPixelsP(
      "data:image/png;base64," + base64screenShot,
      ""
    );

    report.checks.game_no_blank_screen.result = isImageBlank(dataImage)
      ? "failed"
      : "ok";
  }

  return report;
};

const uploadFiles = async (key: string, files: any[]) => {
  let indexUrl: string | undefined;
  await Promise.all(
    files.map(({ filename, content }) =>
      upload(path.join(key, filename), content).then((url) => {
        if (filename === "index.html") indexUrl = url;
      })
    )
  );
  return indexUrl;
};

// return true if the image is filled with only one color
const isImageBlank = (data: ArrayLike<number>) => {
  let err = 0;

  for (let i = 0; i < data.length; i += 4) {
    err +=
      Math.abs(data[i + 0] - data[0]) +
      Math.abs(data[i + 1] - data[1]) +
      Math.abs(data[i + 2] - data[2]);
  }

  return err === 0;
};

const createInitialReport = () => {
  const checks: any = {};

  for (const id in checkDescriptions) {
    checks[id] = { result: "untested" };
  }

  return {
    deployUrl: null as null | string,
    checks: checks as Record<CheckId, { result: Result; details?: string }>,
  };
};

export const formatReport = (
  report: ReturnType<typeof createInitialReport>
) => ({
  ...report,
  checks: Object.entries(report.checks).map(([id, value]) => ({
    id,
    ...value,
    description: checkDescriptions[id as CheckId],
  })),
});
