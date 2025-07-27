import * as Sentry from "@sentry/node";
import config from "../settings/config";
import { processImage } from "../services/processImages";
import { S3Event } from "../types/lambda";

export const handler = async (event: S3Event): Promise<any> => {
  const FILE_NAME = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  /*Sentry.init({
        dsn: config.sentry.sentryDsn,
        environment: config.sentry.sentryEnvironment
    });*/

  const response = await processImage(FILE_NAME);

  return response;
};
