import { analyze, formatReport } from "js13kGames-bot-bundle-analyzer/analyze";
import { parseBody, File } from "./parseBody";
import {
  isValidCategory,
  mergeRules,
  getRulesForCategory,
} from "js13kGames-bot-rules";
import { wrapHandle } from "./wrapHandle";

export const handle = wrapHandle(async (event) => {
  console.log(JSON.stringify(event));

  const body = await parseBody(event);

  const bundle: File = body.bundle as any;

  const categories = (
    Array.isArray(body.category) ? body.category : [body.category]
  ).filter(isValidCategory);

  const rules = mergeRules(...categories.map(getRulesForCategory));

  if (!rules) return { categories, rules, checks: [] };

  const report = await analyze(rules, bundle.content);

  return { categories, rules, ...formatReport(report) };
});
