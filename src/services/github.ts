import createApp from "github-app";
import * as config from "../config";
import Github, {
  PullRequestsListResponseItem,
  ReposListAssetsForReleaseResponseItem,
  ReposGetReleaseResponse,
  ChecksGetResponse
  // ReposGetResponse,
} from "@octokit/rest";

export type Check = ChecksGetResponse;
export type PullRequest = PullRequestsListResponseItem;
export type Repository = PullRequest["head"]["repo"];
export type Asset = ReposListAssetsForReleaseResponseItem;
export type Release = ReposGetReleaseResponse;
// export type Repository = ReposGetResponse;

export type GithubClient = Github;

export const create = (installationId: number): GithubClient =>
  createApp({
    id: config.github.app_id,
    cert: config.github.app_private_key
  }).asInstallation(installationId);
