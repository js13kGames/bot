import { Control, extractInfo } from "../../analyze/control";
import { CheckRun } from "../../services/github";

export const generateSubmitCheckRun = (controls: Control[]): CheckRun => {
  return {
    name: "submit",
    conclusion: "neutral" || "action_required",
    output: {
      title: "",
      summary: `<!--${JSON.stringify(extractInfo(controls))}-->`,
      text: ""
    },
    actions: [
      {
        label: "Submit",
        description: "Submit your entry and close this PR",
        identifier: "submit"
      }
    ]
  } as any;
};

export const extractInfoFormCheckRuns = (
  checkRuns: CheckRun[]
): ReturnType<typeof extractInfo> => {
  const submit = checkRuns.find(cr => cr.name === "submit");

  if (!submit) return null;

  const [, json = ""] = submit.output.summary.match(/^<!--(.*)-->$/m) || [];

  try {
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
};
