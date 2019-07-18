import { GithubClient } from "./services/github";
import { PullRequest } from "./types/github";
import * as config from "./config";

/**
 * read the comment left by the bot
 */
export const getComment = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest
) => {
  const { data: comments } = await github.issues.listComments({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    number: pullRequest.number,
    per_page: 100
  });

  const userLogin = config.github.app_name + "[bot]";

  const comment = comments.find(({ user }) => user.login === userLogin);

  return comment;
};

/**
 * set the comment
 * we want the bot to update the comment instead of creating new owes
 * to avoid spam
 */
export const setComment = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest,
  body: string
) => {
  const comment = await getComment({ github })(pullRequest);

  if (comment) {
    await github.issues.updateComment({
      owner: pullRequest.base.repo.owner.login,
      repo: pullRequest.base.repo.name,
      comment_id: comment.id,
      body
    });
  } else
    await github.issues.createComment({
      owner: pullRequest.base.repo.owner.login,
      repo: pullRequest.base.repo.name,
      number: pullRequest.number,
      body
    });
};
