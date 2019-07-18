import { create } from "./services/github";
import event from "./__fixtures__/e.json";
import { analyzeRelease } from "./analyze/analyzeRelease";
import { getLatestRelease, getChecks, setChecks } from "./checkRuns";
import { setComment } from "./comment";
import { generateReport } from "./report";
import { PullRequest } from "./types/github";

const loop = ({ github }) => async (pullRequest: PullRequest) => {
  const re = await getLatestRelease({ github })(pullRequest.head.repo);

  if (!re) return;

  console.log(`latest release ${re.release.id}, sha: ${re.sha}`);

  const previousChecks = await getChecks({ github })(
    pullRequest.base.repo,
    re.sha,
    re.release.id
  );

  // console.log(previousChecks);

  // if (previousChecks) return;

  const newChecks = await analyzeRelease({ github })(re.release);

  console.log(newChecks);

  await setComment({ github })(
    pullRequest,
    generateReport(re.release, newChecks)
  );

  await setChecks({ github })(
    pullRequest.base.repo,
    re.sha,
    re.release.id,
    newChecks
  );
};

const run = async () => {
  const github = await create(event.installation.id);

  const {
    data: { repositories }
  } = await github.apps.listRepos();

  for (const repository of repositories) {
    const { data: pullRequests } = await github.pullRequests.list({
      owner: repository.owner.login,
      repo: repository.name,
      state: "open"
    });

    for (const pullRequest of pullRequests) {
      await loop({ github })(pullRequest as PullRequest);
    }
  }
};

run();
