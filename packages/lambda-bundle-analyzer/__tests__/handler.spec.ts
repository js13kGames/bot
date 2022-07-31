import { encode as encodeBase64 } from "@stablelib/base64";
import FormData from "form-data";
import * as fs from "fs";
import * as path from "path";
import { handle } from "../handler";

jest.setTimeout(300 * 1000);

it("should analyze", async () => {
  const filename = path.join(
    __dirname,
    "../../bundle-analyzer/__fixtures__/valid/bundle.zip"
  );

  const form = new FormData();
  form.append("category", "desktop");
  form.append("bundle", fs.readFileSync(filename));

  const result = await (handle as any)({
    headers: form.getHeaders(),
    isBase64Encoded: true,
    body: encodeBase64(form.getBuffer()),
  });

  expect(result?.statusCode).toBe(200);
  expect(result?.body).toBeDefined();
});
