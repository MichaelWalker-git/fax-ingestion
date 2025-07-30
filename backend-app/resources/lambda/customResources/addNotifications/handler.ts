import { CloudFormationCustomResourceEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { errorHandler } from '../../../../shared/services/Errors';

const s3 = new S3();

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  try {
    const inputBucket = process.env.INPUT_BUCKET || '';
    const queueArn = process.env.QUEUE_ARN || '';
    const prefix = 'files/';

    console.log('inputBucket', inputBucket);
    console.log('queueArn', queueArn);
    console.log('prefix', prefix);

    const params = {
      Bucket: inputBucket,
      NotificationConfiguration: {
        QueueConfigurations: [
          {
            QueueArn: queueArn,
            Events: ['s3:ObjectCreated:Put', 's3:ObjectCreated:Post'],
            Filter: {
              Key: {
                FilterRules: [
                  {
                    Name: 'prefix',
                    Value: prefix,
                  },
                ],
              },
            },
          },
        ],
      },
    };

    switch (event.RequestType) {
      case 'Create':
        await s3.putBucketNotificationConfiguration(params).promise();
        console.log('S3 Event Notifications configured successfully');

      case 'Update':
        await s3.putBucketNotificationConfiguration(params).promise();
        console.log('S3 Event Notifications configured successfully');

        break;
      case 'Delete':
        break;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Sample files was successfully uploaded' }),
    };
  } catch (e) {
    console.log(e);
    return errorHandler(e as Error);
  }
};
