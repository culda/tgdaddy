import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import {
  DynamoDBClient,
  TransactWriteItem,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { AuthorizerContext } from "../telegramAuth/handler";
import { ApiResponse } from "@/app/model/errors";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export type TpUpdateUsername = {
  id: string;
  newUsername: string;
  oldUsername: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  console.log(event);
  const userId = event.requestContext.authorizer.lambda.userId;
  if (!userId) {
    return ApiResponse({
      status: 403,
    });
  }

  if (!event.body) {
    return ApiResponse({
      message: "Request body is required",
      status: 400,
    });
  }

  const req = JSON.parse(event.body) as TpUpdateUsername;
  const res = await ddbUpdateChannelUsername(req);

  return ApiResponse({
    status: 200,
    body: res,
  });
};

async function ddbUpdateChannelUsername(
  req: TpUpdateUsername
): Promise<TransactWriteItemsCommandOutput> {
  const { id, newUsername, oldUsername } = req;
  const commands: TransactWriteItem[] = [];

  // Update Channels table with the new username
  commands.push({
    Update: {
      TableName: Table.Channels.tableName,
      Key: { id: { S: id } },
      UpdateExpression: "SET #username = :username",
      ExpressionAttributeNames: { "#username": "username" },
      ExpressionAttributeValues: { ":username": { S: newUsername } },
    },
  });

  // Delete old username from UniqueChannels table
  commands.push({
    Delete: {
      TableName: Table.UniqueChannels.tableName,
      Key: marshall({ username: oldUsername }),
    },
  });

  // Add new username to UniqueChannels table
  commands.push({
    Put: {
      TableName: Table.UniqueChannels.tableName,
      Item: marshall({ username: newUsername, id }),
      ConditionExpression: "attribute_not_exists(username)",
    },
  });

  return await dynamoDb.send(
    new TransactWriteItemsCommand({
      TransactItems: commands,
    })
  );
}
