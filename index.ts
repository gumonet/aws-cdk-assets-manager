import * as Sentry from "@sentry/node";
import { uploadImage, deleteImages } from "./src/services/imageHandler";
import config from "./src/settings/config";
import { processImage } from "./src/services/processImages";
import { readFileAsBase64 } from "./src/services/helper";

/*Sentry.init({
    dsn: config.sentry.sentryDsn,
    environment: config.sentry.sentryEnvironment
});*/

const handler = async (imagePath: string, id: string): Promise<void> => {
  try {
    // Read the local file and convert to base64
    const base64Image = readFileAsBase64(imagePath);
    //console.log(await uploadImage(base64Image, id));

    //console.log(await deleteImages(id));

    console.log(await processImage("toProcess/5fc84d53d873871136a30c57.jpeg"));
  } catch (error) {
    console.error("Error processing image:", error);
  }
};

handler("./image.jpeg", "5fc84d53d873871136a30c57");
