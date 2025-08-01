import * as path from 'path';
import { Duration, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Architecture, DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Chain, IntegrationPattern, StateMachine, StateMachineType } from 'aws-cdk-lib/aws-stepfunctions';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { textExtract } from '../../resources/lambda/stepFunction/02textExtract';
import { fileProcessing } from '../../resources/lambda/stepFunction/03fileProcessing';
import { createDefaultLambdaRole, getCdkConstructId, getPolicyStatement } from '../../shared/helpers';

interface IProps {
  vpc: IVpc;
  inputBucket: IBucket;
  outputBucket: IBucket;
  sageMakerAsyncBucket: IBucket;
  kmsKey: Key;
  dataTable: Table;
  securityGroup: SecurityGroup;
  sageMakerEndpoint: string;
}

export class StepFunctionsStack extends NestedStack {
  public readonly removalPolicy: RemovalPolicy = RemovalPolicy.DESTROY;
  public readonly kmsKey: Key;
  public readonly lambdaRole: Role;
  public readonly stateMachine: StateMachine;
  public readonly vpc: IVpc;
  public readonly dataTable: Table;
  public readonly inputBucket: IBucket;
  public readonly outputBucket: IBucket;
  public readonly securityGroup: SecurityGroup;
  public readonly sageMakerEndpoint: string;
  public readonly sageMakerAsyncBucket: IBucket;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    this.kmsKey = props.kmsKey;
    this.vpc = props.vpc;
    this.dataTable = props.dataTable;
    this.inputBucket = props.inputBucket;
    this.outputBucket = props.outputBucket;
    this.securityGroup = props.securityGroup;
    this.sageMakerEndpoint = props.sageMakerEndpoint;
    this.sageMakerAsyncBucket = props.sageMakerAsyncBucket;

    // Log Groups ---------------------------------------------------------------------------------------------
    // Processing
    const processingStepFunctionLogGroupName = getCdkConstructId({ context: 'processing-stepfunction', resourceName: 'log-group' }, this);
    const processingStepFunctionLogGroup = new LogGroup(this, processingStepFunctionLogGroupName, {
      logGroupName: `/aws/vendedlogs/states/${processingStepFunctionLogGroupName}`,
      removalPolicy: this.removalPolicy,
      encryptionKey: this.kmsKey,
    });

