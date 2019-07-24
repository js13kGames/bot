import { PullRequest } from "../../services/github";

export const installation = { id: 1319757 };

export const pullRequest: PullRequest = {
  number: 10,
  base: {
    repo: {
      name: "entry",
      owner: { login: "js13kgames" }
    }
  },
  head: {
    ref: "entry/malformed-manifest",
    repo: {
      name: "entry",
      owner: { login: "platane" }
    }
  }
} as any;
