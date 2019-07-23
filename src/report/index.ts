import { Check } from "../analyze/check";
import { Release } from "../services/github";

export const generateReport = (
  latestRelease?: Release,
  latestReleaseChecks?: Check[]
) => {
  /**
   * header
   */
  const body = [
    `Hello 👋`,
    "I am a bot. My job is to review your submission.",
    ""
  ];

  if (!latestRelease) {
    /**
     * no release
     */
    body.push(
      "Please create a release with your bundled zip file so I can start reviewing 👀",
      "If you have trouble doing so, please read the [guide](https://github.com/js13kGames/bot/blob/master/doc/how-to-submit.md#release). Or ask for help here.",
      ""
    );
  } else {
    const checks: any = Object.fromEntries(
      latestReleaseChecks.map(x => [x.name, x])
    );

    /**
     * release header
     */
    body.push(
      `I reviewed your latest release, [${latestRelease.tag_name}](${latestRelease.html_url})`,
      ""
    );

    /**
     * all good
     */
    if (latestReleaseChecks.every(c => c.conclusion === "success")) {
      body.push(
        `Its looking all good 👍 A human will soon accept your [entry](${checks["index-found"].deployUrl}) 🎉`
      );
    } else {
      /**
       * no bundle
       */
      if (checks["bundle-found"].conclusion === "failure") {
        body.push(
          "I could not found the zip file in the release assets.",
          "I found:",
          "```",
          ...checks["bundle-found"].assetFiles.map(
            fileName => ` - ${fileName}`
          ),
          "```",
          "",
          "Are you sure you included a .zip file ?"
        );

        /**
         * bundle unzip failed
         */
      } else if (checks["bundle-unziped"].conclusion === "failure") {
        body.push("It looks like the zip file is corrupted");

        /**
         * bundle index
         */
      } else if (checks["index-found"].conclusion === "failure") {
        body.push(
          "I could not found a index.html file in the zip archive.",
          "I found:",
          "```",
          ...checks["index-found"].bundleFiles.map(
            fileName => ` - ${fileName}`
          ),
          "```",
          "",
          "Can you make sure your game can be launched through a file named `index.html`?"
        );

        /**
         * bundle size
         */
      } else if (checks["bundle-size"].conclusion === "failure") {
        body.push(
          "I am afraid your entry is too large!",
          `It weights ${checks["bundle-size"].bundleSize}o, which is more than the ${checks["bundle-size"].sizeLimit}o limit`,
          "",
          "Surely you can save a few bits here an there? 😀"
        );

        /**
         * console error
         */
      } else if (checks["run-without-error"].conclusion === "failure") {
        body.push(
          "Your game seems to have error at launch with chrome",
          "I got this error:",
          "```",
          ...checks["run-without-error"].errors,
          "```",
          `Can you take a look ? I have it deployed [here](${checks["index-found"].deployUrl})`
        );

        /**
         * blank screen
         */
      } else if (checks["run-without-blank-screen"].conclusion === "failure") {
        body.push(
          `Your game seems to have error at launch, all I can see is a [blank screen](${checks["run-without-blank-screen"].screenShotUrl})`,
          `Can you take a look ? I have it deployed [here](${checks["index-found"].deployUrl})`
        );

        /**
         * http
         */
      } else if (checks["run-without-external-http"].conclusion === "failure") {
        body.push(
          `It seems that your game is making call to external resources, which is forbidden.`,
          `Can you take a look ? I have it deployed [here](${checks["index-found"].deployUrl})`
        );
      }
    }
  }

  return body.join("\n");
};
