import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Table } from "sst/node/table";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { StPlan, StUser } from "../../app/model/types";
import { dbGetUser, dynamoDb } from "../utils";
import crypto from "crypto";
import { TelegramAuthData } from "@/app/components/telegramLogin/types";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is required" }),
    };
  }

  let user: StUser | undefined;
  const req = JSON.parse(event.body) as TelegramAuthData;

  const dataCheckString = Object.keys(req)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${req[key as keyof TelegramAuthData]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(process.env.BOT_TOKEN as string)
    .digest();

  // Calculate HMAC-SHA-256 signature
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (hmac !== req.hash) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid hash" }),
    };
  }

  /**
   * Check if user exists in DynamoDB, if not, create a new user
   */
  user = await dbGetUser(req.id.toString());
  if (!user) {
    user = {
      id: req.id.toString(),
      firstName: req.first_name,
      lastName: req.last_name,
      username: req.username,
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
    body: JSON.stringify({ data: user }),
  };
};
