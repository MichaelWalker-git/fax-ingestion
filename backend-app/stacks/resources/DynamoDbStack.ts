import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ProjectionType, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Key } from 'aws-cdk-lib/aws-kms';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { PARTITION_KEY_NAME, SORT_KEY_NAME } from '../../shared/constants';
import { getCdkConstructId } from '../../shared/helpers';
import { Labels } from '../../shared/labels';


interface IProps {
  kmsKey: Key;
  labels: Labels;
}

export class DynamoDbStack extends NestedStack {
  public readonly removalPolicy: RemovalPolicy = RemovalPolicy.DESTROY;
  public readonly kmsKey: Key;
  public readonly dataTable: Table;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);
    this.kmsKey = props.kmsKey;

    const dataTableId = getCdkConstructId({ context: 'data', resourceName: 'table' }, this);
    this.dataTable = new Table(this, `${props.labels.application}-${dataTableId}`, {
      tableName: `${props.labels.application}-dataTableId`,
      partitionKey: { name: PARTITION_KEY_NAME, type: AttributeType.STRING },
      sortKey: { name: SORT_KEY_NAME, type: AttributeType.STRING },
      removalPolicy: this.removalPolicy,
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // GSI to query by reviewStatus
    this.dataTable.addGlobalSecondaryIndex({
      indexName: 'ReviewStatusCreatedAtIndex',
      partitionKey: { name: 'reviewStatus', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
    });

    // GSI to query and sort by createdAt
    this.dataTable.addGlobalSecondaryIndex({
      indexName: 'FilesByCreatedAtIndex',
      partitionKey: { name: PARTITION_KEY_NAME, type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    NagSuppressions.addResourceSuppressions(this.dataTable, [
      {
        id: 'HIPAA.Security-DynamoDBAutoScalingEnabled',
        reason: 'Auto-scaling is configured using CDK constructs explicitly.',
      },
      {
        id: 'HIPAA.Security-DynamoDBInBackupPlan',
        reason: 'Point-in-time recovery is enabled instead of backup plan integration.',
      },
    ], true);
  }
}
