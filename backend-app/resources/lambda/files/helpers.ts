import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PARTITION_KEY_NAME, PARTITION_KEY_NAMES, SORT_KEY_NAME } from '../../../shared/constants';

import { getDynamoDbItem } from '../../../shared/services/DynamoDB';
import { deleteFile as deleteFileFromDb } from '../../../shared/services/entities/Files';
import { ClientError } from '../../../shared/services/Errors';
import { DynamoDBFile } from '../../../shared/types/entities/Files';
import { extractBucketAndKey } from '../helper';

const TABLE_NAME = process.env.TABLE_NAME;
const REGION = process.env.REGION;
const s3Client = new S3Client({ region: REGION });

export const deleteFile = async (fileId: string) => {
  // Getting file
  const item = await getDynamoDbItem<DynamoDBFile>({
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY_NAME]: PARTITION_KEY_NAMES.FILES,
      [SORT_KEY_NAME]: fileId,
    },
  });

  if (!item) {
    throw new ClientError('There is no file to delete', 404);
  }

  const { resultS3Path, s3Path } = item;

  console.log('item', item);

  // Removing s3 file
  if (resultS3Path) {
    const { Bucket, Key } = extractBucketAndKey(resultS3Path);
    await s3Client.send(new DeleteObjectCommand({ Bucket, Key }));
  }

  if (s3Path) {
    const { Bucket, Key } = extractBucketAndKey(s3Path);
    await s3Client.send(new DeleteObjectCommand({ Bucket, Key }));
  }

  //Removing DynamoDb object
  await deleteFileFromDb({
    sortKey: fileId,
    sortKeyPrefix: fileId,
  });
};

