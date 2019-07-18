import * as E from "github-webhook-event-types";

export type Installation = E.Installation["installation"];
export type Repository = E.Repository["repository"];
export type Release = E.Release["release"];
export type PullRequest = E.PullRequest["pull_request"];

type EventPublished = {
  action: "published";
  release: Release;
};

export type Event = (EventPublished | { action: "noop" }) & {
  installation: Installation;
} & {
  repository: E.Repository;
} & { sender: E.Member };

export type Asset = {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: null;
  uploader: E.Member;
  content_type: string;
  state: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
};
