import { StChannel, StUser } from "@/app/model/types";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
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

export async function ddbGetChannelById(
  id: string
): Promise<StChannel | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.Channels.tableName,
      Key: marshall({ id }),
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StChannel;
}

export async function ddbGetChannelIdByUsername(
  username: string
): Promise<string | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.UniqueChannels.tableName,
      Key: marshall({ username }),
    })
  );

  if (!Item) {
    return undefined;
  }

  const data = unmarshall(Item) as { username: string; id: string };

  return data.id;
}
