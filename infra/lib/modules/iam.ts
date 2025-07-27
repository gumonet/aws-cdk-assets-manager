import { PolicyStatement, Policy } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export const createIam = (scope: Construct, bucket_name: string) => {
  const s3PolicyStatement = new PolicyStatement({
    actions: [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObjectVersion",
      "s3:PutObjectVersionTagging",
      "s3:ListBucket",
      "s3:PutObjectTagging",
      "s3:DeleteObject",
      "s3:GetObjectVersion",
    ],
    resources: [`arn:aws:s3:::${bucket_name}/*`],
  });

  return new Policy(scope, "access-to-s3-policy", {
    statements: [s3PolicyStatement],
  });
};
