import { PullRequest } from "../../services/github";

export const installation = { id: 1319757 };

export const pullRequest: PullRequest = {
  number: 2,
  base: {
    repo: {
      name: "entry",
      owner: { login: "js13kgames" }
    }
  },
  head: {
    ref: "entry/valid",
    repo: {
      name: "entry",
      owner: { login: "platane" }
    }
  }
} as any;

export const commitSha = "241a7ea";
