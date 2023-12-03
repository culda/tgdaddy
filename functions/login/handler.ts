import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Table } from "sst/node/table";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { StPlan, StUser, StUserAuth } from "../../app/model/types";
import { AuthorizerContext } from "../telegramAuth/handler";
import { dbGetUser } from "../utils";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export const handler: APIGatewayProxyHandlerV2<AuthorizerContext> = async (
  event
) => {
  console.log(event);

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is required" }),
    };
  }

  let user: StUser | undefined;
  const req = JSON.parse(event.body) as StUserAuth;

  console.log(req);

  user = await dbGetUser(req.id, dynamoDb); // Check if user already exists
  if (!user) {
    user = {
      id: req.id,
      plan: StPlan.Starter,
    };
    await dynamoDb.send(
      new PutItemCommand({
        TableName: Table.Users.tableName,
        Item: marshall(user),
      })
    );
  }

  return {
    statusCode: 200,
  };
};
