export type ReleaseReport = {
  releaseId: string;
  releaseName: string;
  releaseUrl: string;
  deployUrl?: string;
  checks: Check[];
};

export const checks = [
  //
  "bundle-found" as const,
  "bundle-unziped" as const,
  "index-found" as const,
  "bundle-size" as const,
  "run-without-error" as const,
  "run-without-external-http" as const,
  "run-without-blank-screen" as const,

  "meta-images-found" as const,
  "meta-images-size" as const,
  "meta-images-resolution" as const,
  "meta-name" as const
];

type CheckStatus = "success" | "failure";

export type Check = {
  name: (typeof checks)[number];
  status: CheckStatus;
  statusDetail?: string;
};
