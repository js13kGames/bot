import { Repository } from "./types/github";
import { Check } from "./analyze/check";

export const getLatestRelease = ({ github }) => async (
  repository: Repository
) => {
  const { data: latestRelease } = await github.repos.getLatestRelease({
    owner: repository.owner.login,
    repo: repository.name
  });

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

export const getChecks = ({ github }) => async (
  repository: Repository,
  sha: string,
  releaseId?: string | number
): Promise<Check[]> => {
  const {
    data: { check_runs: checkRuns }
  } = await github.checks.listForRef({
    owner: repository.owner.login,
    repo: repository.name,
    ref: sha
  });

  const checks = checkRuns
    .filter(c => c.external_id.toString() === releaseId.toString())
    .map(c => ({ name: c.name, status: c.conclusion }));

  return checks.length > 0 ? checks : null;
};

export const setChecks = ({ github }) => async (
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
