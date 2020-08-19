import * as deepmerge from "deepmerge";

export const categories = [
  "mobile",
  "server",
  "desktop",
  "webxr",
  "webmonetization",
] as const;
export type Category = typeof categories[number];

export const isValidCategory = (x: any): x is Category =>
  categories.includes(x);

export type Rules = {
  bundle: {
    max_size: number;
  };
  game: {
    http_request_whitelist: RegExp[];
  };
};

export const getRulesForCategory = (category: Category): Rules | null => {
  switch (category) {
    case "mobile":
    case "desktop":
    case "webmonetization":
      return {
        bundle: { max_size: 13 * 1024 },
        game: { http_request_whitelist: [] },
      };
    case "webxr":
      return {
        bundle: { max_size: 13 * 1024 },
        game: { http_request_whitelist: [/aframe/] },
      };

    case "server":
    default:
      return null;
  }
};

export const mergeRules = (...rules: (Rules | null)[]) =>
  rules.reduce((r, a) => {
    if (!r) return a;
    if (!a) return r;
    return deepmerge(a, r);
  }, null);
