import { GithubClient, Repository, CheckRun } from "./services/github";
import * as config from "./config";

export const getCheckRuns = ({ github }: { github: GithubClient }) => async (
  repository: Repository,
  sha: string,
  releaseId?: string | number
): Promise<CheckRun[] | null> => {
  const {
    data: { check_runs: checkRuns }
  } = await github.checks.listForRef({
    owner: repository.owner.login,
    repo: repository.name,
    ref: sha
  });

  const checks: CheckRun[] = checkRuns.filter(
    c => c.external_id.toString() === releaseId.toString()
  ) as any;

  return checks.length > 0 ? checks : null;
};

export const setCheckRuns = ({ github }: { github: GithubClient }) => async (
  repository: Repository,
  sha: string,
  releaseId: string | number,
  checks: CheckRun[]
) => {
  /**
   * get the current check runs
   */
  const { data } = await github.checks.listForRef({
    owner: repository.owner.login,
    repo: repository.name,
    ref: sha
  });
  const checkRuns = data.check_runs.filter(
    cr => cr.app.id.toString() === config.github.app_id
  );

  /**
   * create / update check runs
   */
  for (const check of checks) {
    const checkRun = checkRuns.find(cr => cr.name === check.name);

    if (checkRun)
      await github.checks.update({
        ...check,
        check_run_id: checkRun.id,
        owner: repository.owner.login,
        repo: repository.name,
        status: "completed",
        external_id: releaseId.toString()
      });
    else
      await github.checks.create({
        ...check,
        owner: repository.owner.login,
        repo: repository.name,
        head_sha: sha,
        status: "completed",
        external_id: releaseId.toString()
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
        owner: repository.owner.login,
        repo: repository.name,
        status: "completed",
        external_id: releaseId.toString()
      });
  }
};
