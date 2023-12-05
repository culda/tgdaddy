import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { AuthorizerContext } from "../telegramAuth/handler";
import { dbGetUser, dynamoDb } from "../utils";

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
  switch (event.requestContext.http.method) {
    case "GET": {
      const user = await dbGetUser(userId);
      return {
        statusCode: 200,
        body: JSON.stringify({ stripeAccountId: user?.stripeAccountId }),
      };
    }

    case "POST": {
      const { stripeAccountId } = JSON.parse(event?.body || "{}");

      if (!stripeAccountId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Missing required fields" }),
        };
      }

      await dbAddStripeAccount(userId, stripeAccountId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Stripe account added successfully",
        }),
      };
    }

    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
  }
};

async function dbAddStripeAccount(id: string, stripeAccountId: string) {
  await dynamoDb.send(
    new UpdateItemCommand({
      TableName: Table.Users.tableName,
      Key: {
        id: {
          S: id,
        },
      },
      UpdateExpression: `SET stripeAccountId = :stripeAccountId`,
      ExpressionAttributeValues: marshall({
        ":stripeAccountId": stripeAccountId,
      }),
    })
  );
}
