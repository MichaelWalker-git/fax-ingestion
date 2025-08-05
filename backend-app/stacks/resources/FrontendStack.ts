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
import { CfnIdentityPool, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Source, BucketDeployment } from 'aws-cdk-lib/aws-s3-deployment';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import * as fsExtra from 'fs-extra';
import { getCdkConstructId } from '../../shared/helpers';

interface IProps {
  // restApiEndpoint: string;
  // cognitoUserPoolId: string;
/*  userPool: UserPool;
  cognitoClient: UserPoolClient;
  identityPool: CfnIdentityPool;*/
}

//export class FrontendStack extends NestedStack {
export class FrontendStack extends cdk.Stack {
  public readonly websiteBucket: IBucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, args: any, props: IProps) {
    super(scope, id);
    // this.websiteBucket = props.websiteBucket;

    const importCognitoUserPoolId = 'CognitoUserPoolId';

    const cognitoUserPoolId = Fn.importValue(importCognitoUserPoolId);

    /*    const userPool = UserPool.fromUserPoolArn(this, 'ImportedPool',
      Stack.of(this).formatArn({
        service: 'cognito-idp',
        resource: 'userpool',
        resourceName: cognitoUserPoolId,
      }),
    );*/

    // const cognitoUserPoolId = props.cognitoUserPoolId;

    this.websiteBucket = new Bucket(this, getCdkConstructId({ context: 'website', resourceName: 'websiteBucket' }, this), {
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
      // serverAccessLogsBucket: loggingBucket,
      // serverAccessLogsPrefix: 'websiteBucketLogs/',
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
      /*      API_ENDPOINT: restApi.url,
          IDENTITY_POOL_ID: identityPool.ref,*/
      // USER_POOL_ID: userPool.userPoolId,
      // USER_POOL_ID: userPool,
      USER_POOL_CLIENT_ID: cognitoUserPoolId,
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


    /*    NagSuppressions.addResourceSuppressionsByPath(
      Stack.of(this),
      '/prod/fax-eu-central-1-prod-fax-ingestion-backend-app/FrontEnd-Stack/CloudfrontDistribution/LoggingBucket/Resource',
      [
        { id: 'HIPAA.Security-S3BucketLoggingEnabled', reason: 'Auto-created CloudFront log bucket; logging not required.' },
        { id: 'HIPAA.Security-S3BucketPublicReadProhibited', reason: 'Auto-created CloudFront log bucket; public access not used.' },
        { id: 'HIPAA.Security-S3BucketPublicWriteProhibited', reason: 'Auto-created CloudFront log bucket; public access not used.' },
        { id: 'HIPAA.Security-S3BucketReplicationEnabled', reason: 'Replication not required for CloudFront log bucket.' },
        { id: 'HIPAA.Security-S3BucketSSLRequestsOnly', reason: 'Auto-created CloudFront log bucket; HTTPS enforcement not needed.' },
        { id: 'HIPAA.Security-S3BucketVersioningEnabled', reason: 'Versioning not required for CloudFront log bucket.' },
        { id: 'HIPAA.Security-S3DefaultEncryptionKMS', reason: 'Default SSE-KMS encryption not required for CloudFront log bucket.' },
      ],
      true,
    );

    NagSuppressions.addResourceSuppressionsByPath(
      Stack.of(this),
      '/prod/fax-eu-central-1-prod-fax-ingestion-backend-app/FrontEnd-Stack/CloudfrontDistribution/Resource',
      [
        { id: 'AwsSolutions-CFR1', reason: 'Geo restriction not required for this distribution.' },
        { id: 'AwsSolutions-CFR2', reason: 'WAF integration not required for this distribution.' },
        { id: 'AwsSolutions-CFR4', reason: 'TLS policy already set to TLSv1.2_2021, but suppressing false positive.' },
      ],
    );

    NagSuppressions.addResourceSuppressionsByPath(
      Stack.of(this),
      '/prod/fax-eu-central-1-prod-fax-ingestion-backend-app/FrontEnd-Stack/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C/ServiceRole/Resource',
      [
        { id: 'AwsSolutions-IAM4', reason: 'Uses AWS managed policy for BucketDeployment; acceptable for CDK-managed resource.' },
      ],
    );

    NagSuppressions.addResourceSuppressionsByPath(
      Stack.of(this),
      '/prod/fax-eu-central-1-prod-fax-ingestion-backend-app/FrontEnd-Stack/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C/ServiceRole/DefaultPolicy/Resource',
      [
        {
          id: 'AwsSolutions-IAM5',
          appliesTo: [
            'Action::s3:GetBucket*',
            'Action::s3:GetObject*',
            'Action::s3:List*',
            'Action::s3:Abort*',
            'Action::s3:DeleteObject*',
            'Resource::arn:aws:s3:::cdk-hnb659fds-assets-039885961427-us-east-2/!*',
            'Resource::arn:aws:s3:::ExportWebsiteBucketName/!*', // <-- FIXED: dynamically resolves real bucket ARN
            'Resource::*',
          ],
          reason: 'BucketDeployment Lambda needs broad S3 actions for asset deployment.',
        },
        { id: 'HIPAA.Security-IAMNoInlinePolicy', reason: 'Inline policy automatically generated by CDK for BucketDeployment Lambda.' },
      ],
      true,
    );


    NagSuppressions.addResourceSuppressionsByPath(
      Stack.of(this),
      '/prod/fax-eu-central-1-prod-fax-ingestion-backend-app/FrontEnd-Stack/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C/Resource',
      [
        { id: 'AwsSolutions-L1', reason: 'CDK-managed Lambda runtime version acceptable for deployment function.' },
        { id: 'HIPAA.Security-LambdaConcurrency', reason: 'No concurrency limit needed for one-off deployment Lambda.' },
        { id: 'HIPAA.Security-LambdaDLQ', reason: 'DLQ not required for one-off deployment Lambda.' },
        { id: 'HIPAA.Security-LambdaInsideVPC', reason: 'VPC access not needed for one-off deployment Lambda.' },
      ],
      true,
    );

    NagSuppressions.addResourceSuppressionsByPath(
      Stack.of(this),
      '/prod/fax-eu-central-1-prod-fax-ingestion-backend-app/FrontEnd-Stack/CloudfrontDistribution/LoggingBucket/Resource',
      [
        { id: 'HIPAA.Security-S3BucketLoggingEnabled', reason: 'Auto-created CloudFront log bucket; logging not required.' },
        { id: 'HIPAA.Security-S3BucketPublicReadProhibited', reason: 'Auto-created CloudFront log bucket; public access not used.' },
        { id: 'HIPAA.Security-S3BucketPublicWriteProhibited', reason: 'Auto-created CloudFront log bucket; public access not used.' },
        { id: 'HIPAA.Security-S3BucketReplicationEnabled', reason: 'Replication not required for CloudFront log bucket.' },
        { id: 'HIPAA.Security-S3BucketSSLRequestsOnly', reason: 'Auto-created CloudFront log bucket; HTTPS enforcement not needed.' },
        { id: 'HIPAA.Security-S3BucketVersioningEnabled', reason: 'Versioning not required for CloudFront log bucket.' },
        { id: 'HIPAA.Security-S3DefaultEncryptionKMS', reason: 'Default SSE-KMS encryption not required for CloudFront log bucket.' },
        { id: 'AwsSolutions-S1', reason: 'Auto-created CloudFront log bucket; server access logs are not required.' },
        { id: 'AwsSolutions-S10', reason: 'Auto-created CloudFront log bucket; HTTPS enforcement not needed for logging bucket.' },
      ],
      true,
    );*/

  }
}
