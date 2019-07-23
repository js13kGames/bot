import { GithubClient, Repository } from "./services/github";
import { Check } from "./analyze/check";

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

  const checks: Check[] = checkRuns
    .filter(c => c.external_id.toString() === releaseId.toString())
    .map(c => ({ name: c.name, status: c.conclusion })) as any;

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
  for (const { name, conclusion } of checks) {
    const checkRun = checkRuns.find(cr => cr.name === name);

    if (checkRun)
      await github.checks.update({
        check_run_id: checkRun.id,
        owner: repository.owner.login,
        repo: repository.name,
        status: "completed",
        conclusion,
        external_id: releaseId.toString()
      });
    else
      await github.checks.create({
        owner: repository.owner.login,
        repo: repository.name,
        name: name,
        head_sha: sha,
        status: "completed",
        conclusion,
        external_id: releaseId.toString()
      });
  }
};
