import { GithubClient, CheckRun, PullRequest } from "./services/github";
import * as config from "./config";

export const getCheckRuns = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest,
  sha: string,
  releaseId: string | number
): Promise<CheckRun[] | null> => {
  const {
    data: { check_runs: checkRuns }
  } = await github.checks.listForRef({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    ref: sha
  });

  const checks: CheckRun[] = checkRuns.filter(
    c =>
      c.app.id.toString() === config.github.app_id.toString() &&
      c.external_id.toString() === `${releaseId}#${pullRequest.number}`
  ) as any;

  return checks.length > 0 ? checks : null;
};

export const setCheckRuns = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest,
  sha: string,
  releaseId: string | number | null,
  checks: CheckRun[]
) => {
  /**
   * get the current check runs
   */
  const { data } = await github.checks.listForRef({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    ref: sha
  });
  const checkRuns = data.check_runs.filter(
    cr => cr.app.id.toString() === config.github.app_id
  );

  const external_id = `${releaseId || ""}#${pullRequest.number}`;

  /**
   * create / update check runs
   */
  for (const check of checks) {
    const checkRun = checkRuns.find(cr => cr.name === check.name);

    if (checkRun)
      await github.checks.update({
        ...check,
        check_run_id: checkRun.id,
        owner: pullRequest.base.repo.owner.login,
        repo: pullRequest.base.repo.name,
        status: "completed",
        external_id
      });
    else
      await github.checks.create({
        ...check,
        owner: pullRequest.base.repo.owner.login,
        repo: pullRequest.base.repo.name,
        head_sha: sha,
        status: "completed",
        external_id
      });
  }

  /**
   * "remove" other check runs
   */
  for (const checkRun of checkRuns) {
    if (!checks.some(check => checkRun.name === check.name))
      await github.checks.update({
        check_run_id: checkRun.id,
        name: "[deleted]" + checkRun.id,
        conclusion: "success",
        output: { title: "", text: "", summary: "" },
        owner: pullRequest.base.repo.owner.login,
        repo: pullRequest.base.repo.name,
        status: "completed",
        external_id
      });
  }
};
