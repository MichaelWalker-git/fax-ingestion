import { Names, RemovalPolicy } from 'aws-cdk-lib';
import { FlowLog, FlowLogDestination, FlowLogResourceType, IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';
import { IPrincipal, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export const getCdkConstructId = (
  { context, resourceName, addId = false } :
  { context: string; resourceName: string; addId?: boolean },
  scope: Construct,
) => {
  const stage = process.env.STAGE;

  if (!stage) {
    throw new Error('Missing required env vars: STAGE');
  }

  const baseName = `${stage}-${context}-${resourceName}`;
  const formatted = baseName.toLowerCase();

  return addId ? `${formatted}-${Names.uniqueId(scope)}` : formatted;
};

export const getLambdaResponse = (body = {}, statusCode = 200) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

export const createDefaultLambdaRole = (scope: Construct, roleName: string) => {
  const role = new Role(scope, roleName, {
    description: `Role for ${roleName.replace('Role', '')} lambda`,
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
  });

  role.addToPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: ['*'],
    }),
  );

  role.addToPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ec2:CreateNetworkInterface',
        'ec2:DescribeNetworkInterfaces',
        'ec2:DeleteNetworkInterface',
        'ec2:AssignPrivateIpAddresses',
        'ec2:UnassignPrivateIpAddresses',
      ],
      resources: ['*'],
    }),
  );

  return role;
};

interface PolicyConfig {
  service: string;
  operations: string[];
  resources: string[];
  principals?: IPrincipal[];
}

interface IPolicyStatementProps {
  effect: iam.Effect;
  actions: string[];
  resources: string[];
  principals?: IPrincipal[];
}

const prefixAction = (service: string, actions: string[]) => actions.map(action => `${service}:${action}`);

export const getPolicyStatement = (config: PolicyConfig) => {
  const { service, operations, resources, principals } = config;
  const actions = prefixAction(service, operations);
  const conditions: IPolicyStatementProps = {
    effect: iam.Effect.ALLOW,
    actions,
    resources,
  };

  if (principals && principals.length) {
    conditions.principals = principals;
  }

  return new iam.PolicyStatement(conditions);
};

export const createVpcCloudwatchLogs = ({
  scope,
  vpc,
  kmsKey,
  removalPolicy = RemovalPolicy.DESTROY,
} : {
  scope: Construct;
  vpc: Vpc;
  kmsKey: Key;
  removalPolicy?: RemovalPolicy;
}): {flowLog: FlowLog; flowLogRole: Role} => {
  const logGroup = new LogGroup(scope, getCdkConstructId({ context: 'vpc-flow', resourceName: 'log-group' }, scope), {
    logGroupName: getCdkConstructId({ context: 'vpc-flow', resourceName: 'log-group', addId: true }, scope),
    removalPolicy: removalPolicy,
    encryptionKey: kmsKey,
  });

  const managedPolicy = getPolicyStatement({
    service: 'logs',
    operations: [
      'CreateLogGroup',
      'CreateLogStream',
      'PutLogEvents',
      'DescribeLogGroups',
      'DescribeLogStreams',
    ],
    resources: ['*'],
  });

  const flowLogRole = new Role(scope, getCdkConstructId({ context: 'vpc-flow', resourceName: 'log-role' }, scope), {
    assumedBy: new ServicePrincipal('vpc-flow-logs.amazonaws.com'),
  });

  flowLogRole.addToPolicy(managedPolicy);

  const flowLog = new FlowLog(scope, getCdkConstructId({ context: 'vpc', resourceName: 'flow-log' }, scope), {
    flowLogName: getCdkConstructId({ context: 'vpc', resourceName: 'flow-log' }, scope),
    resourceType: FlowLogResourceType.fromVpc(vpc),
    destination: FlowLogDestination.toCloudWatchLogs(logGroup, flowLogRole),
  });

  flowLog.applyRemovalPolicy(RemovalPolicy.DESTROY);

  return { flowLog, flowLogRole };
};

export function generateS3Path(bucketName: string, key: string): string {
  return `s3://${bucketName}/${key}`;
}

export const extractFilename = (s3Key: string): string => {
  // Extract the last part after the final slash
  const baseName = s3Key.split('/').pop();
  if (!baseName) return '';

  // Remove the extension if present
  const nameWithoutExtension = baseName.replace(/\.[^/.]+$/, '');

  return nameWithoutExtension;
};

export const removeUndefined = (obj: Record<any, any>): Record<any, any> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  );
};

export function generateUsername(familyName: string, givenName: string): string {
  const cleanFamilyName = familyName.toLowerCase().replace(/[^a-z0-9.]/g, '');
  const cleanGivenName = givenName.toLowerCase().replace(/[^a-z0-9.]/g, '');
  let username = `${cleanGivenName}.${cleanFamilyName}`;
  if (username.length > 128) {
    username = username.substring(0, 128);
  }

  username = username.replace(/\.$/, '');
  if (!username) {
    throw new Error('Unable to generate valid username from given name and family name');
  }

  return username;
}

export function extractS3KeyFromUri(s3Uri: string): string {
  const match = s3Uri.match(/^s3:\/\/[^/]+\/(.+)$/);
  if (!match || !match[1]) {
    throw new Error(`Invalid S3 URI format: ${s3Uri}`);
  }
  return match[1];
}
