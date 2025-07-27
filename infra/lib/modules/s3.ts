import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Bucket, BucketEncryption, EventType } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib/core";
import { Construct } from "constructs";

export const createS3 = (scope: Construct, stage: string) => {
  return new Bucket(scope, "media-storage", {
    bucketName: `media-storage-${stage}`,
    encryption: BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    versioned: false,
    autoDeleteObjects: false,
    removalPolicy: RemovalPolicy.RETAIN,
  });
};

export const createS3Event = (s3Bucket: Bucket, filters: any) => {
  return new S3EventSource(s3Bucket, {
    events: [EventType.OBJECT_CREATED],
    filters: filters,
  });
};
