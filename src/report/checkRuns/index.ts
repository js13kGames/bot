import { generateBundleCheckRun } from "./generateBundleCheckRun";
import { generateMetaCheckRun } from "./generateMetaCheckRun";
import { generateGameCheckRun } from "./generateGameCheckRun";
import { Control } from "../../analyze/control";
import { CheckRun } from "../../services/github";

export const generateCheckRuns = (controls: Control[]): CheckRun[] =>
  [
    generateMetaCheckRun(controls),
    generateBundleCheckRun(controls),
    generateGameCheckRun(controls)
  ].filter(Boolean);
