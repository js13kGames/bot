import { PullRequest } from "../../services/github";

export const installation = { id: 1281536 };

export const pullRequest: PullRequest = {
  number: 5,
  base: {
    repo: {
      name: "js13-entry",
      owner: { login: "platane" }
    }
  },
  head: {
    ref: "entry/blank-screen",
    repo: {
      name: "js13-entry",
      owner: { login: "platane-org" }
    }
  }
} as any;
