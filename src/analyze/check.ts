export type ReleaseReport = {
  releaseId: string;
  releaseName: string;
  releaseUrl: string;
  deployUrl?: string;
  checks: Check[];
};

export type Check = (
  | { name: "bundle-found" }
  | { name: "bundle-unziped" }
  | { name: "index-found"; deployUrl: string }
  | { name: "bundle-size"; bundleSize: number; sizeLimit: number }
  | { name: "run-without-error"; errors: any[] }
  | {
      name: "run-without-external-http";
      externalUrls?: string[];
      urls?: string[];
    }
  | { name: "run-without-blank-screen"; screenShotUrl: string }) & {
  conclusion: "success" | "failure";
};
