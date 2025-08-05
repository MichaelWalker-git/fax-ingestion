import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { BlockPublicAccess, Bucket, BucketEncryption, CorsRule, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { KmsStack } from './KmsStack';
import { StackProps } from '../../lib/backend-app-stack';
import { createDefaultLambdaRole, getCdkConstructId, getPolicyStatement } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

interface IProps extends cdk.StackProps {
  labels: Labels;
}

const IS_CDK_DEPLOY = process.env.DEPLOYMENT_TYPE === 'CDK';

export class S3Stack extends cdk.Stack {
  public readonly removalPolicy: RemovalPolicy = RemovalPolicy.DESTROY;
  public readonly kmsKey: Key;
  public readonly inputBucket: Bucket;
  public readonly outputBucket: Bucket;
  public readonly sageMakerAsyncBucket: Bucket;

  constructor(scope: Construct, id: string, args: StackProps, props: IProps) {
    super(scope, id);

    const labels = args.labels;

    // KMS Stack - Enhanced for marketplace with customer-managed keys
    const kmsStack = new KmsStack(this, 'Kms-Stack', { labels: labels });

    this.kmsKey = kmsStack.kmsKey;

    // S3 buckets
    const corsRule: CorsRule = {
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
      allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT, HttpMethods.DELETE],
    };

    const loggingBucket = new Bucket(this, getCdkConstructId({ context: 'logging', resourceName: 'bucket' }, this), {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: this.removalPolicy,
      encryption: BucketEncryption.KMS,
      versioned: true,
      enforceSSL: true,
      autoDeleteObjects: IS_CDK_DEPLOY && this.removalPolicy === RemovalPolicy.DESTROY,
    });

    loggingBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: [loggingBucket.bucketArn, `${loggingBucket.bucketArn}/*`],
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        conditions: {
          Bool: { 'aws:SecureTransport': 'false' },
        },
      }),
    );

    const inputBucketNotificationRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'input', resourceName: 'bucket-notification-role' }, this));

    // Input Bucket
    this.inputBucket = new Bucket(this, getCdkConstructId({ context: 'input', resourceName: 'bucket' }, this), {
      cors: [corsRule],
      removalPolicy: this.removalPolicy,
      encryption: BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      versioned: true,
      serverAccessLogsBucket: loggingBucket,
      serverAccessLogsPrefix: 'inputBucketLogs/',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      notificationsHandlerRole: inputBucketNotificationRole,
      autoDeleteObjects: IS_CDK_DEPLOY && this.removalPolicy === RemovalPolicy.DESTROY,
    });

    this.inputBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: [this.inputBucket.bucketArn, `${this.inputBucket.bucketArn}/*`],
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        conditions: {
          Bool: { 'aws:SecureTransport': 'false' },
        },
      }),
    );

    inputBucketNotificationRole.addToPolicy(getPolicyStatement({
      resources: ['*'],
      operations: ['InvokeFunction'],
      service: 'lambda',
    }));

    inputBucketNotificationRole.addToPolicy(getPolicyStatement({
      resources: [
        `arn:aws:s3:::${this.inputBucket.bucketName}`,
        `arn:aws:s3:::${this.inputBucket.bucketName}/*`,
      ],
      operations: ['PutBucketNotification', 'GetBucketNotification'],
      service: 's3',
    }));

    // Output Bucket
    this.outputBucket = new Bucket(this, getCdkConstructId({ context: 'output', resourceName: 'bucket' }, this), {
      cors: [corsRule],
      removalPolicy: this.removalPolicy,
      encryption: BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      versioned: true,
      serverAccessLogsBucket: loggingBucket,
      serverAccessLogsPrefix: 'outputBucketLogs/',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      autoDeleteObjects: IS_CDK_DEPLOY && this.removalPolicy === RemovalPolicy.DESTROY,
    });

    this.outputBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: [this.outputBucket.bucketArn, `${this.outputBucket.bucketArn}/*`],
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        conditions: {
          Bool: { 'aws:SecureTransport': 'false' },
        },
      }),
    );

    // SageMaker Async Bucket
    this.sageMakerAsyncBucket = new Bucket(this, getCdkConstructId({ context: 'sagemaker', resourceName: 'async-bucket' }, this), {
      cors: [corsRule],
      removalPolicy: this.removalPolicy,
      versioned: true,
      serverAccessLogsBucket: loggingBucket,
      serverAccessLogsPrefix: 'sageMakerAsyncBucketLogs/',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      autoDeleteObjects: IS_CDK_DEPLOY && this.removalPolicy === RemovalPolicy.DESTROY,
    });

    this.sageMakerAsyncBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: [this.sageMakerAsyncBucket.bucketArn, `${this.sageMakerAsyncBucket.bucketArn}/*`],
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        conditions: {
          Bool: { 'aws:SecureTransport': 'false' },
        },
      }),
    );

    // Outputs
    const exportInputBucketName = 'ExportInputBucketName';
    new CfnOutput(this, exportInputBucketName, {
      value: this.inputBucket.bucketName,
      exportName: exportInputBucketName,
    });

    const exportInputBucketArn = 'ExportInputBucketArn';
    new CfnOutput(this, exportInputBucketArn, {
      value: this.inputBucket.bucketArn,
      exportName: exportInputBucketArn,
    });

    const exportOutputBucketName = 'ExportOutputBucketName';
    new CfnOutput(this, exportOutputBucketName, {
      value: this.outputBucket.bucketName,
      exportName: exportOutputBucketName,
    });

    const exportOutputBucketArn = 'ExportOutputBucketArn';
    new CfnOutput(this, exportOutputBucketArn, {
      value: this.outputBucket.bucketArn,
      exportName: exportOutputBucketArn,
    });

    const exportSageMakerAsyncBucketName = 'ExportSageMakerAsyncBucketName';
    new CfnOutput(this, exportSageMakerAsyncBucketName, {
      value: this.sageMakerAsyncBucket.bucketName,
      exportName: exportSageMakerAsyncBucketName,
    });

    const exportSageMakerAsyncBucketArn = 'ExportSageMakerAsyncBucketArn';
    new CfnOutput(this, exportSageMakerAsyncBucketArn, {
      value: this.sageMakerAsyncBucket.bucketArn,
      exportName: exportSageMakerAsyncBucketArn,
    });

    // NagSuppressions
    // S3
    NagSuppressions.addResourceSuppressions(
      [
        this.inputBucket,
        this.outputBucket,
        this.sageMakerAsyncBucket,
        loggingBucket,
      ],
      [
        { id: 'HIPAA.Security-S3BucketReplicationEnabled', reason: 'Replication not needed for images uploaded by user' },
        { id: 'HIPAA.Security-S3BucketVersioningEnabled', reason: 'Replication not needed for images uploaded by user' },
        { id: 'HIPAA.Security-S3DefaultEncryptionKMS', reason: 'Replication not needed for images uploaded by user' },
      ],
    );


    NagSuppressions.addResourceSuppressions(
      this,
      [
        {
          id: 'AwsSolutions-IAM4',
          reason: 'BucketDeployment requires AWS managed policies',
        },
        {
          id: 'AwsSolutions-IAM5',
          reason: 'BucketDeployment requires wildcard permissions for S3 and KMS operations',
        },
        {
          id: 'HIPAA.Security-IAMNoInlinePolicy',
          reason: 'BucketDeployment construct requires inline policies for S3 operations',
        },
        {
          id: 'AwsSolutions-L1',
          reason: 'BucketDeployment uses CDK managed Lambda runtime',
        },
        {
          id: 'HIPAA.Security-LambdaConcurrency',
          reason: 'BucketDeployment Lambda is ephemeral and does not require concurrency limits',
        },
        {
          id: 'HIPAA.Security-LambdaDLQ',
          reason: 'BucketDeployment Lambda failures are handled by CloudFormation custom resource framework',
        },
        {
          id: 'HIPAA.Security-LambdaInsideVPC',
          reason: 'BucketDeployment Lambda only accesses S3 and does not require VPC isolation',
        },
      ],
      true, // Apply to all child resources
    );

    // IAM Roles
    NagSuppressions.addResourceSuppressions(
      [
        inputBucketNotificationRole,
      ],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: '* is used so that the Lambda function can create log groups',
        },
        {
          id: 'HIPAA.Security-IAMNoInlinePolicy',
          reason: 'Inline policies are part of the BucketHandlerNotification',
        },
        {
          id: 'AwsSolutions-IAM4',
          reason: 'these policies is used by CDK Customer Resource lambda',
        },
        {
          id: 'HIPAA.Security-IAMPolicyNoStatementsWithFullAccess',
          reason: 'these policies is used by CDK Customer Resource lambda',
        },
      ],
      true,
    );
  }
}
