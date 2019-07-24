export type Control = (
  | { name: "description-found"; gameDescription: string }
  | { name: "name-found"; gameName: string }
  | { name: "manifest-read"; manifest?: Object }
  | { name: "manifest-found"; files: string[] }
  | {
      name: "images-found";
      images: { [label: string]: string | { error: string } };
    }
  | { name: "bundle-found"; assetFiles: string[] }
  | { name: "bundle-unzipped" }
  | { name: "release-found"; tagName: string }
  | { name: "index-found"; deployUrl: string; bundleFiles: string[] }
  | { name: "bundle-size"; bundleSize: number; sizeLimit: number }
  | { name: "run-without-error"; errors: string[] }
  | { name: "run-without-blank-screen"; screenShotUrl: string }
  | {
      name: "run-without-external-http";
      externalUrls?: string[];
      urls?: string[];
    }) & {
  conclusion: "success" | "failure";
};

export const extractInfo = controls => {
  const deployUrl = (controls.find(c => c.name === "index-found") || {})
    .deployUrl;
  const name = (controls.find(c => c.name === "name-found") || {}).gameName;
  const description = (controls.find(c => c.name === "description-found") || {})
    .gameDescription;
  const images = (controls.find(c => c.name === "images-found") || {}).images;

  return {
    deployUrl,
    name,
    description,
    images: Object.fromEntries(
      Object.entries(images || {}).filter(([, x]: any) => !x.error)
    )
  };
};
