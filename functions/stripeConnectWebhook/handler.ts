import {
  ScanCommand,
  ScanCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Stripe } from "stripe";
import { Table } from "sst/node/table";
import { dynamoDb } from "../utils";
import { StConnectStatus } from "@/app/model/types";

export const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export type AccountCreatedMetadata = {
  userId: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
  const sig = event.headers?.["stripe-signature"];
  const verify = Stripe.webhooks.constructEvent(
    Buffer.from(event.body ?? ""),
    Buffer.from(sig ?? ""),
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET as string
  );
  switch (verify.type) {
    case "account.external_account.created": {
      handleAccountCreated(verify);
    }
  }
  return {
    statusCode: 200,
  };
};

async function handleAccountCreated(
  data: Stripe.AccountExternalAccountCreatedEvent
) {
  await ddbConnectAccount(data.account as string);
  await createProduct(data.account as string);
}

async function createProduct(accountId: string) {
  await client.products.create(
    {
      name: "Channel Subscription",
      description: "Join my channel",
    },
    {
      stripeAccount: accountId,
    }
  );
}

async function ddbConnectAccount(accountId: string) {
  const scanInput: ScanCommandInput = {
    TableName: Table.Users.tableName,
    FilterExpression: "stripeAccountId = :stripeAccountId",
    ExpressionAttributeValues: {
      ":stripeAccountId": { S: accountId },
    },
  };

  const { Items } = await dynamoDb.send(new ScanCommand(scanInput));

  if (!Items) {
    throw new Error("Account not found");
  }

  for (const item of Items) {
    const userId = item.id.S as string;
    const updateInput: UpdateItemCommandInput = {
      TableName: Table.Users.tableName,
      Key: {
        id: { S: userId },
      },
      UpdateExpression: `SET stripeAccountStatus = :stripeAccountStatus`,
      ExpressionAttributeValues: {
        ":stripeAccountStatus": { S: StConnectStatus.Connected },
      },
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.send(new UpdateItemCommand(updateInput));
  }
}
