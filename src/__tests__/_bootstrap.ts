import { create } from "../services/github";
import { analyzeRelease } from "../analyze/analyzeRelease";
import { setChecks } from "../checkRuns";
import { generateReport } from "../report";
import { setComment } from "../comment";
import { getLatestRelease } from "../getLatestRelease";

jest.setTimeout(60000);

export const bootstrap = ({ pullRequest, installation }) => {
  let checks;
  let re;

  it("should get the latest release", async () => {
    const github = await create(installation.id);
    re = await getLatestRelease({ github })(pullRequest);

    expect(re).toBeTruthy();
  });

  it("should analyze", async () => {
    const github = await create(installation.id);

    checks = await analyzeRelease({ github })(re.release);

    expect(checks).toMatchSnapshot();
  });

  it("should generate report", () => {
    const report = generateReport(re.release, checks);

    expect(report).toMatchSnapshot();
  });

  it("should report", async () => {
    const github = await create(installation.id);

    await setComment({ github })(
      pullRequest,
      generateReport(re.release, checks)
    );

    await setChecks({ github })(
      pullRequest.base.repo,
      re.sha,
      re.release.id,
      checks
    );
  });
};
