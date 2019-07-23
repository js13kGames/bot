import { create, GithubClient } from "../services/github";
import { analyzeRelease } from "../analyze/analyzeRelease";
import { setChecks } from "../checkRuns";
import { generateReport } from "../report";
import { setComment } from "../comment";
import { getLatestRelease } from "../getLatestRelease";
import { generateChecks, parseChecks } from "../report/checks";
import { Control } from "../analyze/control";

jest.setTimeout(60000);

export const bootstrap = ({ pullRequest, installation }) => {
  let re;
  let controls: Control[];
  let github: GithubClient;

  it("should init github client", async () => {
    github = await create(installation.id);

    expect(github).toBeTruthy();
  });

  it("should get the latest release", async () => {
    re = await getLatestRelease({ github })(pullRequest);

    expect(re).toBeTruthy();
  });

  it("should analyze", async () => {
    controls = await analyzeRelease({ github })(re.release);

    expect(controls).toMatchSnapshot();
  });

  it("should generate report", () => {
    const report = generateReport(re.release, controls);

    expect(report).toMatchSnapshot();
  });

  it("should generate checks", () => {
    const checks = generateChecks(controls);

    expect(checks).toMatchSnapshot();
  });

  it("generateChecks / parseChecks should be idempotent", () => {
    expect(parseChecks(generateChecks(controls))).toEqual(controls);
  });

  it("should report", async () => {
    await setComment({ github })(
      pullRequest,
      generateReport(re.release, controls)
    );
  });

  it("should report checks", async () => {
    await setChecks({ github })(
      pullRequest.base.repo,
      re.sha,
      re.release.id,
      generateChecks(controls)
    );
  });
};
