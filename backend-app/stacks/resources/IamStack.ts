import { NestedStack } from 'aws-cdk-lib';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { getCdkConstructId, getPolicyStatement } from '../../shared/helpers';

export class IamStack extends NestedStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const role = new Role(this, getCdkConstructId({ context: 'iam', resourceName: 'account-password-policy-role' }, this), {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    role.addToPolicy(getPolicyStatement({
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

    role.addToPolicy(getPolicyStatement({
      service: 'iam',
      operations: [
        'UpdateAccountPasswordPolicy',
      ],
      resources: ['*'],
    }));
  }
}
