import { GithubClient } from "./type";
import {
  ReposListReleasesParams,
  ReposListTagsParams,
  ReposListTagsResponseItem,
  ReposListReleasesResponseItem,
  PullsListCommitsParams,
  PullsListCommitsResponseItem,
  IssuesListCommentsParams,
  IssuesListCommentsResponseItem
} from "@octokit/rest";

export const reposListAllReleases = (github: GithubClient) => (
  o: ReposListReleasesParams
): Promise<ReposListReleasesResponseItem[]> =>
  github.paginate(github.repos.listReleases.endpoint.merge(o));

export const reposListAllTags = (github: GithubClient) => (
  o: ReposListTagsParams
): Promise<ReposListTagsResponseItem[]> =>
  github.paginate(github.repos.listTags.endpoint.merge(o));

export const pullsListAllCommits = (github: GithubClient) => (
  o: PullsListCommitsParams
): Promise<PullsListCommitsResponseItem[]> =>
  github.paginate(github.pulls.listCommits.endpoint.merge(o));

export const issuesListAllComments = (github: GithubClient) => (
  o: IssuesListCommentsParams
): Promise<IssuesListCommentsResponseItem[]> =>
  github.paginate(github.issues.listComments.endpoint.merge(o));
