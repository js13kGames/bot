import * as config from "../config";
import FormData from "form-data";
import { promisify } from "util";
import fetch from "node-fetch";

export const submit = async ({ user, game, imagesUrls, bundleUrl }) => {
  const form = new FormData();

  form.append("token", config.legacyFormSubmission.token);

  form.append("author", user.name);
  form.append("twitter", user.twitter || "");
  form.append("website_url", user.website || "");

  form.append("title", game.name);
  form.append("description", game.description);
  form.append("github_url", game.repositoryUrl || "");

  form.append(
    "file",
    Buffer.from(await fetch(bundleUrl).then(res => res.arrayBuffer()))
  );
  form.append(
    "small_screenshot",
    Buffer.from(
      await fetch(imagesUrls.image_thumbnail).then(res => res.arrayBuffer())
    )
  );
  form.append(
    "big_screenshot",
    Buffer.from(
      await fetch(imagesUrls.image_large).then(res => res.arrayBuffer())
    )
  );

  console.log(form);

  await promisify(form.submit.bind(form))(config.legacyFormSubmission.endpoint);
};
