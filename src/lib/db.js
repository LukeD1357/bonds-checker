import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, BatchGetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
// import { fromIni } from '@aws-sdk/credential-providers';
const db = new DynamoDBClient({
  region: 'eu-west-2',
  // credentials: fromIni({ profile: 'personal' }),
});
const docClient = DynamoDBDocumentClient.from(db);

export const get = async (TableName, Key) => {
  const command = new GetCommand({
    TableName,
    Key,
  });
  const response = await docClient.send(command);
  return response.Item;
};

export const put = async (TableName, Item) => {
  const command = new PutCommand({
    TableName,
    Item,
  });
  const response = await docClient.send(command);
  return response;
};

export const batchGet = async (TableName, Keys) => {
  const command = new BatchGetCommand({
    RequestItems: {
      [TableName]: {
        Keys,
      },
    },
  });
  const response = await docClient.send(command);
  return response.Responses[TableName];
};
