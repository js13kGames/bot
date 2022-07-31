import { APIGatewayProxyEvent } from "aws-lambda";
import Busboy from "busboy";
import { decode as decodeBase64 } from "@stablelib/base64";
import type { Readable } from "stream";

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
    const bb = Busboy({
      headers: { "content-type": readHeader(event, "content-type") },
    });

    bb.on("error", reject);

    const content: Record<string, File | string | string[]> = {};

    bb.on(
      "file",
      (
        name: string,
        file: Readable,
        filename: string,
        encoding: string,
        mimetype: string
      ) => {
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
      }
    );

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
