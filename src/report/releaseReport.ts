import { matchAll } from "../utils/matchAll";

export type ReleaseReport = {
  releaseId: string;
  releaseName: string;
  releaseUrl: string;
  deployUrl?: string;
  warnings: string[];
};

const generateReleaseReport = ({
  releaseId,
  releaseName,
  releaseUrl,
  deployUrl,
  warnings
}: ReleaseReport) =>
  [
    [
      `[${releaseName}](${releaseUrl}#${releaseId})`,
      deployUrl && `[deployed](${deployUrl})`,
      warnings.length === 0 ? "✔️" : "⚠️"
    ]
      .filter(Boolean)
      .join(" "),

    ...warnings.map(w => ` - ${w}`)
  ].join("\n");

export const generateReleaseReports = (releaseReports: ReleaseReport[]) =>
  releaseReports.map(generateReleaseReport).join("\n\n");

const bundleRe = /\[(\w+)\]\(([^#]+)#([^)]+)\) +(\[deployed\]\(([^)]+)\) +)?[vw](\n - [^\n]+)*/g;

export const parseReleaseReports = (text: string): ReleaseReport[] =>
  matchAll(
    // smh the huge regexp does not like emoji, replace them with arbitrary char
    text.replace(/✔️/g, "v").replace(/⚠️/g, "w"),
    bundleRe
  ).map(([t, releaseName, releaseUrl, releaseId, , deployUrl]) => ({
    releaseName,
    releaseUrl,
    deployUrl,
    releaseId,
    warnings: matchAll(t, /^ - (.+)$/gm).map(([, w]) => w)
  }));
