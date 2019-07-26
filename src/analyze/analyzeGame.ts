import path from "path";
import fetch from "node-fetch";
import webdriver from "selenium-webdriver";
import getPixels from "get-pixels";
import { promisify } from "util";
import * as config from "../config";
import { encode } from "base-64";
import { Control } from "./control";

const wait = (delay = 0) => new Promise(r => setTimeout(r, delay));

const getBrowserStackNetworkLog = (sessionId: string, retry = 0) =>
  fetch(
    `https://api.browserstack.com/automate/sessions/${sessionId}/networklogs`,
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

      if (res.ok) return JSON.parse(text);

      throw new Error(text);
    })
    .catch(async error => {
      if (retry < 10) {
        await wait(1000);

        return getBrowserStackNetworkLog(sessionId, retry + 1);
      }

      console.log(error);

      return null;
    });

export const analyzeGame = ({ upload }) => async (
  deployUrl: string
): Promise<Control[]> => {
  /**
   * prepare browserstack
   */
  const capabilities = {
    os: "Windows",
    os_version: "10",
    browserName: "Chrome",
    browser_version: "62.0",
    "browserstack.local": "false",
    "browserstack.debug": "false",
    "browserstack.video": "false",
    "browserstack.networkLogs": "true",
    "browserstack.seleniumLogs": "false",
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

  await driver.sleep(500);

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

  // await driver.sleep(500);
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
    )
    .map(({ message }) => message);

  /**
   * wait for network log to be ready
   * and get them
   */
  await wait(4000);
  const networkLog = await getBrowserStackNetworkLog(session.getId());
  const urls = networkLog.log.entries.map(e => e.request.url).sort();

  /**
   * check the network log for external resource call
   * ( which is obviously prohibited )
   * ( expect from the favicon.ico, i guess that's ok )
   */
  const externalUrls = urls.filter(
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
      conclusion: externalUrls.length > 0 ? "failure" : "success",
      urls,
      externalUrls
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
