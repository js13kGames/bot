import { analyzeRelease } from "./analyzeRelease";
import { analyzeMeta } from "./analyzeMeta";
import { Release, GithubClient, PullRequest } from "../services/github";
import { Control } from "./control";

export const analyze = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest,
  release: Release
): Promise<Control[]> =>
  Promise.all([
    analyzeMeta({ github })(pullRequest),

    Promise.resolve({
      conclusion: release ? "success" : "failure",
      name: "release-found",
      tagName: release && release.tag_name,
      branch: pullRequest.head.ref
    }),

    release && analyzeRelease({ github })(release)
  ].filter(Boolean) as any).then(flat);

const flat = arr => [].concat(...arr);
