import { decode } from "base-64";

export const github = {
  app_id: process.env.GITHUB_APP_ID,
  app_name: process.env.GITHUB_APP_NAME,
  app_secret: process.env.GITHUB_APP_SECRET,
  app_private_key: decode(process.env.GITHUB_APP_PRIVATE_KEY_B64),

  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET
};

export const browserstack = {
  user: process.env.BROWSERSTACK_USER,
  key: process.env.BROWSERSTACK_KEY
};

export const awsDeploy = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  bucketName: process.env.AWS_BUCKET_NAME
};
