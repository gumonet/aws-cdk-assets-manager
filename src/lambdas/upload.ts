import * as Sentry from "@sentry/node";
import config from "../settings/config";
import {
  uploadImage,
  updateImage,
  deleteImages,
} from "../services/imageHandler";
import {
  APIGatewayEvent,
  UploadRequestBody,
  LambdaResponse,
} from "../types/lambda";

export const handler = async (
  event: APIGatewayEvent
): Promise<LambdaResponse> => {
  /*Sentry.init({
        dsn: config.sentry.sentryDsn,
        environment: config.sentry.sentryEnvironment
    });*/

  const method = event.httpMethod;
  const body: UploadRequestBody = JSON.parse(event.body);
  let response: LambdaResponse = { statusCode: 200 };

  switch (method) {
    case "POST":
      response = await uploadImage(body.base64, body.file_name);
      break;
    case "PUT":
      response = await updateImage(
        body.base64,
        body.file_name,
        body.current_file_name
      );
      break;
    case "DELETE":
      response = await deleteImages(body.file_name);
      break;

    default:
      response = {
        statusCode: 405,
        statusMessage: "Method not allowed",
      };
  }

  return {
    statusCode: response.statusCode,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "Content-Type": "text/json",
    },
    body: JSON.stringify(response),
  };
};