    // Roles ---------------------------------------------------------------------------------------------
    this.lambdaRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'processing-stepfunction', resourceName: 'lambda-role' }, this));
    this.lambdaRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['GetItem', 'PutItem', 'UpdateItem', 'Query'],
      resources: [this.dataTable.tableArn],
    }));
    this.lambdaRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['PutObject', 'GetObject', 'PutObjectAcl', 'ListBucket', 'DeleteObject', 'GetItem'],
      resources: [
        `arn:aws:s3:::${this.inputBucket.bucketName}`,
        `arn:aws:s3:::${this.inputBucket.bucketName}/*`,
        `arn:aws:s3:::${this.outputBucket.bucketName}`,
        `arn:aws:s3:::${this.outputBucket.bucketName}/*`,
        `arn:aws:s3:::${this.sageMakerAsyncBucket.bucketName}`,
        `arn:aws:s3:::${this.sageMakerAsyncBucket.bucketName}/*`,
      ],
    }));
    this.lambdaRole.addToPolicy(getPolicyStatement({
      service: 'es',
      operations: ['ESHttpGet', 'ESHttpPut', 'ESHttpPost', 'ESHttpDelete'],
      resources: ['*'],
    }));
    this.lambdaRole.addToPolicy(getPolicyStatement({
      service: 'sagemaker',
      operations: ['*'],
      resources: ['*'],
    }));
    this.lambdaRole.addToPolicy(getPolicyStatement({
      service: 'kms',
      operations: ['Encrypt', 'Decrypt', 'GenerateDataKey'],
      resources: [this.kmsKey.keyArn],
    }));
    this.lambdaRole.addToPolicy(getPolicyStatement({
      service: 'ssm',
      operations: ['*'],
      resources: ['*'],
    }));

    // Lambdas ---------------------------------------------------------------------------------------------
    const pdfToImagesLambdaName = getCdkConstructId({ context: 'pdf-to-images', resourceName: 'lambda' }, this);
    const pdfToImagesLambda = new DockerImageFunction(this, pdfToImagesLambdaName, {
      functionName: pdfToImagesLambdaName,
      code: DockerImageCode.fromImageAsset(path.join(__dirname, '../../resources/lambda/stepFunction/01pdfToImages')),
      timeout: Duration.minutes(5),
      memorySize: 2048,
      architecture: Architecture.X86_64,
      role: this.lambdaRole,
      vpc: this.vpc,
      securityGroups: [this.securityGroup],
      reservedConcurrentExecutions: 40,
      environment: {
        REGION: this.region || 'eu-central-1',
      },
    });

    const textExtractLambda = textExtract(this, {
      TABLE_NAME: this.dataTable.tableName,
      OUTPUT_BUCKET: this.outputBucket.bucketName,
      INPUT_BUCKET: this.inputBucket.bucketName,
      SAGE_MAKER_QWENEN_EDPOINT: this.sageMakerEndpoint,
      ASYNC_S3_BUCKET: this.sageMakerAsyncBucket.bucketName,
    }, this.lambdaRole, this.vpc, this.securityGroup);

    const fileProcessingLambda = fileProcessing(this, {
      TABLE_NAME: this.dataTable.tableName,
      OUTPUT_BUCKET: this.outputBucket.bucketName,
      SMARTY_AUTH_ID: process.env.SMARTY_AUTH_ID || '',
      SMARTY_AUTH_TOKEN: process.env.SMARTY_AUTH_TOKEN || '',
    }, this.lambdaRole, this.vpc, this.securityGroup);

    // Grant access to buckets ---------------------------------------------------------------------------------------------
    this.inputBucket.grantReadWrite(pdfToImagesLambda);
    this.inputBucket.grantReadWrite(textExtractLambda);
    this.inputBucket.grantReadWrite(fileProcessingLambda);

    this.outputBucket.grantReadWrite(pdfToImagesLambda);
    this.outputBucket.grantReadWrite(textExtractLambda);
    this.outputBucket.grantReadWrite(fileProcessingLambda);

    // Step Functions Tasks ---------------------------------------------------------------------------------------------
    const pdfToImagesTask = new tasks.LambdaInvoke(this, getCdkConstructId({ context: 'pdf-to-images', resourceName: 'task' }, this), {
      lambdaFunction: pdfToImagesLambda,
      integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
      taskTimeout: sfn.Timeout.duration(Duration.seconds(900)),
    });

    const textExtractTask = new tasks.LambdaInvoke(this, getCdkConstructId({ context: 'text-extract', resourceName: 'task' }, this), {
      lambdaFunction: textExtractLambda,
      integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
      taskTimeout: sfn.Timeout.duration(Duration.seconds(900)),
    });

    const fileProcessingTask = new tasks.LambdaInvoke(this, getCdkConstructId({ context: 'file-processing', resourceName: 'task' }, this), {
      lambdaFunction: fileProcessingLambda,
      integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
      taskTimeout: sfn.Timeout.duration(Duration.seconds(900)),
    });

    // State Machines ---------------------------------------------------------------------------------------------
    // 1) Map
    const mapMapSubTasks = Chain
      .start(textExtractTask);

    // Create the Map state
    const mapMapState = new sfn.Map(this, getCdkConstructId({ context: 'process-items', resourceName: 'map' }, this), {
      itemsPath: '$.Payload.items',
      resultPath: '$.mapResults',
      maxConcurrency: 2,
    });

    // Assign the map subtasks chain to the map state
    mapMapState.itemProcessor(mapMapSubTasks);

    // Define the state machine
    const processingMapChain = Chain
      .start(pdfToImagesTask)
      .next(mapMapState)
      .next(fileProcessingTask);

    // Create the state machine
    const stateMachineName = getCdkConstructId({ context: 'processing', resourceName: 'state-machine' }, this);
    this.stateMachine = new sfn.StateMachine(this, stateMachineName, {
      // stateMachineName: stateMachineName,
      stateMachineType: StateMachineType.STANDARD,
      definitionBody: sfn.DefinitionBody.fromChainable(processingMapChain),
      timeout: cdk.Duration.minutes(60),
      logs: {
        destination: processingStepFunctionLogGroup,
        level: sfn.LogLevel.ALL,
        includeExecutionData: true,
      },
    });

    // Nag Suppressions ---------------------------------------------------------------------------------------------
    // Lambda
    NagSuppressions.addResourceSuppressions(
      [
        pdfToImagesLambda,
        textExtractLambda,
        fileProcessingLambda,
      ],
      [{ id: 'HIPAA.Security-LambdaDLQ', reason: 'Lambda functions used in this solution are synchronous, DQL is not needed' }],
      true,
    );

    // IAM Roles
    NagSuppressions.addResourceSuppressions(
      [
        this.lambdaRole,
        this.stateMachine.role,
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
          reason: '* is used so that the Lambda function can create log groups',
        },
      ],
      true,
    );

    // State Machine
    NagSuppressions.addResourceSuppressions(
      [
        this.stateMachine,
      ],
      [
        {
          id: 'AwsSolutions-SF2',
          reason: 'Optional configuration for this solution',
        },
      ],
      true,
    );

    // Dynamo DB
    NagSuppressions.addResourceSuppressions(
      [
        this.dataTable,
      ],
      [
        {
          id: 'HIPAA.Security-DynamoDBAutoScalingEnabled',
          reason: 'This is too expensive for the demo',
        },
        {
          id: 'HIPAA.Security-DynamoDBInBackupPlan',
          reason: 'This is too expensive for the demo',
        },
        {
          id: 'HIPAA.Security-DynamoDBPITREnabled',
          reason: 'This is too expensive for the demo',
        },
      ],
      true,
    );
  }
}
