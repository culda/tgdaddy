import { APIGatewayProxyHandler, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Table } from "sst/node/table";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { StUser } from "../types";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Determine the type of the HTTP request
    switch (event.httpMethod) {
      case "GET": {
        // Assuming `id` is passed as a query parameter
        const id = event.queryStringParameters?.id;
        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "User ID is required" }),
          };
        }

        const user = await dbGetUser(id);
        if (!user) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "User not found" }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ stripeAccountId: user.stripeAccountId }),
        };
      }

      case "POST": {
        // Validate and extract the body
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request body is required" }),
          };
        }

        const { id, stripeAccountId } = JSON.parse(event.body);

        if (!id || !stripeAccountId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required fields" }),
          };
        }

        await dbAddStripeAccount(id, stripeAccountId);

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
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error }),
    };
  }
};

async function dbAddStripeAccount(id: number, stripeAccountId: string) {
  const user: StUser = {
    id,
    stripeAccountId,
  };
  await dynamoDb.send(
    new PutItemCommand({
      TableName: Table.Users.tableName,
      Item: marshall(user),
    })
  );
}

async function dbGetUser(id: string): Promise<StUser | undefined> {
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
