import { generateBundleCheck } from "./generateBundleCheck";
import { generateMetaCheck } from "./generateMetaCheck";
import { generateGameCheck } from "./generateGameCheck";
import { Control } from "../../analyze/control";
import { Check } from "../../services/github";

export const generateChecks = (controls: Control[]): Check[] => [
  generateMetaCheck(controls),
  generateBundleCheck(controls),
  generateGameCheck(controls)
];
