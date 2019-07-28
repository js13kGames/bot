import createApp from "github-app";
import * as config from "../config";
import Github, {
  PullRequestsListResponseItem,
  ReposListAssetsForReleaseResponseItem,
  ReposGetReleaseResponse,
  ChecksGetResponse,
  AppsGetInstallationResponse,
  AppsGetAuthenticatedResponse,
  ChecksUpdateParams,
  ChecksGetSuiteResponse,
  PullRequestsListFilesResponseItem,
  ReposGetCommitResponse
} from "@octokit/rest";

export type Commit = ReposGetCommitResponse;
export type PullRequest = PullRequestsListResponseItem;
export type Repository = PullRequest["head"]["repo"];
export type Asset = ReposListAssetsForReleaseResponseItem;
export type Release = ReposGetReleaseResponse;
export type Installation = AppsGetInstallationResponse;
export type App = AppsGetAuthenticatedResponse;
export type File = PullRequestsListFilesResponseItem;
export type CheckSuite = Omit<ChecksGetSuiteResponse, "pull_requests"> & {
  pull_requests: PullRequest[];
};
export type CheckRun = Omit<ChecksGetResponse, "conclusion"> & {
  conclusion: ChecksUpdateParams["conclusion"];
};

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

  const { data: installations } = await github.apps.listInstallations({});

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

type GenericEventPayload = {
  repository: Repository;
  sender: Repository["owner"];
  installation: {
    id: number;
  };
};
export type Event =
  | {
      name: "pull_request";
      payload: {
        action: "synchronize";
        pull_request: PullRequest;
        before: string;
        after: string;
      } & GenericEventPayload;
    }
  | {
      name: "pull_request";
      payload: {
        action: "open";
        pull_request: PullRequest;
      } & GenericEventPayload;
    }
  | {
      name: "check_suite";
      payload: {
        action: "rerequested";
        check_suite: CheckSuite;
      } & GenericEventPayload;
    }
  | {
      name: "check_run";
      payload: {
        action: "rerequested";
        check_run: CheckRun;
      } & GenericEventPayload;
    };
