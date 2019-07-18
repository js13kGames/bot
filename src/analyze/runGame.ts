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

  await driver.sleep(1000);

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
  const urls = await fetch(
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
      const text = await res.text();

      if (res.ok) return JSON.parse(text).log.entries.map(e => e.request.url);

      throw new Error(text);
    })
    .catch(error => {
      console.log(error);
      return null;
    });

  const externalUrls =
    urls &&
    urls.filter(
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
      conclusion: criticalLogs.length > 0 ? "failure" : "success",
      errors: criticalLogs
    },

    {
      name: "run-without-external-http",
      conclusion:
        externalUrls && externalUrls.length > 0 ? "failure" : "success",
      urls: urls,
      externalUrls:
        externalUrls && externalUrls.length > 0 ? externalUrls : undefined
    },

    {
      name: "run-without-blank-screen",
      conclusion: isImageBlank(dataImage) ? "failure" : "success",
      screenShotUrl
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
