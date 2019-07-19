import { create } from "./services/github";
import { collectAnalyzeReport } from "./collectAnalyzeReport";
import * as config from "./config";

export const handle = async () => {
  for (const installationId of config.github.installation_ids) {
    const github = await create(+installationId);

    const {
      data: { repositories }
    } = await github.apps.listRepos({});

    for (const repository of repositories) {
      console.log(`-- repository ${repository.owner.login}/${repository.name}`);

      const { data: pullRequests } = await github.pullRequests.list({
        owner: repository.owner.login,
        repo: repository.name,
        state: "open"
      });

      for (const pullRequest of pullRequests) {
        console.log(
          `--  -- pullRequest #${pullRequest.number} ${pullRequest.title}`
        );

        await collectAnalyzeReport({ github })(pullRequest);
      }
    }
  }
};
