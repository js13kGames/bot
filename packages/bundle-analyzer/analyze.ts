import { unzip } from "./unzip";
import { getHash } from "./md5";
import { createUploader } from "./s3";
import { runGame } from "./browserstack";
import { promisify } from "util";
// @ts-ignore
import * as getPixels from "get-pixels";
import { createInitialReport } from "./report";

export type Rules = {
  bundle: {
    max_size: number;
  };
  game: {
    http_request_whitelist: RegExp[];
  };
};

export const analyze = async (rules: Rules, bundleContent: Buffer) => {
  const key = getHash(bundleContent);
  const report = createInitialReport();

  try {
    report.bundle_size.result =
      bundleContent.length <= rules.bundle.max_size ? "ok" : "failed";

    // unzip
    const files = unzip(bundleContent);

    report.bundle_valid_zip.result = "ok";

    // deploy
    let gameUrl = await uploadFiles(key, files);

    if (!gameUrl) {
      report.bundle_contains_index.result = "failed";
      return report;
    }

    report.bundle_contains_index.result = "ok";

    // test game
    const { urls, errorlogs, base64screenShot } = await runGame(gameUrl);

    const { data: dataImage } = await promisify(getPixels)(
      "data:image/png;base64," + base64screenShot
    );

    report.game_no_blank_screen.result = isImageBlank(dataImage)
      ? "failed"
      : "ok";

    report.game_no_error.result = errorlogs.length ? "failed" : "ok";
    report.game_no_error.details = errorlogs;

    const externalUrls = urls
      .filter((url) => !url.includes(key))
      .filter(
        (url) => !rules.game.http_request_whitelist.some((re) => url.match(re))
      );
    report.game_no_external_http.result = externalUrls.length ? "failed" : "ok";
    report.game_no_external_http.details = externalUrls;
  } catch (error) {
    console.error(error);
  }

  return report;
};

const uploadFiles = async (key: string, files: any[]) => {
  const { upload } = await createUploader(key);
  let indexUrl: string | undefined;
  await Promise.all(
    files.map(({ filename, content }) =>
      upload(filename, content).then((url) => {
        if (filename === "index.html") indexUrl = url;
      })
    )
  );
  return indexUrl;
};

// return true if the image is filled with only one color
const isImageBlank = (data: number[]) => {
  let err = 0;

  for (let i = 0; i < data.length; i += 4) {
    err +=
      Math.abs(data[i + 0] - data[0]) +
      Math.abs(data[i + 1] - data[1]) +
      Math.abs(data[i + 2] - data[2]);
  }

  return err === 0;
};
