import { StUser } from "@/app/model/types";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Table } from "sst/node/table";

export async function dbGetUser(
  id: string,
  client: DynamoDBClient
): Promise<StUser | undefined> {
  const { Item } = await client.send(
    new GetItemCommand({
      TableName: Table.Users.tableName,
      Key: {
        id: {
          N: `${id}`,
        },
      },
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StUser;
}
