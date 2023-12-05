import { StUser } from "@/app/model/types";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Table } from "sst/node/table";

export const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export async function dbGetUser(id: string): Promise<StUser | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.Users.tableName,
      Key: {
        id: {
          S: id,
        },
      },
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StUser;
}
