import path from "path";
import fetch from "node-fetch";
import webdriver from "selenium-webdriver";
import getPixels from "get-pixels";
import { promisify } from "util";
import * as config from "./config";
import { encode } from "base-64";

export const runGame = async (deployUrl: string): Promise<string[]> => {
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

  await driver.quit();

  /**
   * read the network log, from browserstack rest api
   */
  // should basically never works
  await driver.sleep(500);
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
      if (res.ok) return res.json();

      const text = await res.text();
      throw new Error(text);
    })
    .catch(error => {
      console.log(error);
      return null;
    });

  const warnings = [];

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

  warnings.push(
    ...criticalLogs.map(
      ({ message }) => `critical error was found while running: \`${message}\``
    )
  );

  /**
   * check the network log for external resource call
   * ( which is obviously prohibited )
   * ( expect from the favicon.ico, i guess that's ok )
   *
   *  need to have a defensive check on "networkLogs" existance in case browserstack fails
   */
  if (networkLogs && networkLogs.logs) {
    const externalUrls = networkLogs.log.entries
      .map(({ request }) => request.url)
      .filter(
        url =>
          !url.startsWith(path.dirname(deployUrl)) &&
          path.basename(url) !== "favicon.ico"
      );

    warnings.push(
      ...externalUrls.map(
        url => `forbidden access to external resouce: \`${url}\``
      )
    );
  }

  /**
   * check that the first thing displayed is no a blank page
   */
  const { data } = await promisify(getPixels)(
    "data:image/png;base64," + base64screenShot
  );

  if (isImageBlank(data)) warnings.push("game is stuck on a blank screen");

  return warnings;
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
