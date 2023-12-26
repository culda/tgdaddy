import { ApiResponse, checkNull } from "@/functions/errors";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import { StConsumerSubscription } from "../../app/model/types";
import { AuthorizerContext } from "../jwtAuth/handler";
import { lambdaWrapperAuth } from "../lambdaWrapper";
import { ddbGetPageByUsername } from "../utils";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export type TpGetSubscriptionRequest = {
  username: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId: string) => {
    switch (event.requestContext.http.method) {
      case "POST": {
        const body = checkNull(event.body, 400);
        const { username } = JSON.parse(body) as TpGetSubscriptionRequest;
        console.log(username);
        const page = await ddbGetPageByUsername(username);
        if (!page) {
          return ApiResponse({
            status: 400,
            message: "Channel not found",
          });
        }
        const sub = await dbGetSubscription(userId, page?.id as string);

        return ApiResponse({
          status: 200,
          body: sub,
        });
      }
      default:
        return ApiResponse({
          status: 405,
        });
    }
  });
};

async function dbGetSubscription(
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
