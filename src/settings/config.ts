import dotenv from "dotenv";
import { Config } from "../types";

dotenv.config();

const generateConfig = (): Config => {
  const missingKeys: string[] = [];
  const getEnvVar = (
    key: string,
    defaultValue?: string
  ): string | undefined => {
    if (!process.env[key] && defaultValue === undefined) {
      missingKeys.push(key);
    }
    return process.env[key] || defaultValue;
  };

  const config: Config = {
    aws: {
      s3: {
        region: getEnvVar("AWS_S3_REGION", "us-east-1")!,
      },
      bucketImages: getEnvVar("S3_BUCKET_IMAGES")!,
    },
    environment: getEnvVar("ENVIRONMENT", "development")!,
    sentry: {
      sentryDsn: getEnvVar("SENTRY_DSN"),
      sentryEnvironment: getEnvVar("SENTRY_ENVIRONMENT"),
    },
    acceptedTypes: getEnvVar("ACCEPTED_TYPES"),
    imageSizes: {
      medium: getEnvVar("MEDIUM_RESOLUTION")!,
      small: getEnvVar("SMALL_RESOLUTION")!,
    },
    imageFit: getEnvVar("IMAGE_FIT"),
    url: getEnvVar("URL"),
  };

  if (missingKeys.length) {
    throw new Error(
      `The following environment variables are missing: ${missingKeys}`
    );
  }
  return config;
};

export default generateConfig();
