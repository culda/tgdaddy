import { StConnectStatus } from "@/app/model/types";
import { PROD_DOMAIN } from "@/constants";
import { ApiResponse } from "@/functions/errors";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import Stripe from "stripe";
import { AuthorizerContext } from "../jwtAuth/handler";
import { lambdaWrapperAuth } from "../lambdaWrapper";
import { ddbGetUserById, dynamoDb } from "../utils";

export const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export type TpConnectStripeResponse = {
  connectUrl: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId: string) => {
    const user = await ddbGetUserById(userId);

    let accountId;
    if (!user?.creatorStripeAccountId) {
      const account = await client.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: user?.id as string,
        },
      });

      accountId = account.id;
    } else {
      accountId = user.creatorStripeAccountId;
    }

    const accountLink = await client.accountLinks.create({
      account: accountId,
      refresh_url: `https://${PROD_DOMAIN}/app/connect`,
      return_url: `https://${PROD_DOMAIN}/app`,
      type: "account_onboarding",
    });

    await dynamoDb.send(
      new UpdateItemCommand({
        TableName: Table.Users.tableName,
        Key: marshall({ id: userId }),
        UpdateExpression:
          "SET creatorStripeAccountId = :creatorStripeAccountId, creatorStripeAccountStatus = :creatorStripeAccountStatus",
        ExpressionAttributeValues: {
          ":creatorStripeAccountId": { S: accountId },
          ":creatorStripeAccountStatus": { S: StConnectStatus.Pending },
        },
      })
    );

    return ApiResponse({
      status: 200,
      body: {
        connectUrl: accountLink.url,
      } as TpConnectStripeResponse,
    });
  });
};
