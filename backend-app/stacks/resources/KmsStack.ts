import { NestedStack, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { getCdkConstructId, getPolicyStatement } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

export class KmsStack extends NestedStack {
  public readonly removalPolicy: RemovalPolicy = RemovalPolicy.DESTROY;
  public readonly kmsKey: Key;

  constructor(scope: Construct, id: string, args: {labels: Labels}) {
    super(scope, id);

    const aliasName = getCdkConstructId({ context: 'kms', resourceName: 'alias', addId: true }, this);

    this.kmsKey = new Key(this, `${args.labels.application}-kmsKeyId`, {
      alias: aliasName,
      removalPolicy: this.removalPolicy,
      enableKeyRotation: true,
    });

    this.kmsKey.addToResourcePolicy(getPolicyStatement({
      service: 'kms',
      operations: ['*'],
      resources: ['*'],
    }));

    this.kmsKey.addToResourcePolicy(getPolicyStatement({
      resources: ['arn:aws:logs:*'],
      service: 'kms',
      operations: ['Encrypt*', 'Decrypt*', 'ReEncrypt*', 'GenerateDataKey*', 'Describe*'],
      principals: [new ServicePrincipal(`logs.${this.region}.amazonaws.com`)],
    }));

    this.kmsKey.addToResourcePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal(`logs.${this.region}.amazonaws.com`)],
      actions: [
        'kms:Encrypt',
        'kms:Decrypt',
        'kms:ReEncrypt*',
        'kms:GenerateDataKey*',
        'kms:Describe*',
      ],
      resources: ['*'],
      conditions: {
        ArnLike: {
          'kms:EncryptionContext:aws:logs:arn': `arn:aws:logs:${this.region}:${Stack.of(this).account}:*`,
        },
      },
    }));
  }
}
