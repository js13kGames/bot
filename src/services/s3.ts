import S3 from "aws-sdk/clients/s3";
import * as config from "../config";
import mime from "mime-types";
import { wait } from "../utils/wait";

const prepareBucket = ({ s3 }) => async (bucketName: string) => {
  try {
    /**
     * ensure bucket exist
     */
    await s3
      .createBucket({
        Bucket: bucketName,
        ACL: "public-read"
      })
      .promise()
      .catch(error => {
        if (error.code === "BucketAlreadyOwnedByYou") return;

        throw error;
      });

    /**
     * and have the proper configuration
     */
    await s3
      .putBucketWebsite({
        Bucket: bucketName,
        WebsiteConfiguration: {
          IndexDocument: {
            Suffix: "index.html"
          }
        }
      })
      .promise();

    await s3
      .putBucketCors({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: [],
              AllowedMethods: ["GET"],
              AllowedOrigins: ["*"],
              ExposeHeaders: [],
              MaxAgeSeconds: 3000
            }
          ]
        }
      })
      .promise();
  } catch (error) {
    if (error.code === "OperationAborted")
      return wait(100).then(() => prepareBucket({ s3 })(bucketName));

    throw error;
  }
};

export const createUploader = async (key: string) => {
  const s3 = new S3(
    (config.awsDeploy.sessionToken && {
      sessionToken: config.awsDeploy.sessionToken
    }) ||
      (config.awsDeploy.accessKeyId && {
        accessKeyId: config.awsDeploy.accessKeyId,
        secretAccessKey: config.awsDeploy.secretAccessKey
      }) ||
      {}
  );
  const bucketName = config.awsDeploy.bucketName;

  await prepareBucket({ s3 })(bucketName);

  const upload = async (
    filename: string,
    body: string | Buffer | ArrayBuffer,
    options = {}
  ) => {
    /**
     * upload file
     */
    const data = await s3
      .upload({
        Bucket: bucketName,
        Key: key + "/" + filename,
        Body: body,
        ACL: "public-read",
        ContentType: mime.lookup(filename) || undefined,
        ...options
      })
      .promise();

    /**
     * build website url
     */
    const url = `http://${bucketName}.s3-website-${config.awsDeploy.region}.amazonaws.com/${data.Key}`;

    return url;
  };

  return { upload };
};
