import { GithubClient, Repository, Check } from "./services/github";

export const getChecks = ({ github }: { github: GithubClient }) => async (
  repository: Repository,
  sha: string,
  releaseId?: string | number
): Promise<Check[] | null> => {
  const {
    data: { check_runs: checkRuns }
  } = await github.checks.listForRef({
    owner: repository.owner.login,
    repo: repository.name,
    ref: sha
  });

  const checks: Check[] = checkRuns.filter(
    c => c.external_id.toString() === releaseId.toString()
  ) as any;

  return checks.length > 0 ? checks : null;
};

export const setChecks = ({ github }: { github: GithubClient }) => async (
  repository: Repository,
  sha: string,
  releaseId: string | number,
  checks: Check[]
) => {
  /**
   * get the current check runs
   */
  const {
    data: { check_runs: checkRuns }
  } = await github.checks.listForRef({
    owner: repository.owner.login,
    repo: repository.name,
    ref: sha
  });

  /**
   * create / update check runs
   */
  for (const check of checks) {
    const checkRun = checkRuns.find(cr => cr.name === name);

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
        name: name,
        head_sha: sha,
        status: "completed",
        external_id: releaseId.toString()
      });
  }
};
