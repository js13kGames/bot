import * as fs from "fs";
import * as path from "path";
import { analyze } from "../analyze";
import { getRulesForCategory } from "js13kGames-bot-rules";
import { redact } from "./utils";

const FIXTURE_DIR = path.resolve(__dirname, "..", "__fixtures__");

jest.setTimeout(300 * 1000);

for (const file of fs.readdirSync(FIXTURE_DIR))
  it(`should analyze ${file}`, async () => {
    const rules = getRulesForCategory("webxr")!;

    const zip = fs.readFileSync(path.resolve(FIXTURE_DIR, file, "bundle.zip"));

    const report = await analyze(rules, zip);

    expect(redact(report)).toMatchSnapshot();
  });
