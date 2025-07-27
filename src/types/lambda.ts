// Types for Lambda events

export interface APIGatewayEvent {
  httpMethod: string;
  body: string;
  headers?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
  queryStringParameters?: { [key: string]: string };
}

export interface S3Event {
  Records: Array<{
    s3: {
      object: {
        key: string;
        size?: number;
        eTag?: string;
      };
      bucket: {
        name: string;
        arn?: string;
      };
    };
    eventName?: string;
    eventTime?: string;
  }>;
}

export interface UploadRequestBody {
  base64: string;
  file_name: string;
  current_file_name?: string;
}

export interface LambdaResponse {
  statusCode: number;
  headers?: { [key: string]: string };
  body?: string;
  statusMessage?: string;
}
