import "./polyfill.fromEntries";
import {
  Event,
  Release,
  create,
  GithubClient,
  PullRequest
} from "./services/github";
import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyCallback,
  APIGatewayProxyHandler
} from "aws-lambda";
import { decode } from "base-64";
import { getLatestRelease } from "./getLatestRelease";
import { analyze } from "./analyze";
import { generateReport } from "./report";
import { setComment } from "./comment";
import { setCheckRuns } from "./checkRuns";
import { generateCheckRuns } from "./report/checkRuns";

type ReleaseEvent = {
  name: "x-release";
  payload: {
    pullRequest: PullRequest;
    release: Release;
    releaseCommitSha: string;
    installation: { id: number };
  };
};

type GithubEvent = Event | ReleaseEvent;

export const handle: APIGatewayProxyHandler = async e => {
  const event: GithubEvent = {
    event: getHeader(e.headers, "x-github-event"),
    payload: JSON.parse(e.isBase64Encoded ? decode(e.body) : e.body)
  } as any;

  console.log(event);

  await handleEvent(event);

  return { statusCode: 200, body: "ok" };
};

/**
 * handle github event
 */
const handleEvent = async (event: GithubEvent) => {
  /**
   * new release
   */
  if (event.name === "x-release") {
    const github = await create(event.payload.installation.id);

    await analyzeAndReport({ github })(
      event.payload.pullRequest,
      event.payload.releaseCommitSha,
      event.payload.release
    );
  }

  /**
   * new commit on PR
   */
  if (event.name === "pull_request" && event.payload.action === "synchronize") {
    const github = await create(event.payload.installation.id);

    const re = await getLatestRelease({ github })(
      event.payload.pull_request,
      event.payload.after
    );

    await analyzeAndReport({ github })(
      event.payload.pull_request,
      event.payload.after,
      re && re.release
    );
  }

  /**
   * PR opened
   */
  if (event.name === "pull_request" && event.payload.action === "open") {
  }

  /**
   * manully trigger a re-run
   */
  if (event.name === "check_run" && event.payload.action === "rerequested") {
    const github = await create(event.payload.installation.id);

    const [
      releaseId,
      pullRequestNumber
    ] = event.payload.check_run.external_id.split("#");

    const { data: pullRequest } = await github.pullRequests.get({
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      number: +pullRequestNumber
    });

    const { data: release } = await github.repos.getRelease({
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      release_id: +releaseId
    });

    await analyzeAndReport({ github })(
      pullRequest,
      event.payload.check_run.head_sha,
      release
    );
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

/**
 * get the header value
 */
const getHeader = (headers: APIGatewayEvent["headers"], name: string) => {
  for (const [n, v] of Object.entries(headers)) {
    if (n.toLowerCase() === name.toLowerCase()) return v;
  }
};
