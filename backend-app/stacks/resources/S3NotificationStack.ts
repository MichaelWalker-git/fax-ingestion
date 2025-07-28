import { Fn, NestedStack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { startProcessing } from '../../resources/lambda/s3Triggers/startProcessing';
import { createDefaultLambdaRole, getCdkConstructId, getPolicyStatement } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

interface IProps {
  vpc: IVpc;
  dataTable: Table;
  kmsKey: Key;
  securityGroup: SecurityGroup;
  sageMakerAsyncBucket: Bucket;
  labels: Labels;
}

export class S3NotificationStack extends NestedStack {
  public readonly kmsKey: Key;
  public readonly vpc: IVpc;
  public readonly dataTable: Table;
  public readonly securityGroup: SecurityGroup;
  public readonly sageMakerAsyncBucket: Bucket;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    this.kmsKey = props.kmsKey;
    this.vpc = props.vpc;
    this.securityGroup = props.securityGroup;
    this.dataTable = props.dataTable;

    const importInputBucketName = getCdkConstructId({ context: 'input', resourceName: 'bucket-name' }, this);
    const importOutputBucketName = getCdkConstructId({ context: 'output', resourceName: 'bucket-name' }, this);

    const inputBucketName = Fn.importValue(importInputBucketName);
    const outputBucketName = Fn.importValue(importOutputBucketName);

    const inputBucket = Bucket.fromBucketName(this, 'InputBucket', inputBucketName);
    const outputBucket = Bucket.fromBucketName(this, 'OutputBucket', outputBucketName);

    const importProcessingStateMachineArn = getCdkConstructId({ context: 'processing', resourceName: 'state-machine-arn' }, this);
    const processingStateMachineArn = Fn.importValue(importProcessingStateMachineArn);

    this.sageMakerAsyncBucket = props.sageMakerAsyncBucket;

    // s3 notification ---------------------------------------------------------------------------------------------
    const startProcessingRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'file-processing', resourceName: 'role' }, this));
    startProcessingRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['GetItem', 'PutItem', 'UpdateItem'],
      resources: [this.dataTable.tableArn],
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
      resources: [this.kmsKey.keyArn],
    }));
    startProcessingRole.addToPolicy(getPolicyStatement({
      service: 'states',
      operations: ['StartExecution'],
      resources: ['*'],
    }));

    // Lambdas
    const startProcessingLambda = startProcessing(this, {
      REGION: this.region || 'eu-central-1',
      STATE_MACHINE_ARN: processingStateMachineArn,
      TABLE_NAME: this.dataTable.tableName,
      OUTPUT_BUCKET: outputBucketName,
      ASYNC_S3_BUCKET: this.sageMakerAsyncBucket.bucketName,
    }, startProcessingRole, this.vpc, this.securityGroup);

    // Permissions
    startProcessingLambda.addPermission('AllowS3Invoke', {
      principal: new ServicePrincipal('s3.amazonaws.com'),
      sourceArn: inputBucket.bucketArn,
    });

    // Event Notifications
    inputBucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new LambdaDestination(startProcessingLambda),
      { prefix: 'files/' },
    );
    inputBucket.addEventNotification(
      EventType.OBJECT_CREATED_POST,
      new LambdaDestination(startProcessingLambda),
      { prefix: 'files/' },
    );

    // NagSuppressions
    // Lambda
    NagSuppressions.addResourceSuppressions(
      [
        startProcessingLambda,
      ],
      [{ id: 'HIPAA.Security-LambdaDLQ', reason: 'Lambda functions used in this solution are synchronous, DQL is not needed' }],
      true,
    );

    // IAM Roles
    NagSuppressions.addResourceSuppressions(
      [
        startProcessingRole,
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
