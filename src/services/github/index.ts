import * as config from "../../config";
export * from "./type";

import { App } from "@octokit/app";
import GithubClient from "@octokit/rest";

const createApp = () =>
  new App({
    id: +config.github.app_id,
    privateKey: config.github.app_private_key
  });

export const create = async (installationId: number) => {
  const app = createApp();

  const token = await app.getInstallationAccessToken({ installationId });

  const github = new GithubClient({ auth: "token " + token });

  return github;
};

export const listInstallations = () => {
  const app = createApp();

  const token = app.getSignedJsonWebToken();

  const github = new GithubClient({ auth: "Bearer " + token });

  return github.apps.listInstallations({});
};

export const getApp = () => {
  const app = createApp();

  const token = app.getSignedJsonWebToken();

  const github = new GithubClient({ auth: "Bearer " + token });

  return github.apps.getAuthenticated({});
};
