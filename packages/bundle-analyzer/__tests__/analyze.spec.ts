import * as fs from "fs";
import * as path from "path";
import { analyze } from "../analyze";
import { getRulesForCategory } from "js13kGames-bot-rules";

const FIXTURE_DIR = path.resolve(__dirname, "..", "__fixtures__");

jest.setTimeout(50000);

for (const file of fs.readdirSync(FIXTURE_DIR))
  it(`should analyze ${file}`, async () => {
    const rules = getRulesForCategory("webxr")!;

    const zip = fs.readFileSync(path.resolve(FIXTURE_DIR, file, "bundle.zip"));

    const report = await analyze(rules, zip);
    const genericReport = removeEnvSpecificData(report);

    expect(genericReport).toMatchSnapshot();
  });

// redact the actual bucket name from the report
// so the report is the same regardless of the bucket name
const removeEnvSpecificData = (o: Object) =>
  JSON.parse(
    JSON.stringify(o).replace(
      new RegExp(process.env.AWS_BUCKET_NAME!, "g"),
      "<bucketName>"
    )
  );
