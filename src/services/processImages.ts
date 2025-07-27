import * as Sentry from "@sentry/node";
import config from "../settings/config";
import { getObjectS3, removeObjectS3, uploadS3 } from "./aws";
import { checkImageType } from "./helper";
import sharp from "sharp";

interface ProcessResponse {
  statusCode: number;
  statusMessage: string;
  resources_name?: {
    small: string;
    medium: string;
    original: string;
  };
}

/**
 * Process image from S3 and create different sizes
 * @param path - Path to the S3 file
 */
export const processImage = async (
  path: string
): Promise<ProcessResponse | number> => {
  console.log(`START OF SCRIPT processImage
PROCESSING FILE ${path}`);

  if (!checkImageType(path)) {
    console.error("Image dont match type required jpeg,png");
    return 0;
  }

  const bucket = config.aws.bucketImages;
  const mediumSize = config.imageSizes.medium.split(",");
  const smallSize = config.imageSizes.small.split(",");

  // Original image to delete
  const originalPath = path;
  console.log(`=================> ORIGINAL PATH: ${originalPath}`);

  let originalId = path.split(".")[0].split("/")[1];
  console.log(`=================> ORIGINAL ID SPLIT: ${originalId}`);

  originalId = `processed/${originalId}`;
  console.log(`=================> ORIGINAL ID SPLIT: ${originalId}`);

  // Image original name
  const oImage = `${originalId}_original.jpeg`;
  const getOImage = await getObjectS3(path, bucket);

  if (!getOImage.Body) {
    throw new Error("Failed to get image from S3");
  }
  const buffer = Buffer.from(await getOImage.Body.transformToByteArray());

  // Image medium name
  const mImageName = `${originalId}_medium.jpeg`;
  // Creates new image with the medium size
  const mImage = await sharp(buffer)
    .resize({
      width: parseInt(mediumSize[0]),
      height: parseInt(mediumSize[1]),
      fit: (config.imageFit as keyof sharp.FitEnum) || "cover",
    })
    .toBuffer();

  // Image small name
  const sImageName = `${originalId}_small.jpeg`;
  // Creates new image with the small size
  const sImage = await sharp(buffer)
    .resize({
      width: parseInt(smallSize[0]),
      height: parseInt(smallSize[1]),
      fit: (config.imageFit as keyof sharp.FitEnum) || "cover",
    })
    .toBuffer();

  // Removes originalPath
  console.log(
    `=================> REMOVING FILE : ${originalPath} | Bucket ${bucket}`
  );
  const deleteResult = await removeObjectS3(originalPath, bucket);
  console.log(
    `===============================================================`
  );
  console.log(deleteResult);

  if (deleteResult.$metadata.httpStatusCode !== 200) {
    console.log("ORIGINAL DELETE = FAIL");
    /*return {
        statusCode: 500,
        statusMessage: 'ERROR DELETEING ORIGINAL FILE'
    }*/
  }

  // Create original size image
  const oResult = await uploadS3(oImage, buffer, bucket, "image/jpeg");
  console.log(
    `CREATE ORIGINAL SIZE IMAGE = ${
      oResult.$metadata.httpStatusCode === 200 ? "OK" : "FAIL"
    }`
  );

  // Create medium size image
  const mResult = await uploadS3(mImageName, mImage, bucket, "image/jpeg");
  console.log(
    "CREATE MEDIUM SIZE IMAGE = ",
    mResult.$metadata.httpStatusCode === 200 ? "OK" : "FAIL"
  );

  // Create small size image
  const sResult = await uploadS3(sImageName, sImage, bucket, "image/jpeg");
  console.log(`CREATE SMALL SIZE IMAGE = ${
    sResult.$metadata.httpStatusCode === 200 ? "OK" : "FAIL"
  }
END OF SCRIPT`);

  return {
    statusCode: 200,
    statusMessage: "OK",
    resources_name: {
      small: `${sImageName}`,
      medium: `${mImageName}`,
      original: `${oImage}`,
    },
  };
};
