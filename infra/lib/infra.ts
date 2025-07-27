import * as cdk from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import {
  AllowedMethods,
  BehaviorOptions,
  CachedMethods,
  CachePolicy,
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CnameRecord, HostedZone } from "aws-cdk-lib/aws-route53";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { createApiGtwInfa } from "./modules/apigateway";
import { createIam } from "./modules/iam";
import { createLambdaUpload } from "./modules/lambda";
import { createS3, createS3Event } from "./modules/s3";
// import * as sqs from 'aws-cdk-lib/aws-sqs'

interface InfraProps extends cdk.StackProps {
  stage: string;
  domain: string;
  ACCEPTED_TYPES: string;
  ENVIRONMENT: string;
  IMAGE_FIT: string;
  MEDIUM_RESOLUTION: string;
  SMALL_RESOLUTION: string;
  subdomain: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraProps) {
    super(scope, id, props);

    const fullDomain = `${props.subdomain}.${props.domain}`;

    /* Create S3 Bucket */
    const s3Bucket = createS3(this, props.stage);

    let bucket_name = s3Bucket.bucketName;
    const s3policy = createIam(this, bucket_name);

    let lambda_env = {
      ACCEPTED_TYPES: props.ACCEPTED_TYPES,
      ENVIRONMENT: props.ENVIRONMENT,
      IMAGE_FIT: props.IMAGE_FIT,
      MEDIUM_RESOLUTION: props.MEDIUM_RESOLUTION,
      S3_BUCKET_IMAGES: bucket_name,
      SMALL_RESOLUTION: props.SMALL_RESOLUTION,
      URL: `https://${props.subdomain}.${props.domain}`,
    };

    //Lambda Upload
    const lambdaUploadFunction = createLambdaUpload(
      this,
      "upload",
      props.stage,
      lambda_env,
      "upload.ts",
      s3policy
    );
    const lambdaProcessFunction = createLambdaUpload(
      this,
      "process",
      props.stage,
      lambda_env,
      "process.ts",
      s3policy
    );

    //Create API Gateway
    const apiGtw = createApiGtwInfa(this, lambdaUploadFunction, props.stage);

    //Create S3 Event to process image
    const s3CreatedEventSource = createS3Event(s3Bucket, [
      { prefix: "toProcess/" },
    ]);
    lambdaProcessFunction.addEventSource(s3CreatedEventSource);

    // Create API Gateway Origin for CloudFront
    const apiOrigin = new HttpOrigin(
      `${apiGtw.restApiId}.execute-api.${this.region}.${this.urlSuffix}`
    );

    // Create Origin Access Identity for S3
    const oia = new OriginAccessIdentity(this, "OIA", {
      comment: "OIA for Images infra",
    });
    s3Bucket.grantRead(oia);

    // Create S3 Origin for images
    const s3Origin = new S3Origin(s3Bucket, {
      originAccessIdentity: oia,
    });

    // Create cache policy for images
    const imageCachePolicy = new CachePolicy(this, "image-cache-policy", {
      maxTtl: cdk.Duration.minutes(2),
      minTtl: cdk.Duration.minutes(1),
      defaultTtl: cdk.Duration.minutes(1),
    });

    // Get domain zone
    const zone = HostedZone.fromLookup(this, "route_53_zone", {
      domainName: props.domain,
    });

    // Create SSL certificate
    const certificate = new Certificate(this, "Certificate", {
      domainName: fullDomain,
      validation: CertificateValidation.fromDns(zone),
    });

    // Create CloudFront Distribution
    const cloudfrontDistribution = new Distribution(
      this,
      "CloudFrontDistribution",
      {
        defaultBehavior: {
          origin: s3Origin,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: imageCachePolicy,
        },
        additionalBehaviors: {
          "api/*": {
            origin: apiOrigin,
            allowedMethods: AllowedMethods.ALLOW_ALL,
            compress: false,
            cachePolicy: CachePolicy.CACHING_DISABLED,
            cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
            //originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          } as BehaviorOptions,
        },
        priceClass: cdk.aws_cloudfront.PriceClass.PRICE_CLASS_100,
        domainNames: [fullDomain],
        certificate: certificate,
      }
    );

    // Create CNAME record in Route 53
    const cname = new CnameRecord(this, "subdomain_route_53_zone", {
      zone: zone,
      recordName: props.subdomain,
      domainName: cloudfrontDistribution.distributionDomainName,
    });

    // Output the URL
    new cdk.CfnOutput(this, "url", {
      value: `https://${fullDomain}`,
      description: "CloudFront Distribution URL",
    });

    new cdk.CfnOutput(this, "api-url", {
      value: `https://${fullDomain}/api`,
      description: "API Gateway URL through CloudFront",
    });
  }
}
