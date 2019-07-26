import { getCheckRuns, setCheckRuns } from "./checkRuns";
import { setComment, getComment } from "./comment";
import { generateReport } from "./report";
import { GithubClient, PullRequest } from "./services/github";
import { getLatestRelease } from "./getLatestRelease";
import { generateCheckRuns } from "./report/checkRuns";
import { analyze } from "./analyze";

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
  const previousCheckRuns = await getCheckRuns({ github })(
    pullRequest.base.repo,
    re.sha,
    re.release.id
  );
  if (previousCheckRuns) return;

  /**
   * analyze the release
   */
  const newControls = await analyze({ github })(pullRequest, re.release);

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
  await setCheckRuns({ github })(
    pullRequest.base.repo,
    re.sha,
    re.release.id,
    generateCheckRuns(newControls)
  );
};
