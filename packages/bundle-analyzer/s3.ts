import * as S3 from "aws-sdk/clients/s3";
// @ts-ignore
import * as mime from "mime-types";

export const createUploader = (key: string) => {
  const s3 = new S3(getConfig());
  const bucketName = process.env.AWS_BUCKET_NAME!;
  const region = process.env.AWS_DEFAULT_REGION!;

  const upload = async (
    filename: string,
    body: string | Buffer | ArrayBuffer,
    options = {}
  ) => {
    const { Key } = await s3
      .upload({
        Bucket: bucketName,
        Key: key + "/" + filename,
        Body: body,
        ACL: "public-read",
        ContentType: mime.lookup(filename) || undefined,
        ...options,
      })
      .promise();

    return `http://${bucketName}.s3-website-${region}.amazonaws.com/${Key}`;
  };

  return { upload };
};

const getConfig = () => {
  const sessionToken = process.env.AWS_SESSION_TOKEN;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_DEFAULT_REGION;

  if (sessionToken) return { sessionToken };
  if (accessKeyId && secretAccessKey && region)
    return {
      accessKeyId,
      secretAccessKey,
      region,
    };
};
