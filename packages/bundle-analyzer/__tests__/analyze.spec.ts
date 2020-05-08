import * as fs from "fs";
import * as path from "path";
import { analyze } from "../analyze";

const FIXTURE_DIR = path.resolve(__dirname, "..", "__fixtures__");

jest.setTimeout(50000);

for (const file of fs.readdirSync(FIXTURE_DIR))
  it(`should anayze ${file}`, async () => {
    const rules = {
      bundle: { max_size: 13 * 1024 },
      game: { http_request_whitelist: [] },
    };

    const zip = fs.readFileSync(path.resolve(FIXTURE_DIR, file, "bundle.zip"));

    const { deployUrl, ...report } = await analyze(rules, zip);

    expect(report).toMatchSnapshot();
  });
