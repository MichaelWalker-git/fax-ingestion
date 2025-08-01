import { CfnOutput, Duration, NestedStack } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { getCdkConstructId } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

interface IProps {
  labels: Labels;
  kmsKey: Key;
}

export class SqsStack extends NestedStack {
  public readonly processingQueue: Queue;
  public readonly kmsKey: Key;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    this.kmsKey = props.kmsKey;

    // Create Dead Letter Queue
    const dlq = new Queue(this, getCdkConstructId({ context: 'processing-dlq', resourceName: 'queue' }, this), {
      queueName: getCdkConstructId({ context: 'processing-dlq', resourceName: 'queue' }, this),
      encryptionMasterKey: this.kmsKey,
      retentionPeriod: Duration.days(14),
    });

    // Create main processing queue with throttling controls
    const queueName = getCdkConstructId({ context: 'processing', resourceName: 'queue' }, this);
    this.processingQueue = new Queue(this, queueName, {
      queueName: queueName,
      visibilityTimeout: Duration.minutes(15),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3,
      },
      encryptionMasterKey: this.kmsKey,
      receiveMessageWaitTime: Duration.seconds(20),
    });

    // Add explicit permission for S3 to send messages to SQS
    this.processingQueue.addToResourcePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal('s3.amazonaws.com')],
      actions: ['sqs:SendMessage'],
      resources: [this.processingQueue.queueArn],
      conditions: {
        StringEquals: {
          'aws:SourceAccount': this.account,
        },
        ArnEquals: {
          'aws:SourceArn': 'arn:aws:s3:::*',
        },
      },
    }));

    // Modified SSL enforcement to allow S3 service
    const sslEnforcementStatement = new PolicyStatement({
      effect: Effect.DENY,
      principals: [new AnyPrincipal()],
      actions: ['sqs:*'],
      resources: ['*'],
      conditions: {
        Bool: {
          'aws:SecureTransport': 'false',
        },
        StringNotEquals: {
          'aws:PrincipalServiceName': 's3.amazonaws.com',
        },
      },
    });

    // Add SSL enforcement to both queues
    this.processingQueue.addToResourcePolicy(sslEnforcementStatement);
    dlq.addToResourcePolicy(sslEnforcementStatement);

    // Add monitoring outputs

    new CfnOutput(this, 'ProcessingQueueArn', {
      value: this.processingQueue.queueArn,
      exportName: 'ProcessingQueueArn',
      description: 'URL of the processing queue for throttling',
    });
  }
}
