import "./polyfill.fromEntries";
import { Event, Release, PullRequest } from "./services/github";
import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { decode } from "base-64";
import { sendMessage } from "./services/sqs";

type ReleaseEvent = {
  eventName: "x-release";
  pullRequest: PullRequest;
  release: Release;
  releaseCommitSha: string;
  installation: { id: number };
};

type GithubEvent = Event | ReleaseEvent;

export const handle: APIGatewayProxyHandler = async e => {
  const event: GithubEvent = {
    ...JSON.parse(e.isBase64Encoded ? decode(e.body) : e.body),
    eventName: getHeader(e.headers, "x-github-event")
  } as any;

  console.log(event);

  if (
    (event.eventName === "pull_request" && event.action === "synchronize") ||
    (event.eventName === "pull_request" && event.action === "open") ||
    (event.eventName === "check_run" && event.action === "rerequested") ||
    (event.eventName === "check_suite" && event.action === "rerequested")
  ) {
    await sendMessage(event);
    return { statusCode: 200, body: "ok" };
  }

  return { statusCode: 404, body: "irrelevant event" };
};

/**
 * get the header value
 */
const getHeader = (headers: APIGatewayEvent["headers"], name: string) => {
  for (const [n, v] of Object.entries(headers)) {
    if (n.toLowerCase() === name.toLowerCase()) return v;
  }
};
