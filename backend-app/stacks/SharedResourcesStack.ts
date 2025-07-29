import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { getCdkConstructId } from '../shared/helpers';
import { Labels } from '../shared/labels';

interface IProps {
  kmsKey: Key;
  labels: Labels;
}

export class SharedResourcesStack extends NestedStack {
  public readonly removalPolicy: RemovalPolicy = RemovalPolicy.DESTROY;
  public readonly kmsKey: Key;
  public readonly restApiLogGroup: LogGroup;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    this.kmsKey = props.kmsKey;

    // Log Groups
    const restApiLogGroupName = getCdkConstructId({ context: 'rest-api', resourceName: 'log-group', addId: true }, this);
    this.restApiLogGroup = new LogGroup(this, `${props.labels.application}-restApiLogGroup`, {
      logGroupName: restApiLogGroupName,
      removalPolicy: this.removalPolicy,
      encryptionKey: this.kmsKey,
    });
  }
}
