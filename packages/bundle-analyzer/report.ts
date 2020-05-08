type Result = "ok" | "failed" | "untested";

const defaultReport = {
  bundle_size: { description: "The bundle should not be over the size limit" },
  bundle_valid_zip: { description: "The bundle should be a valid zip file" },
  bundle_contains_index: {
    description: "The bundle should contain an index.html file at the root",
  },
  game_no_error: {
    description: "The game should start without error",
  },
  game_no_external_http: {
    description: "The game should not load external http resources",
  },
  game_no_blank_screen: {
    description: "The game should display something on the screen",
  },
};

export type Report = Record<
  keyof typeof defaultReport,
  { result: Result; details?: string[]; description: string }
>;

export const createInitialReport = (): Report => {
  const r: any = {};
  for (const i in defaultReport) {
    // @ts-ignore
    r[i] = { ...defaultReport[i], result: "untested" };
  }
  return r;
};

// Object.fromEntries(
//   Object.entries(defaultReport).map(([id, x]) => [
//     id,
//     { ...x, result: "untested" }
//   ])
// ) as any;
