import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';

export interface SecretProps {
  name: string;
  environment: string;
}

export class Secret extends Construct {
  public readonly secretArn: string;
  public readonly secretName: string;

  constructor(scope: Construct, id: string, props: SecretProps) {
    super(scope, id);

    // Create KMS key for HIPAA compliance
    const kmsKey = new kms.Key(this, `${props.name}-key`, {
      description: `KMS key for ${props.name} secret in ${props.environment}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      enableKeyRotation: true,
    });

    const secret = new secretsmanager.Secret(this, `${props.name}-sct`, {
      description: `Secret for ${props.name} in ${props.environment}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryptionKey: kmsKey, // Add KMS encryption
    });

    // Suppress rotation rules since rotation is not needed
    NagSuppressions.addResourceSuppressions(secret, [
      {
        id: 'AwsSolutions-SMG4',
        reason: 'Automatic rotation not required - secret values will be manually managed by client',
      },
      {
        id: 'HIPAA.Security-SecretsManagerRotationEnabled',
        reason: 'Automatic rotation not required - secret values will be manually managed by client',
      },
    ]);

    this.secretArn = secret.secretArn;
    this.secretName = secret.secretName;
  }
}
