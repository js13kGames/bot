import fetch from "node-fetch";
import * as webdriver from "selenium-webdriver";
import { encode } from "base-64";

export const runGame = async (gameUrl: string) => {
  const { user, key } = getCredentials();

  const capabilities = {
    os: "Windows",
    os_version: "10",
    browserName: "Chrome",
    browser_version: "80.0",
    "browserstack.local": "false",
    "browserstack.debug": "false",
    "browserstack.video": "false",
    "browserstack.networkLogs": "true",
    "browserstack.console": "errors",
    "browserstack.seleniumLogs": "false",
    "browserstack.selenium_version": "3.14.0",
    "browserstack.user": user,
    "browserstack.key": key,
  };

  const driver = new webdriver.Builder()
    .usingServer("http://hub-cloud.browserstack.com/wd/hub")
    .withCapabilities(capabilities)
    .build();

  const session = await driver.getSession();

  /**
   * access the deployed game
   */
  await driver.get(gameUrl);

  await driver.sleep(500);

  /**
   * take a screenshot
   */
  const base64screenShot: string = await driver.takeScreenshot();

  /**
   * read the browser log
   */
  const browserLogs = await driver
    .manage()
    .logs()
    .get(webdriver.logging.Type.BROWSER);

  await driver.quit();

  /**
   * wait for network log to be ready
   * and get them
   */
  await wait(4000);
  const networkLog = await getBrowserStackNetworkLog(session.getId());

  const errorlogs: string[] = browserLogs
    .map((x: any) => x.toJSON())
    .filter(({ level }: any) => ["SEVERE"].includes(level))
    .map(({ message }: any) => message)

    // omit error message related to favicon
    .filter(
      (message: string) =>
        !(message.includes("favicon.ico") && message.match(/(404|403)/))
    );

  const urls: string[] = networkLog.log.entries
    .map((e: any) => e.request.url)
    .filter(isUrlRelevant)
    .sort();

  return { networkLog, browserLogs, errorlogs, urls, base64screenShot };
};

const isUrlRelevant = (url: string) =>
  !(
    // omit requests made by the os that somehow end up here
    (
      url.startsWith("http://ctldl.windowsupdate.com/msdownload/update") ||
      url.startsWith("http://crl.globalsign.net") ||
      url.startsWith("https://accounts.google.com") ||
      url.startsWith("https://www.gstatic.com/chrome/intelligence/assist/") ||
      url.match(/^https?:\/\/[^/]+microsoft\.com/) ||
      // omit favicon
      url.endsWith("favicon.ico")
    )
  );

const getCredentials = () => ({
  user: process.env.BROWSERSTACK_USER!,
  key: process.env.BROWSERSTACK_KEY!,
});

const wait = (delay = 0) => new Promise((r) => setTimeout(r, delay));

const getBrowserStackNetworkLog = async (
  sessionId: string,
  retry = 0
): Promise<any> => {
  const { user, key } = getCredentials();

  const auth = encode(user + ":" + key);

  try {
    const res = await fetch(
      `https://api.browserstack.com/automate/sessions/${sessionId}/networklogs`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    const resText = await res.text();

    if (!res.ok) throw new Error(resText);

    return JSON.parse(resText);
  } catch (err) {
    if (retry < 16) {
      await wait(1000);

      return getBrowserStackNetworkLog(sessionId, retry + 1);
    }
  }
};
