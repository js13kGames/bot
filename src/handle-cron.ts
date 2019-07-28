import fetch from "node-fetch";
import "./polyfill.fromEntries";
import { create, listInstallations } from "./services/github";
import { getLatestRelease } from "./getLatestRelease";
import * as config from "./config";
import { getCheckRuns } from "./checkRuns";

export const handle = async () => {
  const installations = await listInstallations();

  for (const installation of shuffle(installations)) {
    const github = await create(installation.id);

    const {
      data: { repositories }
    } = await github.apps.listRepos({});

    for (const repository of shuffle(repositories)) {
      console.log(`-- repository ${repository.owner.login}/${repository.name}`);

      const { data: pullRequests } = await github.pullRequests.list({
        owner: repository.owner.login,
        repo: repository.name,
        state: "open"
      });

      for (const pullRequest of shuffle(pullRequests)) {
        console.log(
          `--  -- pullRequest #${pullRequest.number} ${pullRequest.title}`
        );

        const re = await getLatestRelease({ github })(pullRequest);

        if (
          re &&
          !(await getCheckRuns({ github })(
            pullRequest,
            re.commitSha,
            re.release.id
          ))
        ) {
          console.log(
            `--  --  -- new release ${re.release.tag_name} on ${re.commitSha}`
          );

          fetch(config.github.webhook_url, {
            method: "POST",
            headers: {
              ["X-GitHub-Event"]: "x-release",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              installation,
              pullRequest,
              release: re.release,
              releaseCommitSha: re.commitSha
            })
          });
        }
      }
    }
  }
};

const shuffle = <T>([a, ...rest]: T[]): T[] => {
  if (!a) return [];
  return Math.random() > 0.5 ? [...shuffle(rest), a] : [a, ...shuffle(rest)];
};
