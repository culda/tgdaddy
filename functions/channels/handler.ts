import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyHandlerV2WithLambdaAuthorizer,
} from "aws-lambda";
import { Table } from "sst/node/table";
import {
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { StChannel } from "../../app/model/types";
import { AuthorizerContext } from "../telegramAuth/handler";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  console.log(event);
  const userId = event.requestContext.authorizer.lambda.userId;
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No userId on the token" }),
    };
  }

  let data;

  const channelId = event.queryStringParameters?.id;

  if (channelId) {
    data = await dbGetChannel(channelId, userId);
  } else {
    data = await dbGetUserChannels(userId);
  }

  if (!data) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "No channels" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data }),
  };
};

async function dbGetChannel(
  channelId: string,
  userId: string
): Promise<StChannel | undefined> {
  try {
    const { Items } = await dynamoDb.send(
      new QueryCommand({
        TableName: Table.Channels.tableName,
        KeyConditionExpression: "id = :id AND userId = :userId",
        ExpressionAttributeValues: {
          ":id": { S: channelId },
          ":userId": { N: userId },
        },
      })
    );

    if (!Items) {
      return undefined;
    }

    return unmarshall(Items[0]) as StChannel;
  } catch (error) {
    return undefined;
  }
}

async function dbGetUserChannels(id: string): Promise<StChannel[] | undefined> {
  const { Items } = await dynamoDb.send(
    new ScanCommand({
      TableName: Table.Channels.tableName,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { N: id },
      },
    })
  );

  if (!Items) {
    return undefined;
  }

  return Items.map((item) => unmarshall(item)) as StChannel[];
}
