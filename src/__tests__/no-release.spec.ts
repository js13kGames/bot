import * as event from "../__fixtures__/no-release/event";
import { create } from "../services/github";
import { generateReport } from "../report";
import { setComment } from "../comment";
import { getLatestRelease } from "../getLatestRelease";

jest.setTimeout(40000);

describe("integration  no-release", () => {
  const { pullRequest, installation } = event;

  it("should get the latest release", async () => {
    const github = await create(installation.id);
    const re = await getLatestRelease({ github })(pullRequest);

    expect(!re).toBeTruthy();
  });

  it("should generate report", () => {
    const report = generateReport();

    expect(report).toMatchSnapshot();
  });

  it("should report", async () => {
    const github = await create(installation.id);

    await setComment({ github })(pullRequest, generateReport());
  });
});
