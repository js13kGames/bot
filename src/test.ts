import { create } from "./services/github";
import { collectAnalyzeReport } from "./collectAnalyzeReport";

const run = async () => {
  const installationId = 1281536;

  const github = await create(installationId);

  const {
    data: { repositories }
  } = await github.apps.listRepos({});

  for (const repository of repositories) {
    const { data: pullRequests } = await github.pullRequests.list({
      owner: repository.owner.login,
      repo: repository.name,
      state: "open"
    });

    for (const pullRequest of pullRequests) {
      await collectAnalyzeReport({ github })(pullRequest);
    }
  }
};

run();
