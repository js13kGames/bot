import Github, {
  PullsListResponseItem,
  ReposListAssetsForReleaseResponseItem,
  ReposGetReleaseResponse,
  ChecksGetResponse,
  AppsGetInstallationResponse,
  AppsGetAuthenticatedResponse,
  ChecksUpdateParams,
  ChecksGetSuiteResponse,
  PullsListFilesResponseItem,
  ReposGetCommitResponse
} from "@octokit/rest";

export type Commit = ReposGetCommitResponse;
export type PullRequest = PullsListResponseItem;
export type Repository = PullRequest["head"]["repo"];
export type Asset = ReposListAssetsForReleaseResponseItem;
export type Release = ReposGetReleaseResponse;
export type Installation = AppsGetInstallationResponse;
export type App = AppsGetAuthenticatedResponse;
export type File = PullsListFilesResponseItem;
export type CheckSuite = Omit<ChecksGetSuiteResponse, "pull_requests"> & {
  pull_requests: PullRequest[];
};
export type CheckRun = Omit<ChecksGetResponse, "conclusion"> & {
  conclusion: ChecksUpdateParams["conclusion"];
};

export type GithubClient = Github;

type GenericEventPayload = {
  repository: Repository;
  sender: Repository["owner"];
  installation: {
    id: number;
  };
};
export type Event = (
  | {
      eventName: "pull_request";
      action: "synchronize";
      pull_request: PullRequest;
      before: string;
      after: string;
    }
  | {
      eventName: "pull_request";
      action: "opened";
      pull_request: PullRequest;
    }
  | {
      eventName: "pull_request";
      action: "reopened";
      pull_request: PullRequest;
    }
  | {
      eventName: "check_suite";
      action: "rerequested";
      check_suite: CheckSuite;
    }
  | {
      eventName: "check_run";
      action: "requested_action";
      check_run: CheckRun;
      requested_action: {
        identifier: "submit";
      };
    }
  | {
      eventName: "check_run";
      action: "rerequested";
      check_run: CheckRun;
    }) &
  GenericEventPayload;
