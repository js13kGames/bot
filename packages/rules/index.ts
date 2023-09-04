import * as deepmerge from "deepmerge";

export const categories = [
  "mobile",
  "server",
  "desktop",
  "webxr",
  "webmonetization",
  "decentralized",
  "unfinished",
] as const;
export type Category = typeof categories[number];

export const isValidCategory = (x: any): x is Category =>
  categories.includes(x);

export type Rules = {
  bundle: {
    max_size: number;
  };
  game: {
    http_request_whitelist_regexp: string[];
  };
};

export const getRulesForCategory = (category: Category): Rules | null => {
  switch (category) {
    case "mobile":
    case "desktop":
    case "webmonetization":
    case "unfinished":
    case "decentralized":
      return {
        bundle: { max_size: 13 * 1024 },
        game: { http_request_whitelist_regexp: [] },
      };
    case "webxr":
      return {
        bundle: { max_size: 13 * 1024 },
        game: {
          http_request_whitelist_regexp: [
            `^https?:\/\/js13kgames.com\/webxr-src\/\d+\/babylon\.js$`,
            `^https?:\/\/js13kgames.com\/webxr-src\/\d+\/aframe\.js$`,
            `^https?:\/\/js13kgames.com\/webxr-src\/\d+\/three\.js$`,
            `^https?:\/\/js13kgames.com\/webxr-src\/\d+\/playcanvas\.js$`,
            `^https?:\/\/cdn.aframe.io\/`,
          ],
        },
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
