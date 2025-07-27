import {
  LambdaRestApi,
  Cors,
  Deployment,
  Stage,
} from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export const createApiGtwInfa = (
  scope: Construct,
  lambdaFunction: IFunction,
  env_stage: string
) => {
  const apiGtw = new LambdaRestApi(
    scope,
    `apiAssetsSass-Upload-API-${env_stage}`,
    {
      restApiName: `api-assets-${env_stage}`,
      handler: lambdaFunction,
      proxy: false,
      deploy: false,
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: Cors.ALL_METHODS,
        allowOrigins: Cors.ALL_ORIGINS,
      },
    }
  );

  apiGtw.root.addMethod("POST");
  apiGtw.root.addMethod("PUT");
  apiGtw.root.addMethod("DELETE");
  const deployment = new Deployment(scope, `api_deployment`, { api: apiGtw });
  const stage = new Stage(scope, `api`, { deployment, stageName: "api" });
  apiGtw.deploymentStage = stage;

  return apiGtw;
};
