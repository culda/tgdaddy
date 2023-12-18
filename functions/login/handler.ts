import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Table } from "sst/node/table";
import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  StConnectStatus,
  StPlan,
  StUser,
  StUserCredentials,
} from "../../app/model/types";
import { ddbGetUserById, ddbGetUserCredsByEmail, dynamoDb } from "../utils";
import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { ApiResponse } from "@/app/model/errors";
import dayjs from "dayjs";

export type LoginRequest = {
  email: string;
  password: string;
  resetCode?: string;
  platformLogin: boolean;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
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

  const hashedPassword = createHash("sha256").update(password).digest("hex");

  // Check if user exists in DynamoDB
  const creds = await ddbGetUserCredsByEmail(email);
  console.log("creds", creds);
  if (creds) {
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
                    ":password": { S: hashedPassword },
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
      Buffer.from(hashedPassword),
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
  } else {
    console.log("no creds");
    // User does not exist
    const user: StUser = {
      id: randomUUID(),
      email: email,
      creatorPlan: StPlan.Starter,
      platformLogin: platformLogin,
      creatorStripeAccountStatus: StConnectStatus.NotStarted,
    };

    const creds: StUserCredentials = {
      id: user.id,
      email: email,
      password: hashedPassword,
    };

    const transactWriteParams = {
      TransactItems: [
        {
          Put: {
            TableName: Table.Users.tableName,
            Item: marshall(user),
          },
        },
        {
          Put: {
            TableName: Table.UsersCreds.tableName,
            Item: marshall(creds),
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
  }
};
