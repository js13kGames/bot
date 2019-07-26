import { Control } from "../../analyze/control";
import { CheckRun } from "../../services/github";

export const generateBundleCheckRun = (controls: Control[]): CheckRun => {
  const c: any = Object.fromEntries((controls || []).map(x => [x.name, x]));

  const summary = [];

  // release found
  summary.push(
    "",
    `## ${c["release-found"].conclusion === "failure" ? "❌" : "✔️"} release`
  );
  if (c["release-found"].conclusion === "failure")
    summary.push(
      `The branch of the pull request ${c["release-found"].banch} does not contain any release.`,
      "",
      `> Submit a release on ${c["release-found"].banch} which contains your bundle.zip as asset.`,
      "> Read this [guide](.) if you are stuck"
    );
  else {
    summary.push(`The release \`${c["release-found"].tagName}\` was found`);

    // parsing
    summary.push(
      "",
      `## ${c["bundle-found"].conclusion === "failure" ? "❌" : "✔️"} bundle`
    );
    if (c["bundle-found"].conclusion === "failure")
      summary.push(
        "The release assets does not contain a zip file",
        "Those are the files found as assets:",
        "```",
        ...c["bundle-found"].assetFiles.map(filename => ` - ${filename}`),
        "```",
        "",
        "> Make sure to have a zip file as asset",
        "> Read this [guide](.) if you are stuck"
      );
    else {
      summary.push("The bundle was found");

      // unzip
      summary.push(
        "",
        `## ${
          c["bundle-unzipped"].conclusion === "failure" ? "❌" : "✔️"
        } game info`
      );
      if (c["bundle-unzipped"].conclusion === "failure")
        summary.push(
          "The bundle appear to not be a valid zip file.",
          "",
          "> Make sure you the zip is valid"
        );
      else {
        summary.push(`The bundle was unzipped"`);

        // index
        summary.push(
          "",
          `## ${
            c["index-found"].conclusion === "failure" ? "❌" : "✔️"
          } index file`
        );
        if (c["index-found"].conclusion === "failure")
          summary.push(
            "The bundle appear to not contain a `index.html` file",
            "Those are the files found as assets:",
            "```",
            ...c["index-found"].bundleFiles.map(filename => ` - ${filename}`),
            "```",
            "",
            "> Make sure the bundle contains an `index.html` file"
          );
        else summary.push(`The index was found`);

        // size
        summary.push(
          "",
          `## ${
            c["bundle-size"].conclusion === "failure" ? "❌" : "✔️"
          } bundle size`
        );
        if (c["bundle-size"].conclusion === "failure")
          summary.push(
            "The bundle appear to be over the size limit",
            `${c["bundle-size"].bundleSize}o > ${c["bundle-size"].sizeLimit}o`,
            "",
            "> Compress a little more"
          );
        else summary.push(`The bundle size is ok`);
      }
    }
  }

  return {
    name: "bundle",
    conclusion: [
      "release-found",
      "bundle-found",
      "bundle-unzipped",
      "index-found",
      "bundle-size"
    ].every(name => c[name] && c[name].conclusion !== "failure")
      ? "success"
      : "failure",
    output: {
      title: "",
      summary: summary.join("\n"),
      text: ""
    }
  } as any;
};
