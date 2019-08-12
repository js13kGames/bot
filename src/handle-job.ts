import "./polyfill.fromEntries";
import {
  Event,
  Release,
  create,
  GithubClient,
  PullRequest
} from "./services/github";
import { SQSHandler } from "aws-lambda";
import { getLatestRelease } from "./getLatestRelease";
import { analyze } from "./analyze";
import { generateReport } from "./report";
import { setComment } from "./comment";
import { setCheckRuns } from "./checkRuns";
import { generateCheckRuns } from "./report/checkRuns";
import { extractInfoFormCheckRuns } from "./report/checkRuns/generateSubmitCheckRun";
import { submit } from "./services/submit";

type ReleaseEvent = {
  eventName: "x-release";
  pullRequest: PullRequest;
  release: Release;
  releaseCommitSha: string;
  installation: { id: number };
};

type GithubEvent = Event | ReleaseEvent;

/**
 * handle github event
 */
export const handle: SQSHandler = async e => {
  const event: GithubEvent = JSON.parse(e.Records[0].body);

  console.log(event);

  /**
   * new release
   */
  if (event.eventName === "x-release") {
    const github = await create(event.installation.id);

    await analyzeAndReport({ github })(
      event.pullRequest,
      event.releaseCommitSha,
      event.release
    );
  }

  /**
   * new commit on PR
   */
  if (event.eventName === "pull_request" && event.action === "synchronize") {
    const github = await create(event.installation.id);

    const re = await getLatestRelease({ github })(
      event.pull_request,
      event.after
    );

    await analyzeAndReport({ github })(
      event.pull_request,
      event.after,
      re && re.release
    );
  }

  /**
   * PR opened
   */
  if (event.eventName === "pull_request" && event.action === "opened") {
    const github = await create(event.installation.id);

    const re = await getLatestRelease({ github })(
      event.pull_request,
      event.pull_request.head.sha
    );

    await analyzeAndReport({ github })(
      event.pull_request,
      event.pull_request.head.sha,
      re && re.release
    );
  }

  /**
   * manully trigger a re-run
   */
  if (event.eventName === "check_run" && event.action === "rerequested") {
    const github = await create(event.installation.id);

    const [releaseId, pullRequestNumber] = event.check_run.external_id.split(
      "#"
    );

    const { data: pullRequest } = await github.pullRequests.get({
      owner: event.repository.owner.login,
      repo: event.repository.name,
      number: +pullRequestNumber
    });

    const { data: release } = await github.repos.getRelease({
      owner: pullRequest.head.repo.owner.login,
      repo: pullRequest.head.repo.name,
      release_id: +releaseId
    });

    await analyzeAndReport({ github })(
      pullRequest,
      event.check_run.head_sha,
      release
    );
  }

  /**
   * manully submit
   */
  if (event.eventName === "check_run" && event.action === "requested_action") {
    const github = await create(event.installation.id);

    const [releaseId, pullRequestNumber] = event.check_run.external_id.split(
      "#"
    );

    const res = extractInfoFormCheckRuns([event.check_run]);

    // submit
    await submit({
      user: res.user,
      game: {
        name: res.name,
        description: res.description,
        categories: [],
        repositoryUrl: `https://github.com/${res.user.github}/${res.repositoryName}`
      },
      bundleUrl: res.bundleUrl,
      imagesUrls: res.images
    });

    // add label
    github.issues.addLabels({
      owner: event.repository.owner.login,
      repo: event.repository.name,
      number: +pullRequestNumber,
      labels: ["submitted"]
    });

    // close PR
    await github.pullRequests.update({
      owner: event.repository.owner.login,
      repo: event.repository.name,
      number: +pullRequestNumber,
      state: "closed"
    });
  }
};

const analyzeAndReport = ({ github }: { github: GithubClient }) => async (
  pullRequest: PullRequest,
  commitSha: string,
  release: Release | null
) => {
  /**
   * analyze the release
   */
  const newControls = await analyze({ github })(
    pullRequest,
    commitSha,
    release
  );

  console.log("results", newControls);

  /**
   * report as comment
   */
  await setComment({ github })(pullRequest, generateReport(newControls));

  /**
   * report as run checks
   */
  await setCheckRuns({ github })(
    pullRequest,
    commitSha,
    release && release.id,
    generateCheckRuns(newControls)
  );
};
