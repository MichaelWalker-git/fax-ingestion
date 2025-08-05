import { execSync, ExecSyncOptions } from 'child_process';
import { DockerImage, CfnOutput, Stack, NestedStack, RemovalPolicy, Fn } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import {
  Distribution,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
  CachePolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Source, BucketDeployment } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as fsExtra from 'fs-extra';
import { getCdkConstructId } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

interface IProps {
  labels: Labels;
}
export class FrontendStack extends cdk.Stack {
  public readonly websiteBucket: IBucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, args: any, props: IProps) {
    super(scope, id);

    const { labels } = props;

    const cognitoUserPoolId = Fn.importValue(`${labels.name()}-CognitoUserPoolId`);

    const userPoolClientId = Fn.importValue(`${labels.name()}-client-id`);

    const identityPoolId = Fn.importValue(`${labels.name()}-identity-pool-id`);

    const apiUrl = Fn.importValue(`${labels.name()}-rest-api-uri`);

    this.websiteBucket = new Bucket(this, getCdkConstructId({ context: 'website', resourceName: 'websiteBucket' }, this), {
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
    const execOptions: ExecSyncOptions = { stdio: 'inherit' };

    const bundle = Source.asset('../client-app', {
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
              'cd ../client-app && npm install --legacy-peer-deps && npm run build',
              execOptions,
            );

            fsExtra.copySync('../client-app/dist', outputDir, {
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
      API_ENDPOINT: apiUrl,
      IDENTITY_POOL_ID: identityPoolId,
      USER_POOL_ID: cognitoUserPoolId,
      USER_POOL_CLIENT_ID: userPoolClientId,
    };

    const bucketDeployment = new BucketDeployment(this, 'DeployBucket', {
      sources: [bundle, Source.jsonData('config.json', config)],
      destinationBucket: this.websiteBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    new CfnOutput(this, 'distribution', {
      value: this.distribution.domainName,
    });

    new CfnOutput(this, 'siteBucket', { value: this.websiteBucket.bucketName });
  }
}
