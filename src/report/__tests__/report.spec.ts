import { generateReport, parseReport } from "..";

describe("report", () => {
  const bundles: Bundle[] = [
    {
      releaseName: "v1",
      deployUrl: "/a",
      releaseUrl: "/b",
      warnings: ["size is over the limit", "index not found"]
    },
    {
      releaseName: "v2",
      deployUrl: undefined,
      releaseUrl: "/d",
      warnings: ["index not found"]
    },
    {
      releaseName: "v3",
      deployUrl: "/e",
      releaseUrl: "/f",
      warnings: []
    }
  ];

  it("should generate a report", () => {
    expect(generateReport(bundles)).toMatchSnapshot();
  });

  it("should parse a report", () => {
    expect(parseReport(generateReport(bundles))).toEqual(bundles);
  });
});
