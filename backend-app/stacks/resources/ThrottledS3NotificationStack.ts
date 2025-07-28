import { Duration, Fn, NestedStack, CfnOutput } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import {
  PolicyStatement,
  Effect,
  AnyPrincipal, ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { EventType, Bucket } from 'aws-cdk-lib/aws-s3';
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { startProcessing } from '../../resources/lambda/s3Triggers/startProcessing';
import { getCdkConstructId, createDefaultLambdaRole, getPolicyStatement } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

interface IProps {
  vpc: IVpc;
  dataTable: Table;
  kmsKey: Key;
  securityGroup: SecurityGroup;
  sageMakerAsyncBucket: Bucket;
  labels: Labels;
}

export class ThrottledS3NotificationStack extends NestedStack {
  public readonly processingQueue: Queue;
  public readonly startProcessingLambda: any;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const importInputBucketName = getCdkConstructId({ context: 'input', resourceName: 'bucket-name' }, this);
    const importOutputBucketName = getCdkConstructId({ context: 'output', resourceName: 'bucket-name' }, this);

    // Import required resources
    const inputBucketName = Fn.importValue(importInputBucketName);
    const outputBucketName = Fn.importValue(importOutputBucketName);

    const inputBucket = Bucket.fromBucketName(this, 'InputBucket', inputBucketName);
    const outputBucket = Bucket.fromBucketName(this, 'OutputBucket', outputBucketName);

    const importProcessingStateMachineArn = getCdkConstructId({ context: 'processing', resourceName: 'state-machine-arn' }, this);
    const processingStateMachineArn = Fn.importValue(importProcessingStateMachineArn);

    // Create IAM role for Lambda
    const startProcessingRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'file-processing', resourceName: 'role' }, this));
    startProcessingRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['GetItem', 'PutItem', 'UpdateItem'],
      resources: [props.dataTable.tableArn],
    }));
    startProcessingRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['PutObject', 'GetObject', 'PutObjectAcl', 'ListBucket', 'DeleteObject'],
      resources: [
        `arn:aws:s3:::${inputBucketName}`,
        `arn:aws:s3:::${inputBucketName}/*`,
        `arn:aws:s3:::${outputBucketName}`,
        `arn:aws:s3:::${outputBucketName}/*`,
      ],
    }));
    startProcessingRole.addToPolicy(getPolicyStatement({
      service: 'kms',
      operations: ['Encrypt', 'Decrypt', 'GenerateDataKey'],
      resources: [props.kmsKey.keyArn],
    }));
    startProcessingRole.addToPolicy(getPolicyStatement({
      service: 'states',
      operations: ['StartExecution'],
      resources: ['*'],
    }));
    startProcessingRole.addToPolicy(getPolicyStatement({
      service: 'sqs',
      operations: ['ReceiveMessage', 'DeleteMessage', 'GetQueueAttributes'],
      resources: ['*'],
    }));

    // Create Dead Letter Queue
    const dlq = new Queue(this, getCdkConstructId({ context: 'processing-dlq', resourceName: 'queue' }, this), {
      queueName: getCdkConstructId({ context: 'processing-dlq', resourceName: 'queue' }, this),
      encryptionMasterKey: props.kmsKey,
      retentionPeriod: Duration.days(14),
    });

    // Create main processing queue with throttling controls
    this.processingQueue = new Queue(this, getCdkConstructId({ context: 'processing', resourceName: 'queue' }, this), {
      queueName: getCdkConstructId({ context: 'processing', resourceName: 'queue' }, this),
      visibilityTimeout: Duration.minutes(15),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3,
      },
      encryptionMasterKey: props.kmsKey,
      receiveMessageWaitTime: Duration.seconds(20),
    });

    // Add explicit permission for S3 to send messages to SQS
    this.processingQueue.addToResourcePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal('s3.amazonaws.com')],
      actions: ['sqs:SendMessage'],
      resources: [this.processingQueue.queueArn],
      conditions: {
        StringEquals: {
          'aws:SourceAccount': this.account,
        },
        ArnEquals: {
          'aws:SourceArn': inputBucket.bucketArn,
        },
      },
    }));

    // Modified SSL enforcement to allow S3 service
    const sslEnforcementStatement = new PolicyStatement({
      effect: Effect.DENY,
      principals: [new AnyPrincipal()],
      actions: ['sqs:*'],
      resources: ['*'],
      conditions: {
        Bool: {
          'aws:SecureTransport': 'false',
        },
        StringNotEquals: {
          'aws:PrincipalServiceName': 's3.amazonaws.com',
        },
      },
    });

    // Add SSL enforcement to both queues
    this.processingQueue.addToResourcePolicy(sslEnforcementStatement);
    dlq.addToResourcePolicy(sslEnforcementStatement);

    // Create Lambda with conservative concurrency
    this.startProcessingLambda = startProcessing(this, {
      REGION: this.region || 'eu-central-1',
      STATE_MACHINE_ARN: processingStateMachineArn,
      TABLE_NAME: props.dataTable.tableName,
      OUTPUT_BUCKET: outputBucketName,
      ASYNC_S3_BUCKET: props.sageMakerAsyncBucket.bucketName,
    }, startProcessingRole, props.vpc, props.securityGroup);

    this.startProcessingLambda.addEventSource(new SqsEventSource(this.processingQueue, {
      batchSize: 1,
      maxBatchingWindow: Duration.seconds(5),
      reportBatchItemFailures: true,
      maxConcurrency: 2,
    }));

    // Grant permissions
    this.processingQueue.grantConsumeMessages(this.startProcessingLambda);

    // Configure S3 to send events to SQS
    inputBucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new SqsDestination(this.processingQueue),
      { prefix: 'files/' },
    );

    inputBucket.addEventNotification(
      EventType.OBJECT_CREATED_POST,
      new SqsDestination(this.processingQueue),
      { prefix: 'files/' },
    );

    // Add monitoring outputs
    new CfnOutput(this, 'ProcessingQueueUrl', {
      value: this.processingQueue.queueUrl,
      exportName: `${process.env.STAGE}-ProcessingQueueUrl`,
      description: 'URL of the processing queue for throttling',
    });

    new CfnOutput(this, 'ProcessingDLQUrl', {
      value: dlq.queueUrl,
      exportName: `${process.env.STAGE}-ProcessingDLQUrl`,
      description: 'URL of the processing dead letter queue',
    });

    // CDK Nag suppressions
    NagSuppressions.addResourceSuppressions(
      [this.startProcessingLambda, this.processingQueue, dlq],
      [
        { id: 'HIPAA.Security-SQSEncryption', reason: 'Queue is encrypted with customer managed KMS key' },
        { id: 'AwsSolutions-SQS3', reason: 'DLQ is configured for the main processing queue' },
        { id: 'AwsSolutions-SQS4', reason: 'SSL enforcement policy is applied to both queues via resource policy' },
        { id: 'HIPAA.Security-LambdaDLQ', reason: 'SQS acts as the queue mechanism with DLQ configured' },
      ],
      true,
    );
  }
}
