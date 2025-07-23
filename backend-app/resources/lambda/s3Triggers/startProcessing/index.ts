import { join } from 'path';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { DEFAULT_PROPS } from '../../../../shared/constants';
import { getCdkConstructId } from '../../../../shared/helpers';
import { LambdaHandler } from '../../../../shared/types';

export const startProcessing: LambdaHandler = (scope, env, role, vpc, securityGroup) => {
  return new NodejsFunction(scope, getCdkConstructId({ context: 'start-processing', resourceName: 'lambda' }, scope), {
    functionName: getCdkConstructId({ context: 'start-processing', resourceName: 'lambda' }, scope),
    ...DEFAULT_PROPS,
    role,
    vpc,
    securityGroups: [securityGroup],
    runtime: Runtime.NODEJS_22_X,
    reservedConcurrentExecutions: 2,
    timeout: Duration.minutes(5),
    entry: join(__dirname, '/handler.ts'),
    environment: env,
    bundling: {
      nodeModules: ['aws-sdk'],
    },
  });
};
