import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import {
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Key } from 'aws-cdk-lib/aws-kms';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Domain } from 'aws-cdk-lib/aws-opensearchservice';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import {
  getCdkConstructId,
} from '../shared/helpers';
import { ApiStackProps } from '../shared/types';
import { FileApiStack } from './api/File';

export class ApiStack extends NestedStack {
  public readonly removalPolicy: RemovalPolicy = RemovalPolicy.DESTROY;
  public readonly restApi: RestApi;
  public readonly inputBucketName: string;
  public readonly outputBucketName: string;
  public readonly tableName: string;
  public readonly tableArn: string;
  public readonly openSearchDomain: Domain;
  public readonly vpc: IVpc;
  public readonly kmsKey: Key;
  public readonly securityGroup: SecurityGroup;
  public readonly userPool: UserPool;

  constructor(scope: Construct, id: string, props: ApiStackProps, lambdaProps?: NodejsFunctionProps) {
    const stackName = getCdkConstructId({ context: 'api', resourceName: 'stack' }, scope);
    super(scope, stackName);

    this.restApi = props.restApi;
    this.inputBucketName = props.inputBucketName;
    this.outputBucketName = props.outputBucketName;
    this.tableName = props.tableName;
    this.tableArn = props.tableArn;
    this.vpc = props.vpc;
    this.kmsKey = props.kmsKey;
    this.securityGroup = props.securityGroup;
    this.userPool = props.userPool;

    // APIs
    new FileApiStack(this, 'File-Api-Stack', {
      restApi: this.restApi,
      tableName: this.tableName,
      tableArn: this.tableArn,
      vpc: this.vpc,
      securityGroup: this.securityGroup,
      inputBucketName: this.inputBucketName,
      outputBucketName: this.outputBucketName,
      kmsKey: this.kmsKey,
      userPool: this.userPool,
    });

    // Nag Suppressions
    // VPC
    NagSuppressions.addResourceSuppressions(
      [this.vpc],
      [{ id: 'HIPAA.Security-VPCNoUnrestrictedRouteToIGW', reason: 'Public subnet' }],
      true,
    );

    // Api Gateway
    NagSuppressions.addResourceSuppressions([
      this.restApi,
    ],
    [
      {
        id: 'AwsSolutions-APIG2',
        reason: 'Request validation is handled in the application code.',
      },
      {
        id: 'AwsSolutions-APIG4',
        reason: 'Request validation is handled in the application code.',
      },
      {
        id: 'AwsSolutions-COG4',
        reason: 'Request validation is handled in the application code.',
      },
    ],
    true,
    );
  }
}
