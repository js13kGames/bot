import "./polyfill.fromEntries";
import { create, listInstallations } from "./services/github";
import { collectAnalyzeReport } from "./collectAnalyzeReport";

const shuffle = <T>([a, ...rest]: T[]): T[] => {
  if (!a) return [];

  return Math.random() > 0.5 ? [...shuffle(rest), a] : [a, ...shuffle(rest)];
};

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

        await collectAnalyzeReport({ github })(pullRequest);
      }
    }
  }
};
