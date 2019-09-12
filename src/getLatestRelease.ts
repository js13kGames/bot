import { GithubClient, PullRequest } from "./services/github";
import {
  pullsListAllCommits,
  reposListAllTags,
  reposListAllReleases
} from "./services/github/pagination";

export const getLatestRelease = ({
  github
}: {
  github: GithubClient;
}) => async (pullRequest: PullRequest, commitSha?: string) => {
  const releases = await reposListAllReleases(github)({
    owner: pullRequest.head.repo.owner.login,
    repo: pullRequest.head.repo.name
  });

  const commits = await pullsListAllCommits(github)({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    pull_number: pullRequest.number
  });

  const tags = await reposListAllTags(github)({
    owner: pullRequest.head.repo.owner.login,
    repo: pullRequest.head.repo.name
  });

  /**
   * read all the commit, starting from the comitSha (or the latest)
   * to the first one of the PR
   *
   * look for tag on the commit, and look for release on that tag
   */
  for (const sha of removeAfter(commits.map(c => c.sha), commitSha).reverse()) {
    const tagNames = tags.filter(t => t.commit.sha === sha).map(t => t.name);
    const releasesOnPr = releases
      .filter(r => tagNames.includes(r.tag_name))
      .sort((a, b) => (a.published_at < b.published_at ? 1 : -1));

    const [release] = releasesOnPr;

    if (release) return { release, commitSha: sha };
  }
};

const removeAfter = <T>(arr: T[], x: T): T[] => {
  const i = arr.indexOf(x);
  return i === -1 ? arr : arr.slice(0, 1 + i);
};
