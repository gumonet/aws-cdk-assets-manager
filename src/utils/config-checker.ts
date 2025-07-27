import config from "../settings/config";

export const checkConfiguration = (): void => {
  console.log("🔧 Configuration Check:");
  console.log("=======================");
  console.log(`Environment: ${config.environment}`);
  console.log(`AWS Region: ${config.aws.s3.region}`);
  console.log(`S3 Bucket: ${config.aws.bucketImages || "❌ Not set"}`);
  console.log(`Accepted Types: ${config.acceptedTypes || "❌ Not set"}`);
  console.log(
    `Image Sizes - Medium: ${config.imageSizes.medium || "❌ Not set"}`
  );
  console.log(
    `Image Sizes - Small: ${config.imageSizes.small || "❌ Not set"}`
  );
  console.log(`Image Fit: ${config.imageFit || "❌ Not set"}`);
  console.log(`URL: ${config.url || "❌ Not set"}`);
  console.log("=======================");
};
