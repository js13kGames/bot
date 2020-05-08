import { APIGatewayProxyEvent } from "aws-lambda";
import * as Busboy from "busboy";
import { decodeBase64 } from "tweetnacl-util";

export type File = {
  filename: string;
  encoding: string;
  mimetype: string;
  content: Buffer;
};

export const parseBody = (
  event: APIGatewayProxyEvent
): Promise<Record<string, File | string | string[]>> =>
  new Promise((resolve, reject) => {
    const bb = new Busboy({
      headers: { "content-type": readHeader(event, "content-type") },
    });

    bb.on("error", reject);

    const content: Record<string, File | string | string[]> = {};

    bb.on("file", (name, file, filename, encoding, mimetype) => {
      const parts: Buffer[] = [];
      file
        .on("data", (data) => {
          parts.push(data);
        })
        .on(
          "end",
          () =>
            (content[name] = {
              filename,
              encoding,
              mimetype,
              content: Buffer.concat(parts),
            })
        );
    });

    bb.on("field", (name, value) => {
      if (!(name in content)) {
        content[name] = value;
      } else {
        const c0 = content[name];
        if (typeof c0 === "string") content[name] = [c0];

        const c = content[name];
        if (Array.isArray(c)) c.push(value);
      }
    });

    bb.on("finish", () => resolve(content));

    if (event.body && event.isBase64Encoded) {
      console.log(decodeBase64(event.body));

      bb.write(decodeBase64(event.body));
    }
    if (event.body && !event.isBase64Encoded) {
      bb.write(event.body);
    }
    bb.end();
  });

const readHeader = (event: APIGatewayProxyEvent, name: string) => {
  for (const key in event.headers) {
    if (key.toLowerCase() === name.toLowerCase()) return event.headers[key];
  }
};
