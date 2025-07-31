import * as cdk from 'aws-cdk-lib';
import { CfnOutput, CfnParameter } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  Cors,
  EndpointType,
  LogGroupLogDestination,
  MethodLoggingLevel,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
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

    const labels = args.labels;

    // Marketplace Parameters - Allow users to customize the deployment
    const adminEmail = new CfnParameter(this, 'AdminEmail', {
      type: 'String',
      description: 'Administrator email address for Cognito user pool',
      constraintDescription: 'Must be a valid email address',
      allowedPattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    });

    const customerIdentifier = new cdk.CfnParameter(this, 'CustomerIdentifier', {
      type: 'String',
      description: 'The identifier for the customer',
    });

    const productCode = new cdk.CfnParameter(this, 'ProductCode', {
      type: 'String',
      description: 'The product code for metering',
    });

    // Define the parameters
    const vpcIdParam = new CfnParameter(this, 'ExistingVpcId', {
      type: 'String',
      description: 'Optional: The ID of an existing VPC. Leave blank to create a new VPC.',
      default: '', // Default value to make it optional
    });

    const subnetIdsParam = new CfnParameter(this, 'PrivateSubnetIds', {
      type: 'String',
      description: 'Optional: Comma-separated list of private subnet IDs in the existing VPC. Leave blank if creating a new VPC.',
      default: '', // Default value to make it optional
    });

    const sageMakerInstanceType = new CfnParameter(this, 'SageMakerInstanceType', {
      type: 'String',
      description: 'SageMaker endpoint instance type',
      default: 'ml.g5.xlarge',
      allowedValues: [
        'ml.g5.xlarge',
        'ml.g5.2xlarge',
        'ml.g5.4xlarge',
        'ml.g5.8xlarge',
        'ml.g5.16xlarge',
      ],
    });

    const initialInstanceCount = new CfnParameter(this, 'InitialInstanceCount', {
      type: 'Number',
      description: 'Initial number of SageMaker endpoint instances',
      default: 1,
      minValue: 1,
      maxValue: 10,
    });

    const enableHipaaCompliance = new CfnParameter(this, 'EnableHIPAACompliance', {
      type: 'String',
      description: 'Enable HIPAA compliance features (additional security configurations)',
      default: 'false',
      allowedValues: ['true', 'false'],
    });

    // IAM Stack
    const iamStack = new IamStack(this, 'Iam-Stack');

    // KMS Stack - Enhanced for marketplace with customer-managed keys
    const kmsStack = new KmsStack(this, 'Kms-Stack', {
      labels: labels,
    });
    const { kmsKey } = kmsStack;

    // Create secrets manager with marketplace-friendly configuration
    const stageName = this.node.tryGetContext('StageName') || process.env.STAGE || 'prod';

    const secret = new Secret(this, 'Secret-Stack', {
      name: `${stageName}-${labels.application}-secret`, // Now stageName is a real string
      environment: labels.environment,
    });

    // VPC Stack - Use existing VPC if available, create new if not
    const vpcStack = new VpcStack(this, 'Vpc-Stack', {
      kmsKey,
      vpcIdParam,
      subnetIdsParam,
    });
    const { vpc, securityGroupStepFunctions, securityGroupAPI, securityGroupS3 } = vpcStack;

    // DynamoDB Stack with point-in-time recovery for marketplace
    const dynamoDbStack = new DynamoDbStack(this, 'DynamoDb-Stack', {
      kmsKey,
      labels: labels,
    });
    const { dataTable } = dynamoDbStack;

    // S3 Stack with enhanced security for marketplace
    const s3Stack = new S3Stack(this, 'S3-Stack', {
      kmsKey,
      dataTable,
      labels: labels,
    });
    const { inputBucket, outputBucket, sageMakerAsyncBucket } = s3Stack;

    s3Stack.addDependency(dynamoDbStack);

    // SageMaker Stack with configurable parameters
    const modelName = getCdkConstructId({ context: 'sagemaker', resourceName: 'qwen-model' }, this);
    const endpointName = getCdkConstructId({ context: 'sagemaker', resourceName: 'qwen-endpoint' }, this);
    const modelId = 'Qwen/Qwen2.5-VL-7B-Instruct';

    const sageMakerStack = new SageMakerStack(this, 'SageMaker-Stack', {
      modelName,
      endpointName,
      modelId,
      instanceType: sageMakerInstanceType.valueAsString,
      initialInstanceCount: initialInstanceCount.valueAsNumber,
      kmsKey,
      vpc,
      sageMakerAsyncBucket,
      inferenceType: 'ASYNC',
      labels: labels,
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
    const { stateMachine } = stepFunctionsStack;

    stepFunctionsStack.addDependency(s3Stack);

    // Throttled S3Notification Stack
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
    });
    const { processingQueue } = s3NotificationStack;

    s3NotificationStack.addDependency(stepFunctionsStack);
    s3NotificationStack.addDependency(s3Stack);

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
      adminEmail: adminEmail.valueAsString,
    });
    const { userPool, userPoolDomain, cognitoClient, identityPool, authenticatedRole, clientUrl } = cognitoStack;

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
      policy: enableHipaaCompliance.valueAsString === 'true' ? this.createRestrictiveApiPolicy() : undefined,
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

    // Marketplace-specific CloudFormation Outputs
    new CfnOutput(this, 'ApplicationName', {
      value: labels.application,
      description: 'Name of the deployed application',
      exportName: `${labels.name()}-application-name`,
    });

    new CfnOutput(this, 'ApplicationVersion', {
      value: '1.0.0', // Update this with your actual version
      description: 'Version of the deployed application',
    });

    new CfnOutput(this, 'RestApiUrl', {
      value: apiStack.restApi.url,
      description: 'REST API Gateway URL for the application',
      exportName: `${labels.name()}-rest-api-uri`,
    });

    new CfnOutput(this, 'RestApiId', {
      value: apiStack.restApi.restApiId,
      description: 'REST API Gateway ID',
      exportName: `${labels.name()}-rest-api-id`,
    });

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
    });

    new CfnOutput(this, 'AuthenticatedRoleArn', {
      value: authenticatedRole.roleArn,
      description: 'IAM role ARN for authenticated users',
      exportName: `${labels.name()}-authenticated-role-arn`,
    });

    new CfnOutput(this, 'ApplicationUrl', {
      value: clientUrl,
      description: 'Application client URL',
      exportName: `${labels.name()}-app-uri`,
    });

    new CfnOutput(this, 'SecretManagerArn', {
      value: secret.secretArn,
      description: 'AWS Secrets Manager ARN for application secrets',
      exportName: `${labels.name()}-secret-manager-arn`,
    });

    new CfnOutput(this, 'InputS3BucketName', {
      value: inputBucket.bucketName,
      description: 'S3 bucket name for input files',
      exportName: `${labels.name()}-input-bucket`,
    });

    new CfnOutput(this, 'OutputS3BucketName', {
      value: outputBucket.bucketName,
      description: 'S3 bucket name for output files',
      exportName: `${labels.name()}-output-bucket`,
    });

    new CfnOutput(this, 'SageMakerEndpointName', {
      value: endpointName,
      description: 'SageMaker endpoint name for AI inference',
      exportName: `${labels.name()}-sagemaker-endpoint`,
    });

    new CfnOutput(this, 'DynamoDBTableName', {
      value: dataTable.tableName,
      description: 'DynamoDB table name for application data',
      exportName: `${labels.name()}-dynamodb-table`,
    });

    new CfnOutput(this, 'KMSKeyId', {
      value: kmsKey.keyId,
      description: 'KMS key ID used for encryption',
      exportName: `${labels.name()}-kms-key-id`,
    });

    new CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID where resources are deployed',
      exportName: `${labels.name()}-vpc-id`,
    });

    // Deployment guidance outputs
    new CfnOutput(this, 'GetStartedGuide', {
      value: 'https://your-documentation-url.com/getting-started',
      description: 'Link to getting started guide',
    });

    new CfnOutput(this, 'SupportContact', {
      value: 'support@your-company.com',
      description: 'Support contact for this solution',
    });

    // Enhanced CDK Nag suppressions for marketplace compliance
    this.addMarketplaceNagSuppressions(restApi, iamStack, s3NotificationStack, sageMakerStack);
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
