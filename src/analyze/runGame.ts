import path from "path";
import fetch from "node-fetch";
import webdriver from "selenium-webdriver";
import getPixels from "get-pixels";
import { promisify } from "util";
import * as config from "../config";
import { encode } from "base-64";
import { Check } from "./check";
import { upload } from "../services/s3";

export const runGame = async (deployUrl: string): Promise<Check[]> => {
  /**
   * prepare browserstack
   */
  const capabilities = {
    os: "Windows",
    os_version: "10",
    browserName: "Chrome",
    browser_version: "62.0",
    "browserstack.local": "false",
    "browserstack.debug": "true",
    "browserstack.video": "true",
    "browserstack.networkLogs": "true",
    "browserstack.seleniumLogs": "true",
    "browserstack.selenium_version": "3.5.2",
    "browserstack.user": config.browserstack.user,
    "browserstack.key": config.browserstack.key
  };

  const driver = new webdriver.Builder()
    .usingServer("http://hub-cloud.browserstack.com/wd/hub")
    .withCapabilities(capabilities)
    .build();

  const session = await driver.getSession();

  /**
   * access the deployed game
   */
  await driver.get(deployUrl);

  await driver.sleep(300);

  /**
   * take a screenshot
   */
  const base64screenShot = await driver.takeScreenshot();

  /**
   * read the browser log
   */
  const browserLogs = await driver
    .manage()
    .logs()
    .get(webdriver.logging.Type.BROWSER);

  await driver.sleep(500);
  await driver.quit();

  /**
   * look for error in the console
   */
  const criticalLogs = browserLogs
    .map(x => x.toJSON())
    .filter(({ level }) => ["SEVERE"].includes(level))
    .filter(
      ({ message }) =>
        !(message.includes("favicon.ico") && message.match(/40[34]/))
    );

  /**
   * check the network log for external resource call
   * ( which is obviously prohibited )
   * ( expect from the favicon.ico, i guess that's ok )
   *
   *  need to have a defensive check on "networkLogs" existance in case browserstack fails
   */
  const networkLogs = await fetch(
    `https://api.browserstack.com/automate/sessions/${session.getId()}/networklogs`,
    {
      headers: {
        Authorization: `Basic ${encode(
          config.browserstack.user + ":" + config.browserstack.key
        )}`
      }
    }
  )
    .then(async res => {
      if (res.ok) return console.log(await res.text());

      const text = await res.text();
      throw new Error(text);
    })
    .catch(error => {
      console.log(error);
      return null;
    });

  const externalUrls =
    networkLogs &&
    networkLogs.log &&
    networkLogs.log.entries
      .map(({ request }) => request.url)
      .filter(
        url =>
          !url.startsWith(path.dirname(deployUrl)) &&
          path.basename(url) !== "favicon.ico"
      );

  /**
   * check that the first thing displayed is no a blank page
   */
  const { data: dataImage } = await promisify(getPixels)(
    "data:image/png;base64," + base64screenShot
  );
  const screenShotUrl = await upload(
    "game_preview_screenshot.png",
    Buffer.from(base64screenShot, "base64")
  );

  return [
    {
      name: "run-without-error",
      status: criticalLogs.length > 0 ? "failure" : "success",
      statusDetail:
        criticalLogs.length > 0
          ? criticalLogs.map(error => ` - \`${error.message}\``).join("\n")
          : undefined
    },

    {
      name: "run-without-external-http",
      status: externalUrls && externalUrls.length > 0 ? "failure" : "success",
      statusDetail:
        externalUrls && externalUrls.length > 0
          ? externalUrls
              .map(url => ` - forbidden access to \`${url}\``)
              .join("\n")
          : undefined
    },

    {
      name: "run-without-blank-screen",
      status: isImageBlank(dataImage) ? "failure" : "success",
      statusDetail: screenShotUrl
    }
  ];
};

/**
 * return true if the image is filled with only one color
 */
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
