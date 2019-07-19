import { GithubClient, PullRequest } from "./services/github";

export const getLatestRelease = ({
  github
}: {
  github: GithubClient;
}) => async (pullRequest: PullRequest) => {
  const repository = pullRequest.head.repo;

  const { data: releases } = await github.repos.listReleases({
    owner: repository.owner.login,
    repo: repository.name
  });

  /**
   * assuming target_commitish is a branch
   * and so is head.ref
   */
  const [latestRelease] = releases
    .filter(r => r.target_commitish === pullRequest.head.ref)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const { data: tags } = await github.repos.listTags({
    owner: repository.owner.login,
    repo: repository.name
  });

  const tag =
    latestRelease && tags.find(t => t.name === latestRelease.tag_name);

  return (
    latestRelease && {
      release: latestRelease,
      sha: tag.commit.sha
    }
  );
};
