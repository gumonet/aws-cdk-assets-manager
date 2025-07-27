import config from "../settings/config";
import { removeObjectS3, uploadBase64Image } from "./aws";
import { checkImageType } from "./helper";
import * as Sentry from "@sentry/node";

/*Sentry.init({
    dsn: config.sentry.sentryDsn,
    environment: config.sentry.sentryEnvironment
});*/

interface UploadResponse {
  statusCode: number;
  statusMessage: string;
  resourcesName?: {
    small: string;
    medium: string;
    original: string;
  };
}

interface DeleteResponse {
  statusCode: number;
  statusMessage: string;
}

/**
 * Upload image to S3
 * @param image - The image that will be sent to S3 bucket
 * @param id - The ID for the image
 */
export const uploadImage = async (
  image: string,
  id: string
): Promise<UploadResponse> => {
  console.log(`START OF SCRIPT uploadImage`);

  if (!checkImageType(image)) {
    return {
      statusCode: 400,
      statusMessage: "Image dont match type required jpeg,png",
    };
  }

  const bucket = config.aws.bucketImages;
  const dstKey = `toProcess/${id}.jpeg`;

  const result = await uploadBase64Image(dstKey, image, bucket);

  if (result.$metadata.httpStatusCode !== 200) {
    const failDstKey = `failToProcess/${id}.jpeg`;
    console.log(`FAIL TO PROCESS IMAGE NEW PATH ${failDstKey}`);
  }

  console.log(`UPLOAD IMAGE = ${result.$metadata.httpStatusCode}
END OF SCRIPT`);

  return {
    statusCode: result.$metadata.httpStatusCode || 200,
    statusMessage: result.$metadata.httpStatusCode === 200 ? "OK" : "FAIL",
    resourcesName: {
      small: `${config.url}/processed/${id}_small.jpeg`,
      medium: `${config.url}/processed/${id}_medium.jpeg`,
      original: `${config.url}/processed/${id}_original.jpeg`,
    },
  };
};

/**
 * Update the image
 * @param image - The image that will be sent to S3 bucket
 * @param file_name - Name of the new image to save
 * @param current_file_name - Name of the previous image (optional)
 */
export const updateImage = async (
  image: string,
  file_name: string,
  current_file_name?: string
): Promise<UploadResponse> => {
  console.log(
    `START OF SCRIPT Update ----> Deleting FILE ${current_file_name}`
  );

  if (current_file_name) {
    await deleteImages(current_file_name);
  }

  const response = await uploadImage(image, file_name);
  return response;
};

/**
 * Delete images from S3
 * @param image_name - The base path of the image
 */
export const deleteImages = async (
  image_name: string
): Promise<DeleteResponse> => {
  console.log(`NAME PARSE ${image_name}`);

  // Remove the size suffix from the image name
  const id = image_name
    .replace("_small", "")
    .replace("_medium", "")
    .replace("_original", "")
    .split(".")[0];

  console.log(`START OF SCRIPT deleteImages
PROCESSING ID ${id}`);

  const bucket = config.aws.bucketImages;

  /**
   * Images to delete
   * {id}/original
   * {id}/medium
   * {id}/small
   */

  const oImage = `processed/${id}_original.jpeg`;
  const mImage = `processed/${id}_medium.jpeg`;
  const sImage = `processed/${id}_small.jpeg`;

  console.log(
    ` ********** REMOVE IMAGES ${oImage} : ${mImage} : ${sImage} ****************`
  );

  // Delete original image
  const oDelete = await removeObjectS3(oImage, bucket);
  console.log(
    "DELETE ORIGINAL SIZE IMAGE = ",
    oDelete.$metadata.httpStatusCode === 200 ? "OK" : "FAIL"
  );

  // Delete medium size image
  const mDelete = await removeObjectS3(mImage, bucket);
  console.log(
    "DELETE MEDIUM SIZE IMAGE = ",
    mDelete.$metadata.httpStatusCode === 200 ? "OK" : "FAIL"
  );

  // Delete small size image
  const sDelete = await removeObjectS3(sImage, bucket);
  console.log(`DELETE SMALL SIZE IMAGE = ${
    sDelete.$metadata.httpStatusCode === 200 ? "OK" : "FAIL"
  }
END OF SCRIPT`);

  return {
    statusCode: 200,
    statusMessage: "OK",
  };
};
