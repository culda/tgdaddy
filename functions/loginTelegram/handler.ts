import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Table } from "sst/node/table";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { StConnectStatus, StPlan, StUser } from "../../app/model/types";
import { ddbGetUserById, ddbGetUserByTelegramId, dynamoDb } from "../utils";
import crypto, { randomUUID } from "crypto";
import { TelegramAuthData } from "@/app/components/telegramLogin/types";
import { ApiResponse } from "@/app/model/errors";

export type LoginRequest = TelegramAuthData & {
  platformLogin?: boolean;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event.body);
  if (!event.body) {
    return ApiResponse({
      status: 400,
    });
  }

  let user: StUser | undefined;
  const req = JSON.parse(event.body) as LoginRequest;

  const dataCheckString = Object.keys(req)
    .filter((key) => key !== "hash" && key !== "platformLogin")
    .sort()
    .map((key) => `${key}=${req[key as keyof LoginRequest]}`)
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
    return ApiResponse({
      status: 401,
    });
  }

  /**
   * Check if user exists in DynamoDB, if not, create a new user
   */
  user = await ddbGetUserByTelegramId(req.id.toString());
  if (!user) {
    user = {
      id: randomUUID(),
      telegramId: req.id.toString(),
      firstName: req.first_name,
      lastName: req.last_name,
      username: req.username,
      creatorPlan: StPlan.Starter,
      platformLogin: req.platformLogin,
      photoUrl: req.photo_url,
      creatorStripeAccountStatus: StConnectStatus.NotStarted,
    };
    await dynamoDb.send(
      new PutItemCommand({
        TableName: Table.Users.tableName,
        Item: marshall(user, { removeUndefinedValues: true }),
      })
    );
  }

  return ApiResponse({
    status: 200,
    body: user,
  });
};
