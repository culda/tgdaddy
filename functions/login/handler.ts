import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Table } from "sst/node/table";
import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { StConnectStatus, StPlan, StUser } from "../../app/model/types";
import { ddbGetUserById, ddbGetUserCredsByEmail, dynamoDb } from "../utils";
import { randomUUID, timingSafeEqual } from "crypto";
import { ApiResponse } from "@/app/model/errors";
import dayjs from "dayjs";

export type LoginRequest = {
  email: string;
  password: string;
  resetCode?: string;
  platformLogin: boolean;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event.body);
  if (!event.body) {
    return ApiResponse({
      status: 400,
    });
  }

  const { email, password, resetCode, platformLogin } = JSON.parse(
    event.body
  ) as LoginRequest;

  if (!email || !password || password.length < 8) {
    return ApiResponse({
      status: 400,
    });
  }

  // Check if user exists in DynamoDB
  let creds = await ddbGetUserCredsByEmail(email);
  if (creds) {
    console.log("found creds", creds);
    // If a code was supplied, verify code
    if (resetCode) {
      if (!creds.resetCode || !creds.resetCodeExpiry) {
        return ApiResponse({
          status: 401,
          message: "Invalid code",
        });
      }
      if (creds.resetCode !== resetCode) {
        return ApiResponse({
          status: 401,
          message: "Invalid code",
        });
      }

      if (dayjs().isAfter(dayjs.unix(creds.resetCodeExpiry))) {
        return ApiResponse({
          status: 401,
          message: "Code expired",
        });
      }

      // Code is valid, remove code from user creds and change password
      try {
        console.log("code is valid, updating password");
        await dynamoDb.send(
          new TransactWriteItemsCommand({
            TransactItems: [
              {
                Update: {
                  TableName: Table.UsersCreds.tableName,
                  Key: marshall({ email }),
                  UpdateExpression:
                    "remove resetCode, resetCodeExpiry set password = :password",
                  ExpressionAttributeValues: {
                    ":password": { S: password },
                  },
                },
              },
            ],
          })
        );
        const user = await ddbGetUserById(creds.id);
        console.log("user", user);
        return ApiResponse({
          status: 200,
          body: user,
        });
      } catch (err) {
        console.error(err);
        return ApiResponse({
          status: 500,
        });
      }
    }

    const match = timingSafeEqual(
      Buffer.from(password),
      Buffer.from(creds.password)
    );
    if (match) {
      const user = await ddbGetUserById(creds.id);
      // Passwords match
      return ApiResponse({
        status: 200,
        body: user,
      });
    } else {
      // Passwords do not match
      return ApiResponse({
        status: 401,
        message: "Invalid credentials",
      });
    }
  }

  console.log("no creds");
  // User does not exist
  const user: StUser = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    email: email,
    creatorPlan: StPlan.Starter,
    platformLogin: platformLogin,
    creatorStripeAccountStatus: StConnectStatus.NotStarted,
  };

  creds = {
    id: user.id,
    email: email,
    password: password,
  };

  const transactWriteParams = {
    TransactItems: [
      {
        Put: {
          TableName: Table.Users.tableName,
          Item: marshall(user, { removeUndefinedValues: true }),
        },
      },
      {
        Put: {
          TableName: Table.UsersCreds.tableName,
          Item: marshall(creds, { removeUndefinedValues: true }),
        },
      },
    ],
  };

  try {
    await dynamoDb.send(new TransactWriteItemsCommand(transactWriteParams));
  } catch (error) {
    return ApiResponse({
      status: 500,
    });
  }
  return ApiResponse({
    status: 200,
    body: user,
  });
};
