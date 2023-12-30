import {
  StConsumerSubscription,
  StPage,
  StProduct,
  StUser,
  StUserCredentials,
} from '@/app/model/types';
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Table } from 'sst/node/table';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });
export const s3 = new S3Client({ region: 'us-east-1' });

export async function ddbGetUserByTelegramId(
  tgid: string
): Promise<StUser | undefined> {
  const { Items } = await dynamoDb.send(
    new QueryCommand({
      TableName: Table.Users.tableName,
      IndexName: 'TelegramIdIndex',
      KeyConditionExpression: 'telegramId = :telegramId',
      ExpressionAttributeValues: marshall({ ':telegramId': tgid }),
    })
  );

  if (!Items || Items.length === 0) {
    return undefined;
  }

  const data = unmarshall(Items[0]) as StUser;

  return data;
}

export async function ddbGetUserById(id: string): Promise<StUser | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.Users.tableName,
      Key: marshall({ id }),
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StUser;
}

export async function ddbGetUserCredsByEmail(
  email: string
): Promise<StUserCredentials | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.UsersCreds.tableName,
      Key: marshall({ email }),
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StUserCredentials;
}

export async function ddbGetProductById(
  id: string
): Promise<StProduct | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.Products.tableName,
      Key: marshall({ id }),
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StProduct;
}

export async function ddbGetPageById(id: string): Promise<StPage | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.Pages.tableName,
      Key: marshall({ id }),
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StPage;
}

export async function dbGetSubscription(
  userId: string,
  pageId: string
): Promise<StConsumerSubscription | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.ConsumerSubscriptions.tableName,
      Key: marshall({ id: `${userId}/${pageId}` }),
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StConsumerSubscription;
}

export async function ddbGetPageByUsername(
  username: string
): Promise<StPage | undefined> {
  const { Items } = await dynamoDb.send(
    new QueryCommand({
      TableName: Table.Pages.tableName,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: marshall({ ':username': username }),
    })
  );

  if (!Items) {
    return undefined;
  }

  const data = unmarshall(Items[0]) as StPage;

  return data;
}

export async function s3PutImage(
  image: Buffer,
  key: string,
  bucket: string,
  fileType: string
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: image,
      ContentType: fileType,
    })
  );
}
