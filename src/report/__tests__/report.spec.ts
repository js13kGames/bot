import { generateReport, parseReport, Report } from "..";

describe("report", () => {
  const report: Report = {
    releaseReports: [
      {
        releaseId: "1234123",
        releaseName: "v-1",
        deployUrl:
          "http://js13kgames-entry-preview.s3-website-eu-west-1.amazonaws.com/v1/index.html",
        releaseUrl:
          "https://github.com/platane-org/13k-submission/releases/tag/v1",
        warnings: ["size is over the limit", "index not found"]
      },
      {
        releaseId: "12",
        releaseName: "v2",
        deployUrl: undefined,
        releaseUrl:
          "https://github.com/platane-org/13k-submission/releases/tag/v2",
        warnings: ["index not found"]
      },
      {
        releaseId: "126",
        releaseName: "v3",
        deployUrl:
          "http://js13kgames-entry-preview.s3-website-eu-west-1.amazonaws.com/v3/index.html",
        releaseUrl:
          "https://github.com/platane-org/13k-submission/releases/tag/v3",
        warnings: []
      }
    ]
  };

  it("should generate a report", () => {
    expect(generateReport(report)).toMatchSnapshot();
  });

  it("should parse a report", () => {
    expect(parseReport(generateReport(report))).toEqual(report);
  });
});
