import { create, listInstallations } from "./services/github";
import { collectAnalyzeReport } from "./collectAnalyzeReport";

export const handle = async () => {
  const installations = await listInstallations();

  for (const installation of installations) {
    const github = await create(installation.id);

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
