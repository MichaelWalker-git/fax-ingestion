import { execSync, ExecSyncOptions } from 'child_process';
import * as cdk from 'aws-cdk-lib';
import { CfnOutput, DockerImage, Fn, RemovalPolicy } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  Cors,
  EndpointType,
  LogGroupLogDestination,
  MethodLoggingLevel,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { CachePolicy, Distribution, SecurityPolicyProtocol, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import * as fsExtra from 'fs-extra';
import { getCdkConstructId } from '../shared/helpers';
import { Labels } from '../shared/labels';
import { ApiStack } from '../stacks/ApiStack';
import { CognitoStack } from '../stacks/resources/CognitoStack';
import { DynamoDbStack } from '../stacks/resources/DynamoDbStack';
import { FrontendStack } from '../stacks/resources/FrontendStack';
import { IamStack } from '../stacks/resources/IamStack';
import { KmsStack } from '../stacks/resources/KmsStack';
import { SageMakerStack } from '../stacks/resources/SageMakerStack';
import { Secret } from '../stacks/resources/SecretStack';
import { SqsStack } from '../stacks/resources/SQS';
import { StepFunctionsStack } from '../stacks/resources/StepFunctionsStack';
import { ThrottledS3NotificationStack } from '../stacks/resources/ThrottledS3NotificationStack';
import { VpcStack } from '../stacks/resources/VpcStack';
import { SharedResourcesStack } from '../stacks/SharedResourcesStack';
import {UserPool} from "aws-cdk-lib/aws-cognito";

export interface StackProps {
  labels: Labels;
}

export class BackendAppStack extends cdk.Stack {
  public readonly websiteBucket: IBucket;
  public readonly distribution: Distribution;
  public readonly cognitoUserPool: UserPool;

  constructor(scope: Construct, id: string, args: StackProps, props?: cdk.StackProps) {
    super(scope, id, props);

    const labels = args.labels;

    const importInputBucketName = 'ExportInputBucketName';
    const importOutputBucketName = 'ExportOutputBucketName';
    const importSageMakerAsyncBucketName = 'ExportSageMakerAsyncBucketName';
    const importWebsiteBucketName = 'ExportWebsiteBucketName';

    const inputBucketName = Fn.importValue(importInputBucketName);
    const outputBucketName = Fn.importValue(importOutputBucketName);
    const sageMakerAsyncBucketName = Fn.importValue(importSageMakerAsyncBucketName);
    const websiteBucketName = Fn.importValue(importWebsiteBucketName);

    const inputBucket = Bucket.fromBucketName(this, 'InputBucket', inputBucketName);
    const outputBucket = Bucket.fromBucketName(this, 'OutputBucket', outputBucketName);
    const sageMakerAsyncBucket = Bucket.fromBucketName(this, 'SageMakerAsyncBucket', sageMakerAsyncBucketName);
    const websiteBucket = Bucket.fromBucketName(this, 'WebsiteBucket', websiteBucketName);

    // IAM Stack
    const iamStack = new IamStack(this, 'Iam-Stack');

    // KMS Stack - Enhanced for marketplace with customer-managed keys
    const kmsStack = new KmsStack(this, 'Kms-Stack', {
      labels: labels,
    });
    const { kmsKey } = kmsStack;

    // Create secrets manager with marketplace-friendly configuration
    const stageName = this.node.tryGetContext('StageName') || process.env.STAGE || 'prod';

    /*    const secret = new Secret(this, 'Secret-Stack', {
      name: `${stageName}-${labels.application}-secret`, // Now stageName is a real string
      environment: labels.environment,
    });*/

    // VPC Stack - Use existing VPC if available, create new if not
    const vpcStack = new VpcStack(this, 'Vpc-Stack', {
      kmsKey,
    });
    const { vpc, securityGroupStepFunctions, securityGroupAPI, securityGroupS3 } = vpcStack;

    // DynamoDB Stack with point-in-time recovery for marketplace
    /*    const dynamoDbStack = new DynamoDbStack(this, 'DynamoDb-Stack', {
      kmsKey,
      labels: labels,
    });
    const { dataTable } = dynamoDbStack;*/

    /*    const sqsStack = new SqsStack(this, 'SQS-Stack', {
      kmsKey,
      labels: labels,
    });
    const { processingQueue } = sqsStack;*/

    // SageMaker Stack with configurable parameters
    const modelName = getCdkConstructId({ context: 'sagemaker', resourceName: 'qwen-model' }, this);
    const endpointName = getCdkConstructId({ context: 'sagemaker', resourceName: 'qwen-endpoint' }, this);
    const modelId = 'Qwen/Qwen2.5-VL-7B-Instruct';

    // TODO
    /*    const sageMakerStack = new SageMakerStack(this, 'SageMaker-Stack', {
      modelName,
      endpointName,
      modelId,
      kmsKey,
      vpc,
      sageMakerAsyncBucket,
      inferenceType: 'ASYNC',
      labels: labels,
    });*/

    // StepFunctions Stack
    /*    const stepFunctionsStack = new StepFunctionsStack(this, 'StepFunctions-Stack', {
      vpc,
      inputBucket,
      outputBucket,
      sageMakerAsyncBucket,
      kmsKey,
      dataTable,
      securityGroup: securityGroupStepFunctions,
      sageMakerEndpoint: endpointName,
    });
    const { stateMachine } = stepFunctionsStack;*/

    // TODO
    /*    // Throttled S3Notification Stack
    const s3NotificationStack = new ThrottledS3NotificationStack(this, 'S3-Notification-Stack', {
      vpc,
      dataTable,
      kmsKey,
      securityGroup: securityGroupS3,
      sageMakerAsyncBucket,
      labels: labels,
      inputBucket,
      outputBucket,
      stateMachineArn: stateMachine.stateMachineArn,
      processingQueue,
    });*/

    // Shared Resources Stack
    const sharedResourcesStack = new SharedResourcesStack(this, 'Shared-Resources-Stack', {
      kmsKey,
      labels: labels,
    });
    const { restApiLogGroup } = sharedResourcesStack;

    // Cognito Stack with marketplace parameters
    const cognitoStack = new CognitoStack(this, 'Cognito-Stack', {
      vpc,
      inputBucket,
      outputBucket,
      kmsKey,
      labels: labels,
    });
    const { userPool, cognitoClient, userPoolDomain, identityPool } = cognitoStack;

    this.cognitoUserPool = userPool;

    // API Stack with enhanced security
    const restApiName = getCdkConstructId({ context: 'processing', resourceName: 'rest-api' }, this);
    const restApi = new RestApi(this, restApiName, {
      restApiName: restApiName,
      description: 'AI-powered document processing API with SageMaker integration',
      endpointTypes: [EndpointType.REGIONAL],
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS, // Configure based on your security requirements
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
        stageName: stageName.valueAsString,
        loggingLevel: MethodLoggingLevel.INFO,
        tracingEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new LogGroupLogDestination(restApiLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      },
      policy: this.createRestrictiveApiPolicy(),
    });

    /*    const stackProps = {
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

    apiStack.addDependency(cognitoStack);*/

    /*    const frontendStack = new FrontendStack(this, 'FrontEnd-Stack', {
      /!*      cognitoClient: cognitoClient,
      identityPool: identityPool,
      userPool: userPool,*!/
      restApiEndpoint: restApi.url,
    });*/

    // frontendStack.addDependency(restApi);

    // frontendStack.addDependency(apiStack);
    // frontendStack.addDependency(cognitoStack);

    /*    new CfnOutput(this, 'RestApiUrl', {
      value: restApi.url,
      description: 'REST API Gateway URL for the application',
      exportName: `${labels.name()}-rest-api-uri`,
    });*/
    /*

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
          /!* istanbul ignore next *!/
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
      /!*      API_ENDPOINT: restApi.url,
      IDENTITY_POOL_ID: identityPool.ref,*!/
      // USER_POOL_ID: userPool.userPoolId,
      USER_POOL_ID: userPool,
      USER_POOL_CLIENT_ID: cognitoClient.userPoolClientId,
    };

    const bucketDeployment = new BucketDeployment(this, 'DeployBucket', {
      sources: [bundle, Source.jsonData('config.json', config)],
      destinationBucket: this.websiteBucket,
      distribution: this.distribution,
      distributionPaths: ['/!*'],
    });*/

    /*    bucketDeployment.node.addDependency(userPool);
    bucketDeployment.node.addDependency(cognitoClient);
    bucketDeployment.node.addDependency(identityPool);*/

    new CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
      exportName: 'CognitoUserPoolId',
    });

    new CfnOutput(this, 'RestApiUrl', {
      value: restApi.url,
      description: 'REST API Gateway URL for the application',
      exportName: 'rest-api-uri',
    });

    /*
    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID for authentication',
      exportName: `${labels.name()}-user-pool-id`,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: cognitoClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${labels.name()}-client-id`,
    });

    new CfnOutput(this, 'CognitoDomainUrl', {
      value: `https://${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
      description: 'Cognito hosted UI domain URL',
      exportName: `${labels.name()}-cognito-domain`,
    });

    new CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
      description: 'Cognito Identity Pool ID',
      exportName: `${labels.name()}-identity-pool-id`,
    });*/

    // TODO
    // Enhanced CDK Nag suppressions for marketplace compliance
    // this.addMarketplaceNagSuppressions(restApi, iamStack, s3NotificationStack, sageMakerStack);

    // Add suppressions for BucketNotificationsHandler (auto-generated by CDK)
    this.addBucketNotificationHandlerSuppressions();
  }

  private createRestrictiveApiPolicy(): any {
    // Create a more restrictive API Gateway resource policy for HIPAA compliance
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: 'execute-api:Invoke',
          Resource: 'arn:aws:execute-api:*:*:*',
          Condition: {
            IpAddress: {
              'aws:SourceIp': [
                // Add your allowed IP ranges here
                '10.0.0.0/8',
                '172.16.0.0/12',
                '192.168.0.0/16',
              ],
            },
          },
        },
      ],
    };
  }

  private addBucketNotificationHandlerSuppressions(): void {
    // Suppress violations for the auto-generated BucketNotificationsHandler
    // This construct is created automatically when using S3 bucket notifications
    /*    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/prod/fax-eu-central-1-prod-fax-ingestion-backend-app/BucketNotificationsHandler050a0587b7544547bf325f094a3db834/Role',
      [
        {
          id: 'AwsSolutions-IAM4',
          reason: 'BucketNotificationsHandler is an auto-generated CDK construct that requires AWS managed policies for S3 bucket notification configuration. This is necessary for the CDK to manage S3 event notifications.',
          appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
        },
      ],
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/prod/fax-eu-central-1-prod-fax-ingestion-backend-app/BucketNotificationsHandler050a0587b7544547bf325f094a3db834/Role/DefaultPolicy',
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'BucketNotificationsHandler is an auto-generated CDK construct that requires wildcard permissions to configure S3 bucket notifications across different buckets and regions.',
          appliesTo: ['Resource::*'],
        },
        {
          id: 'HIPAA.Security-IAMNoInlinePolicy',
          reason: 'BucketNotificationsHandler is an auto-generated CDK construct that uses inline policies for S3 bucket notification configuration. This is managed by the CDK framework and cannot be changed to managed policies.',
        },
      ],
    );*/
  }

  private addMarketplaceNagSuppressions(
    restApi: RestApi,
    iamStack: IamStack,
    s3NotificationStack: ThrottledS3NotificationStack,
    sageMakerStack: SageMakerStack,
  ): void {
    // IAM Roles
    NagSuppressions.addResourceSuppressions(
      [restApi, iamStack, s3NotificationStack, sageMakerStack],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Wildcard permissions are required for CloudWatch Logs creation and SageMaker model access patterns',
        },
        {
          id: 'AwsSolutions-IAM4',
          reason: 'AWS managed policies are used for standard service integrations and are regularly updated by AWS',
        },
        {
          id: 'HIPAA.Security-IAMNoInlinePolicy',
          reason: 'Inline policies are necessary for dynamic resource creation in custom resources and Lambda triggers',
        },
        {
          id: 'AwsSolutions-APIG2',
          reason: 'Request validation is implemented at the application level; additional gateway-level validation may be configured post-deployment',
        },
        {
          id: 'AwsSolutions-APIG3',
          reason: 'WAF integration is available as a post-deployment configuration option based on customer security requirements',
        },
        {
          id: 'AwsSolutions-APIG4',
          reason: 'API Gateway authorization is implemented using Cognito User Pools as configured in the authentication stack',
        },
      ],
      true,
    );

    // Lambda Functions
    NagSuppressions.addResourceSuppressions(
      [iamStack, s3NotificationStack],
      [
        {
          id: 'HIPAA.Security-LambdaDLQ',
          reason: 'DLQ configuration is available for production workloads; custom resources are short-lived deployment functions',
        },
        {
          id: 'HIPAA.Security-LambdaInsideVPC',
          reason: 'VPC configuration applied selectively based on data access patterns; custom resources do not require VPC access',
        },
        {
          id: 'AwsSolutions-L1',
          reason: 'Lambda runtime versions are maintained and updated regularly; current runtime is appropriate for the workload',
        },
        {
          id: 'HIPAA.Security-LambdaConcurrency',
          reason: 'Concurrency limits can be configured post-deployment based on expected load patterns',
        },
      ],
      true,
    );

    // API Gateway
    NagSuppressions.addResourceSuppressions(
      [restApi],
      [
        {
          id: 'HIPAA.Security-APIGWSSLEnabled',
          reason: 'TLS 1.2+ is enforced by default on all API Gateway endpoints; additional SSL policies can be configured',
        },
        {
          id: 'HIPAA.Security-APIGWCacheEnabledAndEncrypted',
          reason: 'Caching configuration is optional and can be enabled post-deployment with encryption based on performance requirements',
        },
        {
          id: 'AwsSolutions-APIG1',
          reason: 'Access logging is enabled with structured JSON format to CloudWatch; additional log destinations can be configured',
        },
      ],
      true,
    );

    // SageMaker
    NagSuppressions.addResourceSuppressions(
      [sageMakerStack],
      [
        {
          id: 'AwsSolutions-SM1',
          reason: 'SageMaker endpoints are deployed in customer VPC with appropriate security groups for network isolation',
        },
        {
          id: 'AwsSolutions-SM2',
          reason: 'Model data encryption is enabled using customer-managed KMS keys; additional encryption options available',
        },
      ],
      true,
    );
  }
}
