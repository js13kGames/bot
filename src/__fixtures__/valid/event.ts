import { PullRequest } from "../../services/github";

export const installation = { id: 1281536 };

export const pullRequest: PullRequest = {
  number: 1,
  base: {
    repo: {
      name: "js13-entry",
      owner: { login: "platane" }
    }
  },
  head: {
    ref: "entry/valid",
    repo: {
      name: "js13-entry",
      owner: { login: "platane-org" }
    }
  }
} as any;
