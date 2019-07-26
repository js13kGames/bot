import { Control } from "../../analyze/control";
import { CheckRun } from "../../services/github";

export const generateMetaCheckRun = (controls: Control[]): CheckRun => {
  const c: any = Object.fromEntries((controls || []).map(x => [x.name, x]));

  const summary = [];

  // file found
  summary.push(
    "",
    `## ${
      c["manifest-found"].conclusion === "failure" ? "❌" : "✔️"
    } manifest found`
  );
  if (c["manifest-found"].conclusion === "failure")
    summary.push(
      "The pull request does not contain a file named `manifest.json` in the committed files",
      "Those are the files found committed:",
      "```",
      ...c["manifest-found"].files.map(filename => ` - ${filename}`),
      "```",

      "",
      "> Make sure you commit a valid `manifest.json` file"
    );
  else {
    summary.push("The pull requet contains a file named `manifest.json`");

    // parsing
    summary.push(
      "",
      `## ${
        c["manifest-read"].conclusion === "failure" ? "❌" : "✔️"
      } manifest parsed`
    );
    if (c["manifest-read"].conclusion === "failure")
      summary.push(
        "The manifest does not appear to be a valid json file",

        "",
        "> Make sure you the manifest is a valid json file"
      );
    else {
      summary.push(
        "The manifest was found :",
        "```json",
        JSON.stringify(c["manifest-read"].manifest, null, 2),
        "```"
      );

      // meta
      summary.push(
        "",
        `## ${c["name-found"].conclusion === "failure" ? "❌" : "✔️"} game info`
      );
      if (c["name-found"].conclusion === "failure")
        summary.push(
          "The manifest does not contain a name",

          "",
          '> Make sure you the manifest declare the property `"name"`'
        );
      else summary.push(`The game name is "${c["name-found"].gameName}"`);

      summary.push("");

      if (c["description-found"].conclusion === "failure")
        summary.push(
          "The manifest does not contain a description",

          "",
          '> Make sure you the manifest declare the property `"description"`'
        );
      else
        summary.push(
          "The game description is:",
          "",
          c["description-found"].gameDescription
        );

      // images
      summary.push(
        "",
        `## ${
          c["images-found"].conclusion === "failure" ? "❌" : "✔️"
        } game images`
      );
      Object.entries(c["images-found"].images).forEach(([label, x]: any) => {
        summary.push(` - ${label}`, "");
        switch (x.error) {
          case "size":
            summary.push(
              ` The image does meet the size required. It should have a ratio of ${x.target.width}x${x.target.height}. But is ${x.origin.width}x${x.origin.height} instead.`
            );
            return;
          case "not-found":
            summary.push(
              ` The image was not found.` +
                (label !== x.filename
                  ? `according to the manifest, it should be named ${x.fileName}`
                  : "")
            );
            return;

          default:
            summary.push(`<img height="100" src="${x}" />`);
            return;
        }
      });
    }
  }

  return {
    name: "meta",
    conclusion: [
      "description-found",
      "images-found",
      "name-found",
      "manifest-found",
      "manifest-read"
    ].every(name => c[name].conclusion !== "failure")
      ? "success"
      : "failure",
    output: {
      title: "",
      summary: summary.join("\n"),
      text: ""
    }
  } as any;
};
