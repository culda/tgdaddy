import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ddbGetUserCredsByEmail, dynamoDb } from "../utils";
import { ApiResponse } from "@/app/model/errors";
import Mailgun from "mailgun.js";
import formData from "form-data";
import { randomBytes } from "crypto";
import { PROD_DOMAIN } from "@/constants";
import { PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Table } from "sst/node/table";
import { marshall } from "@aws-sdk/util-dynamodb";
import dayjs from "dayjs";

export type ForgotPasswordRequest = {
  email: string;
  callbackUrl: string;
  platformLogin?: string;
};

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY as string,
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event.body);
  if (!event.body) {
    return ApiResponse({
      status: 400,
    });
  }

  const { email, callbackUrl, platformLogin } = JSON.parse(
    event.body
  ) as ForgotPasswordRequest;

  // Check if user exists in DynamoDB
  const creds = await ddbGetUserCredsByEmail(email);

  /** If user not found, do nothing and do not offer information to client */
  if (!creds) {
    return ApiResponse({
      status: 200,
    });
  }

  /**If user found, create and send a reset link to user */
  const resetCode = randomBytes(20).toString("hex");
  const now = dayjs();
  const resetCodeExpiry = now.add(30, "minutes").unix();

  // add reset code to user creds table
  await dynamoDb.send(
    new UpdateItemCommand({
      TableName: Table.UsersCreds.tableName,
      Key: marshall({ email }),
      UpdateExpression:
        "set resetCode = :resetCode, resetCodeExpiry = :resetCodeExpiry",
      ExpressionAttributeValues: {
        ":resetCode": { S: resetCode },
        ":resetCodeExpiry": { N: resetCodeExpiry.toString() },
      },
    })
  );

  const resetLink = `https://${PROD_DOMAIN}/login/forgetPassword?email=${email}&code=${resetCode}&callbackUrl=${callbackUrl}&platformLogin=${platformLogin}`;
  const emailData = {
    from: "Memberspage <support@help.members.page>",
    to: email,
    subject: "Password Reset Request",
    text: `To reset your password, please click the following link: ${resetLink}`,
  };

  await mg.messages.create("help.members.page", emailData);

  return ApiResponse({
    status: 200,
  });
};
