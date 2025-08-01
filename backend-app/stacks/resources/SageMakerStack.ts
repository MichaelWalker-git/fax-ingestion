import * as path from 'path';
import { CustomResource, Duration, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Architecture, DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { createDefaultLambdaRole, getCdkConstructId, getPolicyStatement } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

export interface LlamaNemotronStackProps extends cdk.StackProps {
  modelName: string;
  endpointName: string;
  modelId: string;
  instanceType?: string;
  inferenceType?: string;
  initialInstanceCount?: number;
  kmsKey: Key;
  vpc: IVpc;
  sageMakerAsyncBucket: IBucket;
  labels: Labels;
}

export class SageMakerStack extends NestedStack {
  public readonly endpointName: string;
  public readonly modelName: string;
  public readonly modelId: string;
  public readonly inferenceType?: string;
  public readonly kmsKey: Key;
  public readonly vpc: IVpc;
  public readonly instanceType?: string;
  public readonly initialInstanceCount?: number;
  public readonly removalPolicy = RemovalPolicy.DESTROY;
  public readonly sageMakerAsyncBucket: IBucket;

  constructor(scope: Construct, id: string, props: LlamaNemotronStackProps) {
    super(scope, id, props);

    this.kmsKey = props.kmsKey;
    this.vpc = props.vpc;

    this.modelName = props?.modelName || '';
    this.endpointName = props?.endpointName || '';
    this.modelId = props?.modelId || '';
    this.inferenceType = props?.inferenceType;
    this.instanceType = props?.instanceType || 'ml.g5.2xlarge';
    this.initialInstanceCount = props?.initialInstanceCount || 1;
    this.sageMakerAsyncBucket = props.sageMakerAsyncBucket;

    // Security group
    const securityGroup = new SecurityGroup(scope, getCdkConstructId({ context: 'deploy-model-to-sagemaker', resourceName: 'security-group' }, this), {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    // IAM Role
    const sageMakerRole = new iam.Role(this, getCdkConstructId({ context: 'deploy-model-to-sagemaker', resourceName: 'iam-role' }, this), {
      assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'),
      ],
      inlinePolicies: {
        HuggingFacePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'ecr:BatchCheckLayerAvailability',
                'ecr:GetDownloadUrlForLayer',
                'ecr:BatchGetImage',
                'ecr:GetAuthorizationToken',
              ],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:DescribeLogStreams',
              ],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:PutObject',
                's3:GetObject',
                's3:PutObjectAcl',
                's3:ListBucket',
                's3:DeleteObject',
                's3:CreateBucket',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    const deployModelToSageMakerLambdaRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'deploy-model-to-sagemaker', resourceName: 'lambda-role' }, this));
    deployModelToSageMakerLambdaRole.addToPolicy(getPolicyStatement({
      service: 'sagemaker',
      operations: ['*'],
      resources: ['*'],
    }));
    deployModelToSageMakerLambdaRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['PutObject', 'GetObject', 'PutObjectAcl', 'ListBucket', 'DeleteObject', 'CreateBucket'],
      resources: ['*'],
    }));
    deployModelToSageMakerLambdaRole.addToPolicy(getPolicyStatement({
      service: 'ecr',
      operations: [
        'BatchCheckLayerAvailability',
        'GetDownloadUrlForLayer',
        'BatchGetImage',
        'GetAuthorizationToken',
      ],
      resources: ['*'],
    }));
    deployModelToSageMakerLambdaRole.addToPolicy(getPolicyStatement({
      service: 'kms',
      operations: ['Encrypt', 'Decrypt', 'GenerateDataKey'],
      resources: [this.kmsKey.keyArn],
    }));
    deployModelToSageMakerLambdaRole.addToPolicy(getPolicyStatement({
      service: 'iam',
      operations: ['PassRole'],
      resources: ['*'],
    }));
    deployModelToSageMakerLambdaRole.addToPolicy(getPolicyStatement({
      service: 'logs',
      operations: [
        'CreateLogGroup',
        'CreateLogStream',
        'PutLogEvents',
        'DescribeLogGroups',
        'DescribeLogStreams',
      ],
      resources: ['*'],
    }));

    const huggingfaceHubTokenParam = new cdk.CfnParameter(this, 'HuggingFaceHubToken', {
      type: 'String',
      // noEcho: true, // hides it in the console
      description: 'HuggingFace Hub token for model access',
      default: process.env.HUGGINGFACE_HUB_TOKEN || '',
    });

    // Lambdas
    const deployModelTOSageMakerName = getCdkConstructId({ context: 'deploy-model-to-sagemaker', resourceName: 'lambda' }, this);
    const deployModelToSageMakerLambda = new DockerImageFunction(this, deployModelTOSageMakerName, {
      functionName: deployModelTOSageMakerName,
      code: DockerImageCode.fromImageAsset(path.join(__dirname, '../../resources/lambda/sageMaker/deployModel')),
      timeout: Duration.minutes(15),
      memorySize: 2048,
      architecture: Architecture.X86_64,
      role: deployModelToSageMakerLambdaRole,
      vpc: this.vpc,
      securityGroups: [securityGroup],
      reservedConcurrentExecutions: 5,
      environment: {
        ROLE_ARN: sageMakerRole.roleArn,
        HUGGINGFACE_HUB_TOKEN: huggingfaceHubTokenParam.valueAsString,
        ENDPOINT_NAME: this.endpointName, // 'llama-nemotron-nano-endpoint',
        MODEL_NAME: this.modelName, // 'llama-nemotron-nano-model',
        HF_MODEL_ID: this.modelId, // 'nvidia/Llama-3.1-Nemotron-Nano-8B-v1', // 'Qwen/Qwen2.5-VL-7B-Instruct'
        INSTANCE_TYPE: this.instanceType,
        INSTANCE_COUNT: this.initialInstanceCount.toString(),
        INFERENCE_TYPE: this.inferenceType || 'SYNC',
        ASYNC_S3_BUCKET: this.sageMakerAsyncBucket.bucketName,
      },
    });

    // Custom resource
    const customResourceProviderRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'deploy-model-to-sagemaker', resourceName: 'custom-resource-role' }, this) );
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 'sagemaker',
      operations: ['*'],
      resources: ['*'],
    }));
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['PutObject', 'GetObject', 'PutObjectAcl', 'ListBucket', 'DeleteObject'],
      resources: ['*'],
    }));
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 'ecr',
      operations: [
        'BatchCheckLayerAvailability',
        'GetDownloadUrlForLayer',
        'BatchGetImage',
        'GetAuthorizationToken',
      ],
      resources: ['*'],
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
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 'iam',
      operations: ['PassRole'],
      resources: ['*'],
    }));
    customResourceProviderRole.addToPolicy(getPolicyStatement({
      service: 'logs',
      operations: [
        'CreateLogGroup',
        'CreateLogStream',
        'PutLogEvents',
        'DescribeLogGroups',
        'DescribeLogStreams',
      ],
      resources: ['*'],
    }));

    const customResourceProvider = new Provider(this, getCdkConstructId({ context: 'deploy-model-to-sagemaker', resourceName: 'custom-resource-provider' }, this), {
      onEventHandler: deployModelToSageMakerLambda,
      vpc: this.vpc,
      role: customResourceProviderRole,
      securityGroups: [securityGroup],
    });

    new CustomResource(this, getCdkConstructId({ context: 'deploy-model-to-sagemaker', resourceName: 'custom-resource' }, this), {
      serviceToken: customResourceProvider.serviceToken,
      properties: {},
    });

    // Outputs
    new cdk.CfnOutput(this, 'ModelName', {
      value: this.modelName,
      description: 'SageMaker Model Name',
    });

    new cdk.CfnOutput(this, 'EndpointName', {
      value: this.endpointName,
      description: 'SageMaker Endpoint Name',
    });

    new cdk.CfnOutput(this, 'SageMakerRoleArn', {
      value: sageMakerRole.roleArn,
      description: 'SageMaker Execution Role ARN',
    });

    // Lambda
    NagSuppressions.addResourceSuppressions(
      [
        deployModelToSageMakerLambda,
        customResourceProvider,
      ],
      [{ id: 'HIPAA.Security-LambdaDLQ', reason: 'Lambda functions used in this solution are synchronous, DQL is not needed' }],
      true,
    );

    NagSuppressions.addResourceSuppressions(
      [customResourceProvider],
      [
        { id: 'HIPAA.Security-LambdaConcurrency', reason: 'Raised on a custom Lambda not created by our template' },
        { id: 'AwsSolutions-L1', reason: 'Raised on a custom Lambda not created by our template' },
      ],
      true,
    );

    // IAM Roles
    NagSuppressions.addResourceSuppressions([
      sageMakerRole,
      customResourceProviderRole,
      deployModelToSageMakerLambdaRole,
    ],
    [
      {
        id: 'AwsSolutions-IAM5',
        reason: '* is used so that the Lambda function can create log groups',
      },
      {
        id: 'HIPAA.Security-IAMNoInlinePolicy',
        reason: 'Inline policies are acceptable for this use case.',
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
