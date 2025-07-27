import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import config from "../settings/config";
import { S3GetParams, S3DeleteParams, S3UploadParams } from "../types";

// Initialize S3 client with AWS SDK v3
const s3Client = new S3Client({
  region: config.aws.s3.region,
});

export const getObjectS3 = async (
  dstKey: string,
  bucketName: string
): Promise<any> => {
  const params: S3GetParams = {
    Bucket: bucketName,
    Key: dstKey,
  };

  const command = new GetObjectCommand(params);
  return s3Client.send(command);
};

export const removeObjectS3 = async (
  dstKey: string,
  bucketName: string
): Promise<any> => {
  const params: S3DeleteParams = {
    Bucket: bucketName,
    Key: dstKey,
  };

  const command = new DeleteObjectCommand(params);
  return s3Client.send(command);
};

export const uploadS3 = async (
  dstKey: string,
  buffer: Buffer,
  bucketName: string,
  content?: string
): Promise<any> => {
  const params: S3UploadParams = {
    Bucket: bucketName,
    Key: dstKey,
    Body: buffer,
    ContentType: content,
  };

  try {
    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    throw new Error(`Upload failed: ${error}`);
  }
};

export const uploadBase64Image = async (
  dstKey: string,
  buffer: string,
  bucketName: string
): Promise<any> => {
  const buf = Buffer.from(
    buffer.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const params: S3UploadParams = {
    Bucket: bucketName,
    Key: dstKey,
    Body: buf,
    ContentEncoding: "base64",
    ContentType: "image/jpeg",
  };

  try {
    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    throw new Error(`Base64 upload failed: ${error}`);
  }
};
