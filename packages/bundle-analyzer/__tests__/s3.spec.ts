import { getHash } from "../md5";
import { upload } from "../s3";

jest.setTimeout(20 * 1000);

it("should upload to s3", async () => {
  const dir = getHash("test");
  const value = Math.random().toString(36).slice(-6);

  const publicUrl = await upload(dir + "/" + value + ".txt", value);

  const content = await fetch(publicUrl).then((res) => res.text());

  expect(content).toBe(value);
});
