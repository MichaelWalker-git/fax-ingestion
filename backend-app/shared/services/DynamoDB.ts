import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocument,
  GetCommand,
  GetCommandInput,
  DeleteCommandInput,
  DeleteCommand,
  QueryCommand,
  QueryCommandInput,
  PutCommand,
  PutCommandInput, UpdateCommand, UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';

export const getDbDocClient = () => {
  const dbClient = new DynamoDBClient({
    requestHandler: {
      timeout: 10000,
    },
  });
  return DynamoDBDocument.from(dbClient, {
    marshallOptions: {
      convertEmptyValues: false,
      removeUndefinedValues: false,
      convertClassInstanceToMap: false,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  });
};

export const getDynamoDbItem = async <T>(input: GetCommandInput) => {
  const client = getDbDocClient();

  const { Item } = await client.send(new GetCommand(input));
  if (!Item) {
    return null;
  }
  return Item as T;
};

export const deleteDynamoDbItem = async (input: DeleteCommandInput) => {
  const client = getDbDocClient();
  return client.send(new DeleteCommand(input));
};

export const queryDynamoDbItems = async <T>(input: QueryCommandInput): Promise<{items: T[]; lastEvaluatedKey?: Record<string, any>}> => {
  const client = getDbDocClient();
  const { Items, LastEvaluatedKey } = await client.send(new QueryCommand(input));
  if (!Items || !Items.length) {
    return { items: [] as T[], lastEvaluatedKey: LastEvaluatedKey };
  }
  return { items: Items as T[], lastEvaluatedKey: LastEvaluatedKey };
};

export const putDynamoDbItem = async <T>(input: PutCommandInput) => {
  const client = getDbDocClient();
  const { Attributes: item } = await client.send(new PutCommand(input));
  if (!item) {
    return null;
  }
  return item as T;
};

type AttributeNames = Record<string, string>;
type AttributeValues = Record<string, string | number | unknown>;
type UpdateItemExpressionResult = {
  UpdateExpression: string;
  ExpressionAttributeNames: AttributeNames;
  ExpressionAttributeValues: AttributeValues;
};

export const generateUpdateItemParameters = (input: Record<string, never>):UpdateItemExpressionResult | null => {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: AttributeNames = {};
  const expressionAttributeValues: AttributeValues = {};

  let updateExpression;
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
      updateExpressions.push(`#${key} = :${key}`);
    }
  });

  if (updateExpressions.length) {
    updateExpression = `SET ${updateExpressions.join(', ')}`;
  }

  console.log('UpdateExpression:', updateExpression);
  console.log('ExpressionAttributeNames', expressionAttributeNames);
  console.log('ExpressionAttributeValues', expressionAttributeValues);

  if (updateExpression && Object.keys(expressionAttributeNames).length && Object.keys(expressionAttributeValues).length) {
    return {
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };
  } else {
    return null;
  }
};

export const updateDynamoDbItem = async (input: UpdateCommandInput)=> {
  const client = getDbDocClient();
  return client.send(new UpdateCommand(input));
};
