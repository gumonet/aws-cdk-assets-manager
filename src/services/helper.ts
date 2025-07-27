import config from "../settings/config";
import * as fs from "fs";
import * as path from "path";

export const checkImageType = (str: string): RegExpMatchArray | null => {
  if (!config.acceptedTypes) {
    return null;
  }
  const regexp = new RegExp(`\.(${config.acceptedTypes})`);
  return str.match(regexp);
};

export const readFileAsBase64 = (filePath: string): string => {
  try {
    const absolutePath = path.resolve(filePath);
    const fileBuffer = fs.readFileSync(absolutePath);
    const base64String = fileBuffer.toString("base64");

    // Determine MIME type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };

    const mimeType = mimeTypes[ext] || "image/jpeg";

    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
};
