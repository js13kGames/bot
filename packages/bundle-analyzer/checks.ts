export type Result = "ok" | "failed" | "untested";

export const checkDescriptions = {
  bundle_size: "The bundle should not be over the size limit",
  bundle_valid_zip: "The bundle should be a valid zip file",
  bundle_contains_index:
    "The bundle should contain an index.html file at the root",
  game_no_error: "The game should start without error",
  game_no_external_http: "The game should not load external http resources",
  game_no_blank_screen: "The game should display something on the screen",
};

export type CheckId = keyof typeof checkDescriptions;
