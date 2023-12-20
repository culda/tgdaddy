import { StPage, StUser, StUserCredentials } from "@/app/model/types";
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Table } from "sst/node/table";

export const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

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

export async function ddbGetPageByUsername(
  username: string
): Promise<StPage | undefined> {
  const { Items } = await dynamoDb.send(
    new QueryCommand({
      TableName: Table.Pages.tableName,
      IndexName: "UsernameIndex",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: marshall({ ":username": username }),
    })
  );

  if (!Items) {
    return undefined;
  }

  const data = unmarshall(Items[0]) as StPage;

  return data;
}
