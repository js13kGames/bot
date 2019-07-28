import { analyzeRelease } from "./analyzeRelease";
import { analyzeMeta } from "./analyzeMeta";
import { Release, GithubClient, PullRequest } from "../services/github";
import { Control } from "./control";

export const analyze = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest,
  commitSha: string,
  release?: Release
): Promise<Control[]> =>
  Promise.all([
    analyzeMeta({ github })(pullRequest, commitSha),

    Promise.resolve({
      conclusion: release ? "success" : "failure",
      name: "release-found",
      tagName: release && release.tag_name,
      releaseUrl: release && release.html_url,
      branch: pullRequest.head.ref
    }),

    release && analyzeRelease({ github })(release)
  ].filter(Boolean) as any).then(flat);

const flat = arr => [].concat(...arr);
