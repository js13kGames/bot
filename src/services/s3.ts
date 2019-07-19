import S3 from "aws-sdk/clients/s3";
import * as config from "../config";
import mime from "mime-types";

export const createUploader = async (key: string) => {
  const s3 = new S3(config.awsDeploy);
  const bucketName = config.awsDeploy.bucketName;

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
        ContentType: mime.lookup(key) || undefined,
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
