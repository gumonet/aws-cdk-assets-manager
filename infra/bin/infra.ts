#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/infra";

const app = new cdk.App();
new InfraStack(app, "apiAssets", {
  env: { account: "my-account-id", region: "my-region" },
  domain: "mydomain.com",
  stage: "prod",
  ACCEPTED_TYPES: "jpeg|png",
  ENVIRONMENT: "prod",
  IMAGE_FIT: "fill",
  MEDIUM_RESOLUTION: "720,480",
  SMALL_RESOLUTION: "640,480",
  subdomain: "my-subdomain",
});
