import * as config from "../../config";
import * as querystring from "querystring";
import { extractInfo } from "../../analyze/control";

export const getSubmitUrl = ({
  user,
  name,
  description,
  images,
  repositoryName,
  bundleUrl
}: ReturnType<typeof extractInfo>) =>
  config.legacyFormSubmission.endpoint +
  "?" +
  querystring.stringify({
    author: user.name,
    twitter: user.twitter || "",
    website_url: user.website || "",
    title: name,
    description: description,
    github_url: `https://github.com/${user.github}/${repositoryName}`,
    file: bundleUrl.replace("http://", "https://").replace("s3-website", "s3"),
    small_screenshot: images.image_thumbnail,
    big_screenshot: images.image_large
  });
