import { PullRequest } from "../../services/github";

export const installation = { id: 1319757 };

export const pullRequest: PullRequest = {
  number: 12,
  base: {
    repo: {
      name: "entry",
      owner: { login: "js13kgames" }
    }
  },
  head: {
    ref: "entry/invalid-image-size",
    repo: {
      name: "entry",
      owner: { login: "platane" }
    }
  }
} as any;

export const commitSha = "ce740ea";
