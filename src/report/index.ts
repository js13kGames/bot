export type Bundle = {
  releaseUrl: string;
  deployUrl?: string;
  releaseName: string;
  warnings: string[];
};

const generateBundleReport = ({
  releaseName,
  releaseUrl,
  deployUrl,
  warnings
}: Bundle) =>
  [
    [
      `[${releaseName}](${releaseUrl})`,
      deployUrl && `[deployed](${deployUrl})`,
      warnings.length === 0 ? "✔️" : "⚠️"
    ]
      .filter(Boolean)
      .join(" "),

    ...warnings.map(w => ` - ${w}`)
  ].join("\n");

export const generateReport = (bundles: Bundle[]) => {
  return bundles.map(generateBundleReport).join("\n\n");
};

const matchAll = (text: string, re: RegExp) => {
  re.lastIndex = -1;

  const matches = [];
  let m;
  while ((m = re.exec(text))) {
    matches.push(m);
  }
  return matches;
};

const bundleRe = /\[(\w+)\]\(([^)]+)\) +(\[deployed\]\(([^)]+)\) +)?[vw](\n - [^\n]+)*/g;

export const parseReport = (text: string): Bundle[] =>
  matchAll(
    // smh the huge regexp does not like emoji, replace them with arbitrary char
    text.replace(/✔️/g, "v").replace(/⚠️/g, "w"),
    bundleRe
  ).map(([t, releaseName, releaseUrl, , deployUrl]) => ({
    releaseName,
    releaseUrl,
    deployUrl,
    warnings: matchAll(t, /^ - (.+)$/gm).map(([, w]) => w)
  }));
