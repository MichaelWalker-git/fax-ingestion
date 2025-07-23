import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  Cors,
  EndpointType,
  LogGroupLogDestination,
  MethodLoggingLevel,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { STAGES } from '../shared/constants';
import { getCdkConstructId } from '../shared/helpers';
import { Labels } from '../shared/labels';
import { ApiStack } from '../stacks/ApiStack';
import { CognitoStack } from '../stacks/resources/CognitoStack';
import { DynamoDbStack } from '../stacks/resources/DynamoDbStack';
import { IamStack } from '../stacks/resources/IamStack';
import { KmsStack } from '../stacks/resources/KmsStack';
import { S3Stack } from '../stacks/resources/S3Stack';
import { SageMakerStack } from '../stacks/resources/SageMakerStack';
import { Secret } from '../stacks/resources/SecretStack';
import { StepFunctionsStack } from '../stacks/resources/StepFunctionsStack';
import { ThrottledS3NotificationStack } from '../stacks/resources/ThrottledS3NotificationStack';
import { VpcStack } from '../stacks/resources/VpcStack';
import { SharedResourcesStack } from '../stacks/SharedResourcesStack';

export interface StackProps {
  labels: Labels;
}

export class BackendAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, args: StackProps, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM Stack
    const iamStack = new IamStack(this, 'Iam-Stack');

    // KMS Stack
    const kmsStack = new KmsStack(this, 'Kms-Stack', {
      labels: args.labels,
    });
    const { kmsKey } = kmsStack;

    // Create secrets manager
    const secret = new Secret(this, `${process.env.STAGE}-scrt`, {
      name: `${process.env.STAGE}-secret`,
      environment: args.labels.environment,
    });

    // VPC Stack
    const vpcStack = new VpcStack(this, 'Vpc-Stack', { kmsKey });
    const { vpc, securityGroupStepFunctions, securityGroupAPI, securityGroupS3, securityGroupOpenSearch } = vpcStack;

    securityGroupOpenSearch.addIngressRule(
      securityGroupAPI,
      ec2.Port.tcp(443),
      'Allow API Lambdas to access OpenSearch over HTTPS',
    );

    // DynamoDB Stack
    const dynamoDbStack = new DynamoDbStack(this, 'DynamoDb-Stack', {
      kmsKey,
      labels: args.labels,
      vpc,
      securityGroup: securityGroupOpenSearch,
    });
    const { dataTable } = dynamoDbStack;

    // S3 Stack
    const s3Stack = new S3Stack(this, 'S3-Stack', {
      kmsKey,
      dataTable,
      vpc,
      labels: args.labels,
    });
    const { inputBucket, outputBucket, sageMakerAsyncBucket } = s3Stack;

    // SageMaker Stack
    const modelName = getCdkConstructId({ context: 'sagemaker', resourceName: 'qwen-model' }, this);
    const endpointName = getCdkConstructId({ context: 'sagemaker', resourceName: 'qwen-endpoint' }, this);
    const modelId = 'Qwen/Qwen2.5-VL-7B-Instruct';

    new SageMakerStack(this, 'SageMaker-Stack', {
      modelName,
      endpointName,
      modelId,
      instanceType: 'ml.g5.xlarge',
      initialInstanceCount: 1,
      kmsKey,
      vpc,
      sageMakerAsyncBucket,
      inferenceType: 'ASYNC', // 'ASYNC', 'SYNC',
      labels: args.labels,
    });

    // StepFunctions Stack
    const stepFunctionsStack = new StepFunctionsStack(this, 'StepFunctions-Stack', {
      vpc,
      inputBucket,
      outputBucket,
      sageMakerAsyncBucket,
      kmsKey,
      dataTable,
      securityGroup: securityGroupStepFunctions,
      sageMakerEndpoint: endpointName,
    });

    // Throttled S3Notification Stack
    const s3NotificationStack = new ThrottledS3NotificationStack(this, 'S3-Notification-Stack', {
      vpc,
      dataTable,
      kmsKey,
      securityGroup: securityGroupS3,
      sageMakerAsyncBucket,
      labels: args.labels,
    });

    s3NotificationStack.addDependency(stepFunctionsStack);
    s3NotificationStack.addDependency(s3Stack);

    // Shared Resources Stack
    const sharedResourcesStack = new SharedResourcesStack(this, 'Shared-Resources-Stack', {
      kmsKey,
      labels: args.labels,
    });
    const { restApiLogGroup } = sharedResourcesStack;


    // Cognito Stack
    const cognitoStack = new CognitoStack(this, 'Cognito-Stack', {
      vpc,
      inputBucket,
      outputBucket,
      kmsKey,
      labels: args.labels,
    });
    const { userPool, userPoolDomain, cognitoClient, identityPool, authenticatedRole, clientUrl } = cognitoStack;

    // API Stack
    const restApiName = getCdkConstructId({ context: 'processing', resourceName: 'rest-api' }, this);
    const restApi = new RestApi(this, restApiName, {
      restApiName: restApiName,
      endpointTypes: [EndpointType.REGIONAL],
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'Domain-Name',
        ],
      },
      deployOptions: {
        stageName: process.env.STAGE || STAGES.dev,
        loggingLevel: MethodLoggingLevel.INFO,
        tracingEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new LogGroupLogDestination(restApiLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      },
    });

    const stackProps = {
      securityGroup: securityGroupAPI,
      restApi: restApi,
      dataTableName: dataTable.tableName,
      inputBucketName: inputBucket.bucketName,
      outputBucketName: outputBucket.bucketName,
      tableName: dataTable.tableName,
      tableArn: dataTable.tableArn,
      vpc: vpc,
      kmsKey: kmsKey,
      userPool: userPool,
    };

    // Api Stack
    const apiStack = new ApiStack(this, 'Api-Stack', stackProps);


    // Outputs
    const restApiUri = getCdkConstructId({ context: 'rest-api', resourceName: 'uri' }, this);
    new CfnOutput(this, restApiUri, {
      value: apiStack.restApi.url,
      exportName: `${args.labels.name()}-rest-api-uri`,
    });

    const userPoolIdOutput = getCdkConstructId({ context: 'cognito', resourceName: 'user-pool-id' }, this);
    new CfnOutput(this, userPoolIdOutput, {
      value: userPool.userPoolId,
      exportName: `${args.labels.name()}-user-pool-id`,
    });

    const cognitoDomainOutput = getCdkConstructId({ context: 'cognito', resourceName: 'domain' }, this);
    new CfnOutput(this, cognitoDomainOutput, {
      value: 'https://'+userPoolDomain.domainName+'.auth.'+this.region+'.amazoncognito.com',
      exportName: `${args.labels.name()}-cognito-domain`,
    });

    const clientIdOutput = getCdkConstructId({ context: 'cognito', resourceName: 'client-id' }, this);
    new CfnOutput(this, clientIdOutput, {
      value: cognitoClient.userPoolClientId,
      exportName: `${args.labels.name()}-client-id`,
    });

    new CfnOutput(this, `${args.labels.name()}-identity-pool-id`, {
      value: identityPool.ref,
    });

    new CfnOutput(this, `${args.labels.name()}-authenticated-role-arn`, {
      value: authenticatedRole.roleArn,
    });

    new CfnOutput(this, `${args.labels.name()}-app-uri`, {
      value: clientUrl,
    });

    new CfnOutput(this, `${args.labels.name()}-secret-manager`, {
      value: secret.secretArn,
    });

    // IAM Roles
    NagSuppressions.addResourceSuppressions(
      [restApi, iamStack, s3NotificationStack],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: '* is used so that the Lambda function can create log groups',
        },
        {
          id: 'HIPAA.Security-IAMNoInlinePolicy',
          reason: 'Inline policies are required for dynamically created resources in BucketHandlerNotification',
        },
        {
          id: 'AwsSolutions-IAM4',
          reason: 'CDK Custom Resource Lambdas require managed policies for deployment and clean-up',
        },
        {
          id: 'AwsSolutions-APIG2',
          reason: 'Execution logging is enabled, but not using custom domain; this is acceptable for internal or dev usage',
        },
      ],
      true,
    );

    // Lambda
    NagSuppressions.addResourceSuppressions(
      [iamStack],
      [
        {
          id: 'HIPAA.Security-LambdaDLQ',
          reason: 'Custom resource Lambdas are short-lived and used only during deployment, DLQ not required',
        },
        {
          id: 'HIPAA.Security-LambdaInsideVPC',
          reason: 'Custom resource Lambdas do not access VPC resources; VPC configuration is unnecessary',
        },
        {
          id: 'AwsSolutions-L1',
          reason: 'Runtime is current and maintained; warning can be ignored for Custom Resource usage',
        },
        {
          id: 'HIPAA.Security-LambdaConcurrency',
          reason: 'No concurrency limit required for non-production, deployment-time Lambdas',
        },
      ],
      true,
    );

    // Api Gateway
    NagSuppressions.addResourceSuppressions(
      [restApi],
      [
        {
          id: 'HIPAA.Security-APIGWSSLEnabled',
          reason: 'TLS enforcement is not needed for a non-production, demo environment',
        },
        {
          id: 'HIPAA.Security-APIGWCacheEnabledAndEncrypted',
          reason: 'API Gateway caching is disabled to reduce cost in demo environments',
        },
      ],
      true,
    );
  }
}
