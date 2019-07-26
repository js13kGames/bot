import { Control } from "../../analyze/control";
import { CheckRun } from "../../services/github";

export const generateGameCheckRun = (controls: Control[]): CheckRun => {
  const c: any = Object.fromEntries((controls || []).map(x => [x.name, x]));

  const summary = [];

  // release found
  summary.push(
    "",
    `## ${
      !c["index-found"] || c["index-found"].conclusion === "failure"
        ? "❌"
        : "✔️"
    } deploy`
  );
  if (!c["index-found"] || c["index-found"].conclusion === "failure")
    summary.push(
      `The game could not be deployed, check the bundle report to see why.`,
      "",
      `> Make sure that the bundle is valid first.`
    );
  else {
    summary.push(`The game is deployed [here](${c["index-found"].deployUrl})`);

    // errors
    summary.push(
      "",
      `## ${
        c["run-without-error"].conclusion === "failure" ? "❌" : "✔️"
      } errors`
    );
    if (c["run-without-error"].conclusion === "failure")
      summary.push(
        "The game appear to yield error in the console",
        "```",
        ...c["run-without-error"].errors.map(error => ` - ${error}`),
        "```",
        "",
        "> That's not a good sign, is the game broken ?"
      );
    else summary.push(`The game did not had any error`);

    // external resources
    summary.push(
      "",
      `## ${
        c["run-without-external-http"].conclusion === "failure" ? "❌" : "✔️"
      } external resources`
    );
    if (c["run-without-external-http"].conclusion === "failure")
      summary.push(
        "The game appear to make calls to external resources",
        "```",
        ...c["run-without-external-http"].externalUrls.map(url => ` - ${url}`),
        "```",
        "",
        "> This is cheating"
      );
    else
      summary.push(
        "The game made request to internal resources only, which is fine",
        "```",
        ...c["run-without-external-http"].urls.map(url => ` - ${url}`),
        "```"
      );

    // external resources
    summary.push(
      "",
      `## ${
        c["run-without-blank-screen"].conclusion === "failure" ? "❌" : "✔️"
      } blank screen`
    );
    if (c["run-without-blank-screen"].conclusion === "failure")
      summary.push(
        "The game appear to display a blank screen",
        `<img height="120" src="${c["run-without-blank-screen"].screenShotUrl}"/>`,
        "",
        "> That's not a good sign, is the game broken ?"
      );
    else
      summary.push(
        `The game seems to display something`,
        `<img height="120" src="${c["run-without-blank-screen"].screenShotUrl}"/>`
      );
  }

  return {
    name: "game",
    conclusion: [
      "run-without-error",
      "run-without-blank-screen",
      "run-without-external-http"
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
