import createApp from "github-app";
import * as config from "../config";
import Github from "@octokit/rest";

export type GithubClient = Github;

export const create = (installationId: number): GithubClient =>
  createApp({
    id: config.github.app_id,
    cert: config.github.app_private_key
  }).asInstallation(installationId);
