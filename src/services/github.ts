import createApp from "github-app";
import * as config from "../config";
import Github, {
  PullRequestsListResponseItem,
  ReposListAssetsForReleaseResponseItem,
  ReposGetReleaseResponse,
  ChecksGetResponse,
  AppsGetInstallationResponse,
  AppsGetAuthenticatedResponse,
  ChecksUpdateParams
} from "@octokit/rest";

export type Check = Omit<ChecksGetResponse, "conclusion"> & {
  conclusion: ChecksUpdateParams["conclusion"];
};
export type PullRequest = PullRequestsListResponseItem;
export type Repository = PullRequest["head"]["repo"];
export type Asset = ReposListAssetsForReleaseResponseItem;
export type Release = ReposGetReleaseResponse;
export type Installation = AppsGetInstallationResponse;
export type App = AppsGetAuthenticatedResponse;

export type GithubClient = Github;

export const create = (installationId: number): GithubClient =>
  createApp({
    id: config.github.app_id,
    cert: config.github.app_private_key
  }).asInstallation(installationId);

export const listInstallations = async (): Promise<Installation[]> => {
  const github = await createApp({
    id: config.github.app_id,
    cert: config.github.app_private_key
  }).asApp();

  const { data: installations } = await github.apps.getInstallations({});

  return installations;
};

export const getApp = async (): Promise<App> => {
  const github = await createApp({
    id: config.github.app_id,
    cert: config.github.app_private_key
  }).asApp();

  const { data: app } = await github.apps.getAuthenticated({});

  return app;
};
