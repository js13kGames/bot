import { Control, extractInfo } from "../analyze/control";
import { Release } from "../services/github";

export const generateReport = (
  latestRelease?: Release,
  controls?: Control[]
) => {
  /**
   * header
   */
  const body = [
    `Hello 👋`,
    "I am a bot. My job is to review your submission.",
    ""
  ];

  const c: any = Object.fromEntries((controls || []).map(x => [x.name, x]));

  /**
   * release
   */
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
    /**
     * release header
     */
    body.push(
      `I reviewed your latest release, [${latestRelease.tag_name}](${latestRelease.html_url})` +
        ([
          "bundle-found",
          "bundle-unzipped",
          "index-found",
          "bundle-size",
          "run-without-error",
          "run-without-blank-screen",
          "run-without-external-http"
        ].every(name => c[name] && c[name].conclusion !== "failure")
          ? `. Its looking all good 👍`
          : "")
    );

    /**
     * no bundle
     */
    if (c["bundle-found"].conclusion === "failure") {
      body.push(
        "I could not found the zip file in the release assets.",
        "I found:",
        "```",
        ...c["bundle-found"].assetFiles.map(fileName => ` - ${fileName}`),
        "```",
        "",
        "Are you sure you included a .zip file ?"
      );

      /**
       * bundle unzip failed
       */
    } else if (c["bundle-unzipped"].conclusion === "failure") {
      body.push("It looks like the zip file is corrupted");

      /**
       * bundle index
       */
    } else if (c["index-found"].conclusion === "failure") {
      body.push(
        "I could not found a index.html file in the zip archive.",
        "I found:",
        "```",
        ...c["index-found"].bundleFiles.map(fileName => ` - ${fileName}`),
        "```",
        "",
        "Can you make sure your game can be launched through a file named `index.html`?"
      );

      /**
       * bundle size
       */
    } else if (c["bundle-size"].conclusion === "failure") {
      body.push(
        "I am afraid your entry is too large!",
        `It weights ${c["bundle-size"].bundleSize}o, which is more than the ${c["bundle-size"].sizeLimit}o limit`,
        "",
        "Surely you can save a few bits here an there? 😀"
      );

      /**
       * console error
       */
    } else if (c["run-without-error"].conclusion === "failure") {
      body.push(
        "Your game seems to have error at launch with chrome",
        "I got this error:",
        "```",
        ...c["run-without-error"].errors,
        "```",
        `Can you take a look ? I have it deployed [here](${c["index-found"].deployUrl})`
      );

      /**
       * blank screen
       */
    } else if (c["run-without-blank-screen"].conclusion === "failure") {
      body.push(
        `Your game seems to have error at launch, all I can see is a [blank screen](${c["run-without-blank-screen"].screenShotUrl})`,
        `Can you take a look ? I have it deployed [here](${c["index-found"].deployUrl})`
      );

      /**
       * http
       */
    } else if (c["run-without-external-http"].conclusion === "failure") {
      body.push(
        `It seems that your game is making call to external resources, which is forbidden.`,
        `Can you take a look ? I have it deployed [here](${c["index-found"].deployUrl})`
      );
    }
  }

  body.push("");

  /**
   * meta
   */
  if (c["manifest-found"].conclusion === "failure") {
    body.push(
      "I could not found the manifest in the committed files.",
      "I found:",
      "```",
      ...c["manifest-found"].files.map(fileName => ` - ${fileName}`),
      "```",
      "",
      "Are you sure you committed a `manifest.json` file ?"
    );
  } else if (c["manifest-read"].conclusion === "failure") {
    body.push(
      "I could not read the manifest. It seems that it contains malformed json"
    );
  } else {
    if (c["name-found"].conclusion === "failure") {
      body.push("I could not found a name in the the manifest.");
    }
    if (c["description-found"].conclusion === "failure") {
      body.push("I could not found a description in the the manifest.");
    }
  }

  if (c["images-found"].conclusion === "failure") {
    body.push(
      ...Object.entries(c["images-found"].images)
        .filter(([, x]: any) => x.error)
        .map(([name, x]: any) => {
          switch (x.error) {
            case "size":
              return `The image \`${name}\` does not meet the requirement, it should have a ratio of ${x.target.width}x${x.target.height} (instead of ${x.origin.width}x${x.origin.height})`;
            case "not-found":
              return (
                `The image \`${name}\` was not found.` +
                (name !== x.filename
                  ? `according to the manifest, it should be named ${x.fileName}`
                  : "")
              );
          }
        })
    );
  }

  body.push("", buildCard(controls));

  return body.join("\n");
};

const buildCard = controls => {
  const { deployUrl, name, description, images } = extractInfo(controls);

  return [
    "<blockquote>",
    " <br>",
    images.image_thumbnail
      ? ` <img height="80" width="80" title="thumbnail" src="${images.image_thumbnail}" />`
      : "",
    images.image_large
      ? ` <img height="80" title="large image" src="${images.image_large}" />`
      : "",
    " <div>",
    `  <a href="${deployUrl}">`,
    `   <strong>${name || "game"}</strong>`,
    `  </a>`,
    "  <br>",
    "  " + (description ? description.split("\n").join("<br>") : ""),
    " </div>",
    " <br>",
    "</blockquote>"
  ].join("");
};
