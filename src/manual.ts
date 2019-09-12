import "./polyfill.fromEntries";
import { create, listInstallations } from "./services/github";
import { getLatestRelease } from "./getLatestRelease";
import { sendMessage } from "./services/sqs";
import { pullsListAllCommits } from "./services/github/pagination";

const run = async () => {
  const {
    data: [installation]
  } = await listInstallations();
  const github = await create(installation.id);

  const { data: pullRequest } = await github.pulls.get({
    owner: "js13kGames",
    repo: "entry",
    pull_number: 53
  });

  const re = await getLatestRelease({ github })(pullRequest);

  const commits = await pullsListAllCommits(github)({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    pull_number: pullRequest.number
  });
  const latestCommit = commits.slice(-1)[0];

  console.log(
    re
      ? `${pullRequest.title} release ${re.release.tag_name} [${re.release.id}] ${re.commitSha}, commit ${latestCommit.sha}`
      : `${pullRequest.title}  no release, commit ${latestCommit.sha}`
  );

  await sendMessage({
    eventName: "x-force-analyze",
    installation,
    pullRequest,
    release: re && re.release,
    commitSha: latestCommit.sha
  });
};

run();
