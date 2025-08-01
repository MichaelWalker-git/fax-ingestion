import { Duration, NestedStack, CfnOutput } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Key } from 'aws-cdk-lib/aws-kms';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { EventType, IBucket } from 'aws-cdk-lib/aws-s3';
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
  securityGroup: SecurityGroup;
  inputBucket: IBucket;
  outputBucket: IBucket;
  sageMakerAsyncBucket: IBucket;
  labels: Labels;
  stateMachineArn: String;
  kmsKey: Key;
  processingQueue: Queue;
}

export class ThrottledS3NotificationStack extends NestedStack {
  public readonly processingQueue: Queue;
  public readonly startProcessingLambda: any;
  public readonly inputBucket: IBucket;
  public readonly outputBucket: IBucket;
  public readonly sageMakerAsyncBucket: IBucket;
  public readonly stateMachineArn: String;
  public readonly vpc: IVpc;
  public readonly dataTable: Table;
  public readonly securityGroup: SecurityGroup;
  public readonly kmsKey: Key;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    this.stateMachineArn = props.stateMachineArn;
    this.inputBucket = props.inputBucket;
    this.outputBucket = props.outputBucket;
    this.sageMakerAsyncBucket = props.sageMakerAsyncBucket;
    this.vpc = props.vpc;
    this.dataTable = props.dataTable;
    this.securityGroup = props.securityGroup;
    this.kmsKey = props.kmsKey;
    this.processingQueue = props.processingQueue;

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
        `arn:aws:s3:::${this.inputBucket.bucketName}`,
        `arn:aws:s3:::${this.inputBucket.bucketName}/*`,
        `arn:aws:s3:::${this.outputBucket.bucketName}`,
        `arn:aws:s3:::${this.outputBucket.bucketName}/*`,
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

    // Create Lambda with conservative concurrency
    this.startProcessingLambda = startProcessing(this, {
      REGION: this.region || 'eu-central-1',
      STATE_MACHINE_ARN: this.stateMachineArn as string,
      TABLE_NAME: this.dataTable.tableName,
      OUTPUT_BUCKET: this.outputBucket.bucketName,
      ASYNC_S3_BUCKET: this.sageMakerAsyncBucket.bucketName,
    }, startProcessingRole, this.vpc, this.securityGroup);

    this.startProcessingLambda.addEventSource(new SqsEventSource(this.processingQueue, {
      batchSize: 1,
      maxBatchingWindow: Duration.seconds(5),
      reportBatchItemFailures: true,
      maxConcurrency: 2,
    }));

    // s3 notification
    this.inputBucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new SqsDestination(this.processingQueue),
      { prefix: 'files/' },
    );

    this.inputBucket.addEventNotification(
      EventType.OBJECT_CREATED_POST,
      new SqsDestination(this.processingQueue),
      { prefix: 'files/' },
    );

    // Grant permissions
    this.processingQueue.grantConsumeMessages(this.startProcessingLambda);
    this.inputBucket.grantRead(this.startProcessingLambda);
    this.outputBucket.grantReadWrite(this.startProcessingLambda);

    // Add monitoring outputs
    new CfnOutput(this, 'ProcessingQueueUrl', {
      value: this.processingQueue.queueUrl,
      exportName: `${process.env.STAGE}-ProcessingQueueUrl`,
      description: 'URL of the processing queue for throttling',
    });

    // CDK Nag suppressions for your Lambda
    NagSuppressions.addResourceSuppressions(
      [this.startProcessingLambda],
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
