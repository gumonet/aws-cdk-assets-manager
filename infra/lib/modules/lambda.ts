import { Policy } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration } from "aws-cdk-lib/core";
import { Construct } from "constructs";
import path from "path";

export const createLambdaUpload = (
  scope: Construct,
  lambda_name: string,
  stage: string,
  lambda_env: any,
  lambda_entry_file: string,
  s3policy: Policy
) => {
  const lambda = new NodejsFunction(scope, `Lambda${lambda_name}`, {
    functionName: `apiAssets-${lambda_name}-${stage}`,
    runtime: Runtime.NODEJS_20_X,
    entry: path.join(__dirname, `../../../src/lambdas/${lambda_entry_file}`),
    depsLockFilePath: path.join(__dirname, "../../../package-lock.json"),
    memorySize: 1024,
    environment: lambda_env,
    timeout: Duration.seconds(20),
    bundling: {
      nodeModules: ["sharp"],
      forceDockerBundling: true, // ⬅️ fuerza Docker (Linux x64) para evitar problemas
    },
  });
  lambda.role?.attachInlinePolicy(s3policy);

  return lambda;
};
