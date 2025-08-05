import { execSync, ExecSyncOptions } from 'node:child_process';
import {RemovalPolicy, DockerImage, CfnOutput} from 'aws-cdk-lib';
import {
  Distribution,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
  CachePolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Source, BucketDeployment } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as fsExtra from 'fs-extra';
import { FrontendStackProps } from './frontend-stack.ts';

export class SiteCloudfront extends Construct {
  public readonly websiteBucket: Bucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id);

    this.websiteBucket = new Bucket(this, 'websiteBucket', {
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    this.distribution = new Distribution(this, 'CloudfrontDistribution', {
      enableLogging: true,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: new S3Origin(this.websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
      },
      defaultRootObject: 'index.html',
    });
    const execOptions: ExecSyncOptions = {stdio: 'inherit'};

    const bundle = Source.asset('./site', {
      bundling: {
        command: [
          'sh',
          '-c',
          'echo "Docker build not supported."',
        ],
        image: DockerImage.fromRegistry('alpine'),
        local: {
          /* istanbul ignore next */
          tryBundle(outputDir: string) {
            execSync(
              'cd site && npm install --legacy-peer-deps && npm run build',
              execOptions,
            );

            fsExtra.copySync('./site/dist', outputDir, {
              ...execOptions,
              // @ts-ignore
              recursive: true,
            });
            return true;
          },
        },
      },
    });

    const config = {
      API_ENDPOINT: props.restApiEndpoint,
      IDENTITY_POOL_ID: props.awsCognitoIdentityPoolId,
      USER_POOL_ID: props.awsUserPoolId,
      USER_POOL_CLIENT_ID: props.awsUserPoolClientId,
      test: "dddd00",
    };

    new BucketDeployment(this, 'DeployBucket', {
      sources: [bundle, Source.jsonData('config.json', config)],
      destinationBucket: this.websiteBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    new CfnOutput(this, 'distribution', {
      value: this.distribution.domainName,
    });

    new CfnOutput(this, 'siteBucket', {value: this.websiteBucket.bucketName});
  }
}
