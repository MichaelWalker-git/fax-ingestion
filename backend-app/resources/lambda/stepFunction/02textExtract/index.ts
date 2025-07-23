import { join } from 'path';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { DEFAULT_PROPS } from '../../../../shared/constants';
import { getCdkConstructId } from '../../../../shared/helpers';
import { LambdaHandler } from '../../../../shared/types';

export const textExtract: LambdaHandler = (scope, env, role, vpc, securityGroup) => {
  return new NodejsFunction(scope, getCdkConstructId({ context: 'text-extract', resourceName: 'lambda' }, scope), {
    functionName: getCdkConstructId({ context: 'text-extract', resourceName: 'lambda' }, scope),
    ...DEFAULT_PROPS,
    role,
    vpc,
    securityGroups: [securityGroup],
    memorySize: 2048,
    runtime: Runtime.NODEJS_22_X,
    reservedConcurrentExecutions: 40,
    timeout: Duration.minutes(10),
    entry: join(__dirname, '/handler.ts'),
    environment: env,
    bundling: {
      nodeModules: ['aws-sdk'],
    },
  });
};
