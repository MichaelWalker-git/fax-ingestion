import { NestedStack } from 'aws-cdk-lib';
import { AuthorizationType, LambdaIntegration, RestApi, CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IVpc, SecurityGroup, Port } from 'aws-cdk-lib/aws-ec2';
import { Key } from 'aws-cdk-lib/aws-kms';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { HttpMethods } from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { deleteFile, getFile, getFilesList } from '../../resources/lambda/files';
import { createDefaultLambdaRole, getCdkConstructId, getPolicyStatement } from '../../shared/helpers';

interface NestedApiStackProps {
  restApi: RestApi;
  tableName: string;
  tableArn: string;
  vpc: IVpc;
  securityGroup: SecurityGroup;
  inputBucketName: string;
  outputBucketName: string;
  kmsKey: Key;
  userPool: UserPool;
}

export class FileApiStack extends NestedStack {
  public readonly restApi: RestApi;
  public readonly tableName: string;
  public readonly tableArn: string;
  public readonly vpc: IVpc;
  public readonly securityGroup: SecurityGroup;
  public readonly inputBucketName: string;
  public readonly outputBucketName: string;
  public readonly kmsKey: Key;
  public readonly userPool: UserPool;

  constructor(scope: Construct, id: string, props: NestedApiStackProps, lambdaProps?: NodejsFunctionProps) {
    const stackName = getCdkConstructId({ context: 'file-api', resourceName: 'stack' }, scope);
    super(scope, stackName);

    this.restApi = props.restApi;
    this.tableName = props.tableName;
    this.tableArn = props.tableArn;
    this.vpc = props.vpc;
    this.securityGroup = props.securityGroup;
    this.inputBucketName = props.inputBucketName;
    this.outputBucketName = props.outputBucketName;
    this.kmsKey = props.kmsKey;
    this.userPool = props.userPool;

    // Allow Lambda access to OpenSearch in same SG
    this.securityGroup.addIngressRule(
      this.securityGroup,
      Port.tcp(443),
      'Allow Lambdas in same SG to access OpenSearch over HTTPS',
    );

    //Roles
    const getFileRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'get-file', resourceName: 'role' }, scope));
    getFileRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['GetItem'],
      resources: [this.tableArn],
    }));
    getFileRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['GetObject', 'ListBucket'],
      resources: [
        `arn:aws:s3:::${this.inputBucketName}`,
        `arn:aws:s3:::${this.inputBucketName}/*`,
        `arn:aws:s3:::${this.outputBucketName}`,
        `arn:aws:s3:::${this.outputBucketName}/*`,
      ],
    }));
    getFileRole.addToPolicy(getPolicyStatement({
      service: 'kms',
      operations: ['Encrypt', 'Decrypt', 'GenerateDataKey'],
      resources: [this.kmsKey.keyArn],
    }));

    const deleteFileRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'delete-file', resourceName: 'role' }, scope));
    deleteFileRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['DeleteItem', 'GetItem', 'Query'],
      resources: [this.tableArn],
    }));
    deleteFileRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['DeleteObject'],
      resources: [
        `arn:aws:s3:::${this.inputBucketName}`,
        `arn:aws:s3:::${this.inputBucketName}/*`,
        `arn:aws:s3:::${this.outputBucketName}`,
        `arn:aws:s3:::${this.outputBucketName}/*`,
      ],
    }));

    const getFilesListRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'get-files-list', resourceName: 'role' }, scope));
    getFilesListRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['Query'],
      resources: [
        this.tableArn,
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${this.tableName}/index/*`,
      ],
    }));

    const reviewFileRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'review-file', resourceName: 'role' }, scope));
    reviewFileRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['UpdateItem', 'GetItem'],
      resources: [this.tableArn],
    }));
    reviewFileRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['PutObject', 'GetObject', 'PutObjectAcl', 'ListBucket', 'DeleteObject', 'GetItem'],
      resources: [
        `arn:aws:s3:::${this.outputBucketName}`,
        `arn:aws:s3:::${this.outputBucketName}/*`,
      ],
    }));
    reviewFileRole.addToPolicy(getPolicyStatement({
      service: 'kms',
      operations: ['Encrypt', 'Decrypt', 'GenerateDataKey'],
      resources: [this.kmsKey.keyArn],
    }));

    const updateProcessingResultRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'update-processing-result', resourceName: 'role' }, scope));
    updateProcessingResultRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['GetItem'],
      resources: [this.tableArn],
    }));
    updateProcessingResultRole.addToPolicy(getPolicyStatement({
      service: 's3',
      operations: ['PutObject'],
      resources: [
        `arn:aws:s3:::${this.outputBucketName}`,
        `arn:aws:s3:::${this.outputBucketName}/*`,
      ],
    }));
    updateProcessingResultRole.addToPolicy(getPolicyStatement({
      service: 'kms',
      operations: ['GenerateDataKey'],
      resources: [this.kmsKey.keyArn],
    }));
    updateProcessingResultRole.addToPolicy(getPolicyStatement({
      service: 'dynamodb',
      operations: ['UpdateItem'],
      resources: [this.tableArn],
    }));

    // Lambdas
    const getFileLambda = getFile(this, {
      TABLE_NAME: this.tableName,
      INPUT_BUCKET: this.inputBucketName,
      OUTPUT_BUCKET: this.outputBucketName,
    }, getFileRole, this.vpc, this.securityGroup);

    const getFilesListLambda = getFilesList(this, {
      TABLE_NAME: this.tableName,
    }, getFilesListRole, this.vpc, this.securityGroup);

    const deleteFileLambda = deleteFile(this, {
      INPUT_BUCKET: this.inputBucketName,
      TABLE_NAME: this.tableName,
      REGION: this.region || 'eu-central-1',
    }, deleteFileRole, this.vpc, this.securityGroup);

    // Authorizer
    const authorizer = new CognitoUserPoolsAuthorizer(this, getCdkConstructId({ context: 'cognito', resourceName: 'authorizer' }, scope), {
      cognitoUserPools: [props.userPool],
    });

    // Endpoints
    const files = this.restApi.root.addResource('files');
    files.addMethod(HttpMethods.GET, new LambdaIntegration(getFilesListLambda), {
      authorizer,
      authorizationType: AuthorizationType.COGNITO,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
          },
        },
      ],
      requestParameters: {
        'method.request.path.folder': true,
        'method.request.header.Content-Type': true,
      },
    });

    const fileId = files.addResource('{fileId}');
    fileId.addMethod(HttpMethods.GET, new LambdaIntegration(getFileLambda), {
      authorizer,
      authorizationType: AuthorizationType.COGNITO,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
      requestParameters: {
        'method.request.path.folder': true,
        'method.request.header.Content-Type': true,
      },
    });

    fileId.addMethod(HttpMethods.DELETE, new LambdaIntegration(deleteFileLambda), {
      authorizer,
      authorizationType: AuthorizationType.COGNITO,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
          },
        },
      ],
      requestParameters: {
        'method.request.path.folder': true,
        'method.request.header.Content-Type': true,
      },
    });

    // Nag Suppressions
    // Lambda
    NagSuppressions.addResourceSuppressions(
      [
        getFilesListLambda,
        getFileLambda,
        deleteFileLambda,
      ],
      [{
        id: 'HIPAA.Security-LambdaDLQ',
        reason: 'Lambda functions used in this solution are synchronous, DQL is not needed',
      }],
    );

    // IAM Roles
    NagSuppressions.addResourceSuppressions([
      getFileRole,
      deleteFileRole,
      getFilesListRole,
      reviewFileRole,
      updateProcessingResultRole,
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
