import { analyzeRelease } from "./analyze/analyzeRelease";
import { getChecks, setChecks } from "./checkRuns";
import { setComment, getComment } from "./comment";
import { generateReport } from "./report";
import { GithubClient, PullRequest } from "./services/github";
import { getLatestRelease } from "./getLatestRelease";
import { generateChecks } from "./report/checks";

export const collectAnalyzeReport = ({
  github
}: {
  github: GithubClient;
}) => async (pullRequest: PullRequest) => {
  /**
   * get the latest release
   */
  const re = await getLatestRelease({ github })(pullRequest);

  /**
   * if there is not release yet
   */
  if (!re) {
    /**
     * leave a comment, only if it does not already exists
     */
    if (!(await getComment({ github })(pullRequest)))
      await setComment({ github })(pullRequest, generateReport());
    return;
  }

  /**
   * if there is already a check for this release, ignore
   */
  const previousChecks = await getChecks({ github })(
    pullRequest.base.repo,
    re.sha,
    re.release.id
  );
  if (previousChecks) return;

  /**
   * analyze the release
   */
  const newControls = await analyzeRelease({ github })(re.release);

  /**
   * report as comment
   */
  await setComment({ github })(
    pullRequest,
    generateReport(re.release, newControls)
  );

  /**
   * report as run checks
   */
  await setChecks({ github })(
    pullRequest.base.repo,
    re.sha,
    re.release.id,
    generateChecks(newControls)
  );
};
