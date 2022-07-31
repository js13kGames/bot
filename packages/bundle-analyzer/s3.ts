import * as mime from "mime-types";
import { AwsClient } from "aws4fetch";
import * as crypto from "crypto";

(global as any).crypto = crypto;

let client: AwsClient;

const getClient = () =>
  (client =
    client ??
    new AwsClient({
      accessKeyId: process.env.SCALEWAY_ACCESS_KEY!,
      secretAccessKey: process.env.SCALEWAY_SECRET_KEY!,

      region: process.env.SCALEWAY_REGION!,

      service: "s3",
    }));

const endpoint = process.env.SCALEWAY_S3_ENDPOINT!;
const bucketName = process.env.SUBMISSION_BUCKET_NAME!;

export const upload = async (
  key: string,
  body: Uint8Array | ArrayBuffer | string
) => {
  const contentType = mime.lookup(key);

  const res = await getClient().fetch(`${endpoint}/${bucketName}/${key}`, {
    method: "PUT",
    body,
    headers: {
      "x-amz-acl": "public-read",
      ...(contentType && { "content-type": contentType }),
    },
  });

  if (!res.ok) throw new Error(res.statusText);

  return getPublicUri(bucketName, key);
};

const getPublicUri = (bucket: string, key: string) => {
  const u = new URL(endpoint);

  u.host = bucket + "." + u.host;
  u.pathname = "/" + key;

  return u.toString();
};
