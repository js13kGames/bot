import S3 from "aws-sdk/clients/s3";
import * as config from "../config";
import mime from "mime-types";

const wait = (delay = 0) => new Promise(r => setTimeout(r, delay));

const prepareBucket = ({ s3 }) => async (bucketName: string) => {
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

      if (error.code === "OperationAborted")
        return wait(100).then(() => prepareBucket({ s3 })(bucketName));

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
    .promise()
    .catch(error => {
      if (error.code === "OperationAborted")
        return wait(100).then(() => prepareBucket({ s3 })(bucketName));

      throw error;
    });
};

export const createUploader = async (key: string) => {
  const s3 = new S3(config.awsDeploy);
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
