// @ts-ignore
import * as Zip from "node-zip";

export const unzip = (
  bundleContent: Buffer
): { filename: string; content: Buffer }[] => {
  const zip = Zip(Buffer.from(bundleContent).toString("base64"), {
    base64: true,
    checkCRC32: true,
  });

  return Object.entries(zip.files)
    .filter(([, file]: any) => !file.dir)
    .map(([filename, file]: any) => ({
      filename,
      content: file.asNodeBuffer(),
    }));
};
