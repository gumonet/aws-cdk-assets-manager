export interface AWSConfig {
  s3: {
    region: string;
  };
  bucketImages: string;
}

export interface SentryConfig {
  sentryDsn?: string;
  sentryEnvironment?: string;
}

export interface ImageSizes {
  medium: string;
  small: string;
}

export interface Config {
  aws: AWSConfig;
  environment: string;
  sentry: SentryConfig;
  acceptedTypes?: string;
  imageSizes: ImageSizes;
  imageFit?: string;
  url?: string;
}

export interface S3UploadParams {
  Bucket: string;
  Key: string;
  Body: Buffer;
  ContentType?: string;
  ContentEncoding?: string;
}

export interface S3GetParams {
  Bucket: string;
  Key: string;
}

export interface S3DeleteParams {
  Bucket: string;
  Key: string;
}
