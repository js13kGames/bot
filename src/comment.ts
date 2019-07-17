import { GithubClient } from "./services/github";
import { PullRequest } from "./types/github";
import * as config from "./config";
import { parseReport, Report, generateReport } from "./report";

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

/**
 * read the comment and extract the report
 */
export const getReport = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest
): Promise<Report | null> => {
  const comment = await getComment({ github })(pullRequest);

  return comment ? parseReport(comment.body) : null;
};

/**
 * format the report and set the comment
 */
export const setReport = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest,
  report: Report
) => setComment({ github })(pullRequest, generateReport(report));
