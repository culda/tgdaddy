import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { StConsumerSubscription } from "../../app/model/types";
import { AuthorizerContext } from "../telegramAuth/handler";
import { ApiResponse } from "@/app/model/errors";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export type TpGetSubscriptionRequest = {
  channelId: string;
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

  switch (event.requestContext.http.method) {
    case "POST": {
      if (!event.body) {
        return ApiResponse({
          status: 400,
        });
      }

      const { channelId } = JSON.parse(event.body) as TpGetSubscriptionRequest;
      const data = await dbGetSubscription(userId, channelId);

      return ApiResponse({
        status: 200,
        body: data,
      });
    }
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
  }
};

async function dbGetSubscription(
  userId: string,
  channelId: string
): Promise<StConsumerSubscription | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.ConsumerSubscriptions.tableName,
      Key: marshall({ id: `${userId}/${channelId}` }),
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StConsumerSubscription;
}
