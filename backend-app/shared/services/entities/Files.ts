import { FILE_STATUSES, PARTITION_KEY_NAME, PARTITION_KEY_NAMES, SORT_KEY_NAME } from '../../constants';
import { DynamoDBFile, IFile } from '../../types/entities/Files';
import {
  deleteDynamoDbItem,
  generateUpdateItemParameters,
  getDynamoDbItem,
  putDynamoDbItem,
  queryDynamoDbItems,
  updateDynamoDbItem,
} from '../DynamoDB';
import { ClientError } from '../Errors';

const TABLE_NAME = process.env.TABLE_NAME || '';

export const addFile = async (
  {
    sortKey,
    status,
    s3Path,
    filename,
    resultS3Path,
  }:
  IFile,
): Promise<any> => {
  const time = new Date().toISOString();

  const item: DynamoDBFile = {
    [PARTITION_KEY_NAME]: `${PARTITION_KEY_NAMES.FILES}`,
    [SORT_KEY_NAME]: sortKey,
    s3Path: s3Path,
    createdAt: time,
    status: status || FILE_STATUSES.INITIALIZED,
    resultS3Path: resultS3Path,
    filename: filename,
    updatedAt: time,
  };

  await putDynamoDbItem<DynamoDBFile>({
    TableName: TABLE_NAME,
    Item: item,
  });

  console.log('File added successfully, item: ', item);

  return { sortKey };
};

export const updateFile = async (
  {
    sortKey,
    status,
    s3Path,
    filename,
    resultS3Path,
  }:
  IFile,
): Promise<any> => {
  const updateBody = {
    s3Path,
    status,
    resultS3Path,
    filename,
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, never>;

  const updateParams = generateUpdateItemParameters(updateBody);
  console.log('Update params: ', updateParams);

  if (!updateParams) {
    throw new ClientError('There are no fields to update');
  }

  await updateDynamoDbItem({
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY_NAME]: `${PARTITION_KEY_NAMES.FILES}`,
      [SORT_KEY_NAME]: sortKey,
    },
    ExpressionAttributeNames: updateParams.ExpressionAttributeNames,
    ExpressionAttributeValues: updateParams.ExpressionAttributeValues,
    UpdateExpression: updateParams.UpdateExpression,
    ConditionExpression: 'attribute_exists(sortKey)',
  });
};

export const getFile = async ({ sortKey }: { sortKey: string }): Promise<DynamoDBFile> => {
  const fileItem = await getDynamoDbItem<DynamoDBFile>({
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY_NAME]: `${PARTITION_KEY_NAMES.FILES}`,
      [SORT_KEY_NAME]: sortKey,
    },
  });

  console.log('fileItem:  ', fileItem);

  if (!fileItem) {
    throw new ClientError(`There is no file with ID ${sortKey}`);
  }

  return fileItem;
};

const buildQueryParams = ({
  sortKeyPrefix,
  limit,
  lastEvaluatedKey,
}: {
  sortKeyPrefix?: string;
  limit?: number;
  lastEvaluatedKey?: Record<string, any>;
}) => {
  const baseParams = {
    TableName: TABLE_NAME,
    ExpressionAttributeNames: {
      '#pk': PARTITION_KEY_NAME,
    },
    ExpressionAttributeValues: {
      ':pk': `${PARTITION_KEY_NAMES.FILES}`,
    },
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  if (sortKeyPrefix) {
    return {
      ...baseParams,
      KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
      ExpressionAttributeNames: {
        ...baseParams.ExpressionAttributeNames,
        '#sk': SORT_KEY_NAME,
      },
      ExpressionAttributeValues: {
        ...baseParams.ExpressionAttributeValues,
        ':sk': sortKeyPrefix,
      },
    };
  }

  return {
    ...baseParams,
    KeyConditionExpression: '#pk = :pk',
  };
};

export const getFiles = async ({
  sortKeyPrefix,
  limit,
  lastEvaluatedKey,
}: {
  sortKeyPrefix?: string;
  limit?: number;
  lastEvaluatedKey?: Record<string, any>;
}) => {

  const queryParams = buildQueryParams({ sortKeyPrefix, limit, lastEvaluatedKey });

  return queryDynamoDbItems<DynamoDBFile>(queryParams);
};

export const deleteFile = async (
  {
    sortKey,
    sortKeyPrefix,
  }:
  {
    sortKey?: string;
    sortKeyPrefix?: string;
  },
): Promise<any> => {
  if (sortKeyPrefix) {
    const result = await getFiles({ sortKeyPrefix });

    if (!result || !result.items || !result.items?.length) {
      return;
    }

    await Promise.all(result.items.map(async (item: Record<any, any>) => {
      await deleteDynamoDbItem({
        TableName: TABLE_NAME,
        Key: {
          [PARTITION_KEY_NAME]: `${PARTITION_KEY_NAMES.FILES}`,
          [SORT_KEY_NAME]: item[SORT_KEY_NAME],
        },
      });
    }));
    return;
  }

  await deleteDynamoDbItem({
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY_NAME]: `${PARTITION_KEY_NAMES.FILES}`,
      [SORT_KEY_NAME]: sortKey,
    },
  });
};
