import { decode } from "base-64";

export const github = {
  app_id: process.env.GITHUB_APP_ID,
  app_secret: process.env.GITHUB_APP_SECRET,
  app_private_key: decode(process.env.GITHUB_APP_PRIVATE_KEY_B64),

  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET,

  webhook_url: process.env.GITHUB_WEBHOOK_URL
};

export const browserstack = {
  user: process.env.BROWSERSTACK_USER,
  key: process.env.BROWSERSTACK_KEY
};

export const cloudinary = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  api_key: process.env.CLOUDINARY_API_KEY
};

export const awsDeploy = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  bucketName: process.env.AWS_BUCKET_NAME
};

export const awsSqs = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  queueName: process.env.AWS_SQS_QUEUE_NAME,
  queueArn: process.env.AWS_SQS_QUEUE_ARN
};

export const rules = {
  images: {
    image_thumbnail: {
      width: 100,
      height: 100
    },
    image_large: {
      width: 300,
      height: 200
    }
  },
  bundleSizeLimit: 13 * 1024
};
