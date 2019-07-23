import * as event from "../__fixtures__/no-release/event";
import { create, GithubClient } from "../services/github";
import { generateReport } from "../report";
import { setComment } from "../comment";
import { getLatestRelease } from "../getLatestRelease";

jest.setTimeout(40000);

describe("integration  no-release", () => {
  const { pullRequest, installation } = event;

  let github: GithubClient;

  it("should init github client", async () => {
    github = await create(installation.id);

    expect(github).toBeTruthy();
  });

  it("should get the latest release", async () => {
    const re = await getLatestRelease({ github })(pullRequest);

    expect(!re).toBeTruthy();
  });

  it("should generate report", () => {
    const report = generateReport();

    expect(report).toMatchSnapshot();
  });

  it("should report", async () => {
    await setComment({ github })(pullRequest, generateReport());
  });
});
