import { PullRequest } from "../../services/github";

export const installation = { id: 1319757 };

export const pullRequest: PullRequest = {
  number: 5,
  base: {
    repo: {
      name: "entry",
      owner: { login: "js13kgames" }
    }
  },
  head: {
    ref: "entry/external-http-call-html",
    repo: {
      name: "entry",
      owner: { login: "platane" }
    }
  }
} as any;

export const commitSha = "c9a43c6";
