import { PullRequest, GithubClient, getApp } from "./services/github";
import { issuesListAllComments } from "./services/github/pagination";

/**
 * read the comment left by the bot
 */
export const getComment = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest
) => {
  const comments = await issuesListAllComments(github)({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    issue_number: pullRequest.number
  });

  const { data: app } = await getApp();
  const userLogin = app.name.toLowerCase() + "[bot]";

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
