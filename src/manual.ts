import "./polyfill.fromEntries";
import { create, listInstallations } from "./services/github";
import { getLatestRelease } from "./getLatestRelease";
import { analyzeAndReport } from "./handle-job";

const run = async () => {
  const installations = await listInstallations();
  const github = await create(installations[0].id);

  const { data: pullRequest } = await github.pullRequests.get({
    owner: "js13kGames",
    repo: "entry",
    number: 31
  });

  const re = await getLatestRelease({ github })(pullRequest);

  const { data: commits } = await github.pullRequests.listCommits({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    number: pullRequest.number,
    per_page: 250
  });
  const latestCommit = commits.slice(-1)[0];

  console.log(
    re
      ? `${pullRequest.title} release ${re.release.tag_name} [${re.release.id}] ${re.commitSha}, commit ${latestCommit.sha}`
      : `${pullRequest.title}  no release, commit ${latestCommit.sha}`
  );

  analyzeAndReport({ github })(pullRequest, latestCommit.sha, re && re.release);
};

run();
