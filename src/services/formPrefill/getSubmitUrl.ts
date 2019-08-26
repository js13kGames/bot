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
  "/submit?" +
  querystring.stringify({
    author: user.name,
    twitter: user.twitter || "",
    website_url: user.website || "",
    title: name,
    description: description,
    github_url: `https://github.com/${user.github}/${repositoryName}`,
    file: bundleUrl,
    small_screenshot: images.image_thumbnail,
    big_screenshot: images.image_large
  });
