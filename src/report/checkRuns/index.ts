import { generateBundleCheckRun } from "./generateBundleCheckRun";
import { generateMetaCheckRun } from "./generateMetaCheckRun";
import { generateGameCheckRun } from "./generateGameCheckRun";
import { generateSubmitCheckRun } from "./generateSubmitCheckRun";
import { Control } from "../../analyze/control";
import { CheckRun } from "../../services/github";

export const generateCheckRuns = (controls: Control[]): CheckRun[] =>
  [
    generateMetaCheckRun(controls),
    generateBundleCheckRun(controls),
    generateGameCheckRun(controls),
    controls.every(s => s.conclusion !== "failure") &&
      generateSubmitCheckRun(controls)
  ].filter(Boolean);
