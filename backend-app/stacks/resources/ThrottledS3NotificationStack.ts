import { Duration, NestedStack, CfnOutput, CustomResource } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import {
  PolicyStatement,
  Effect,
  AnyPrincipal, ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { addNotifications } from '../../resources/lambda/customResources/addNotifications';
import { startProcessing } from '../../resources/lambda/s3Triggers/startProcessing';
import { getCdkConstructId, createDefaultLambdaRole, getPolicyStatement } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

interface IProps {
  vpc: IVpc;
  dataTable: Table;
  securityGroup: SecurityGroup;
  inputBucket: Bucket;
  outputBucket: Bucket;
  sageMakerAsyncBucket: Bucket;
  labels: Labels;
  stateMachineArn: String;
  kmsKey: Key;
}

export class ThrottledS3NotificationStack extends NestedStack {
  public readonly processingQueue: Queue;
  public readonly startProcessingLambda: any;
  public readonly inputBucket: Bucket;
  public readonly outputBucket: Bucket;
  public readonly sageMakerAsyncBucket: Bucket;
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
          'aws:SourceArn': this.inputBucket.bucketArn,
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

    // Create Security Group
    const securityGroup = new SecurityGroup(scope, getCdkConstructId({ context: 'add-notifications', resourceName: 'security-group' }, this), {
      vpc: this.vpc,
      allowAllOutbound: true,
    });
    // Create Lambda
    const s3NotificationLambdaRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'deploy-model-to-sagemaker', resourceName: 'lambda-role' }, this));
    s3NotificationLambdaRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['PutObject', 'GetObject', 'PutObjectAcl', 'ListBucket', 'DeleteObject', 'CreateBucket'],
      resources: ['*'],
    }));
    s3NotificationLambdaRole.addToPolicy(getPolicyStatement({
      service: 'kms',
      operations: ['Encrypt', 'Decrypt', 'GenerateDataKey'],
      resources: [this.kmsKey.keyArn],
    }));

    const s3NotificationLambda = addNotifications(this, {
      INPUT_BUCKET: this.inputBucket.bucketName,
      QUEUE_ARN: this.processingQueue.queueArn,
      PREFIX: 'files/',
    }, s3NotificationLambdaRole, this.vpc, securityGroup);

    this.inputBucket.grantRead(s3NotificationLambda);
    this.processingQueue.grantSendMessages(s3NotificationLambda);

    // Create Custom Resource
    const customResourceProviderRole = createDefaultLambdaRole(this, 'customResourceProviderRoleS3Notification');
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['GetItem', 'PutItem', 'UpdateItem', 'DeleteItem', 'Query'],
      resources: [this.dataTable.tableArn],
    }));
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['PutObject', 'GetObject', 'PutObjectAcl', 'ListBucket', 'DeleteObject'],
      resources: [
        `arn:aws:s3:::${this.inputBucket.bucketName}`,
        `arn:aws:s3:::${this.inputBucket.bucketName}/*`,
      ],
    }));
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 'kms',
      operations: ['Encrypt', 'Decrypt', 'GenerateDataKey'],
      resources: [this.kmsKey.keyArn],
    }));
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 'lambda',
      operations: ['GetFunction'],
      resources: ['*'],
    }));

    const customResourceProvider = new Provider(this, getCdkConstructId({ context: 'add-notifications', resourceName: 'CustomResourceProvider' }, this), {
      onEventHandler: s3NotificationLambda,
      vpc: this.vpc,
      role: customResourceProviderRole,
      securityGroups: [securityGroup],
    });

    const customResource = new CustomResource(this, getCdkConstructId({ context: 'add-notifications', resourceName: 'CustomResource' }, this), {
      serviceToken: customResourceProvider.serviceToken,
      properties: {
        BucketName: this.inputBucket.bucketName,
        DestinationPrefix: 'samples',
      },
    });

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
