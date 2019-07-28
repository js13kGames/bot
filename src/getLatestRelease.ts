import { GithubClient, PullRequest } from "./services/github";

export const getLatestRelease = ({
  github
}: {
  github: GithubClient;
}) => async (pullRequest: PullRequest, commitSha?: string) => {
  const { data: releases } = await github.repos.listReleases({
    owner: pullRequest.head.repo.owner.login,
    repo: pullRequest.head.repo.name,
    per_page: 250
  });

  const { data: commits } = await github.pullRequests.listCommits({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    number: pullRequest.number,
    per_page: 250
  });

  const { data: tags } = await github.repos.listTags({
    owner: pullRequest.head.repo.owner.login,
    repo: pullRequest.head.repo.name,
    per_page: 250
  });

  /**
   * read all the commit, starting from the comitSha (or the latest)
   * to the first one of the PR
   *
   * look for tag on the commit, and look for release on that tag
   */
  for (const sha of removeAfter(commits.map(c => c.sha), commitSha).reverse()) {
    const tagNames = tags.filter(t => t.commit.sha === sha).map(t => t.name);
    const [release] = releases
      .filter(r => tagNames.includes(r.tag_name))
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));

    if (release) return { release, commitSha: sha };
  }
};

const removeAfter = <T>(arr: T[], x: T): T[] => {
  const i = arr.indexOf(x);
  return i === -1 ? arr : arr.slice(0, 1 + i);
};
