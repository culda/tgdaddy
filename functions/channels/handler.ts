import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { StChannel } from "../../app/model/types";
import { AuthorizerContext } from "../telegramAuth/handler";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  const userId = event.requestContext.authorizer.lambda.userId;
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No userId on the token" }),
    };
  }

  switch (event.requestContext.http.method) {
    case "POST": {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Request body is required" }),
        };
      }

      const req = JSON.parse(event.body) as Partial<StChannel>;
      console.log(req);
      const res = await ddbUpdateChannel(req.id as string, req);

      return {
        statusCode: 200,
        body: JSON.stringify({ data: res }),
      };
    }
    case "GET": {
      if (event.queryStringParameters?.id) {
        const id = event.queryStringParameters?.id;
        const data = await dbGetChannel(id);
        return {
          statusCode: 200,
          body: JSON.stringify({ data }),
        };
      }

      const data = await dbGetUserChannels(userId);

      return {
        statusCode: 200,
        body: JSON.stringify({ data }),
      };
    }
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
  }
};

async function dbGetChannel(channelId: string): Promise<StChannel | undefined> {
  try {
    const { Items } = await dynamoDb.send(
      new QueryCommand({
        TableName: Table.Channels.tableName,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": { S: channelId },
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

async function ddbUpdateChannel(
  id: string,
  channel: Partial<StChannel>
): Promise<StChannel | undefined> {
  const updateExpressionParts = [];
  const expressionAttributeValues: Record<string, AttributeValue> = {};
  const expressionAttributeNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(channel)) {
    if (key !== "id") {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;

      updateExpressionParts.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = { S: value.toString() };
    }
  }

  const { Attributes } = await dynamoDb.send(
    new UpdateItemCommand({
      TableName: Table.Channels.tableName,
      Key: {
        id: { S: id },
      },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!Attributes) {
    return undefined;
  }

  return unmarshall(Attributes) as StChannel;
}
