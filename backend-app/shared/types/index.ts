import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithRequestContext,
} from 'aws-lambda';
import { Construct } from 'constructs';

export type ApiStackProps = {
  securityGroup: SecurityGroup;
  restApi: RestApi;
  dataTableName: string;
  inputBucketName: string;
  outputBucketName: string;
  tableName: string;
  tableArn: string;
  vpc: Vpc;
  kmsKey: Key;
  userPool: UserPool;
}

export interface CognitoAuthorizedEvent extends Omit<APIGatewayProxyEventV2, 'requestContext'> {
  requestContext: {
    authorizer: {
      claims: {
        sub: string;
        email: string;
        username: string;
      };
    };
  };
}

export interface LambdaHandlerEvent<
  T = Record<string, unknown>,
  S = Record<string, unknown>
> extends APIGatewayProxyEventV2WithRequestContext<CognitoAuthorizedEvent> {
  pathParameters: APIGatewayProxyEventPathParameters & T;
  queryStringParameters: APIGatewayProxyEventQueryStringParameters & S;
  body: string;
  Records: Record<any, any>;
}

export interface LambdaHandler {
  (scope: Construct, env: Record<string, string> | undefined, role: Role, vpc: Vpc, securityGroup: SecurityGroup): IFunction;
}
