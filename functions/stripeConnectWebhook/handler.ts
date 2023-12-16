import {
  DeleteItemCommand,
  ScanCommand,
  ScanCommandInput,
  TransactWriteItemsCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Stripe } from "stripe";
import { Table } from "sst/node/table";
import { StConnectStatus, StConsumerSubscription } from "@/app/model/types";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ApiResponse } from "@/app/model/errors";
import { dynamoDb } from "../utils";

export const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export type CheckoutCompletedMetadata = {
  userId: string;
  channelId: string;
};

export type SubscriptionDeletedMetadata = {
  userId: string;
  channelId: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const sig = event.headers?.["stripe-signature"];
  const verify = Stripe.webhooks.constructEvent(
    Buffer.from(event.body ?? ""),
    Buffer.from(sig ?? ""),
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET as string
  );
  console.log(verify);
  switch (verify.type) {
    case "account.external_account.created": {
      await handleAccountCreated(verify);
      break;
    }
    case "checkout.session.completed": {
      await handleCheckoutCompleted(verify);
      break;
    }
    case "customer.subscription.deleted": {
      await handleSubscriptionDeleted(verify.data.object);
      break;
    }
  }
  return {
    statusCode: 200,
  };
};

async function handleSubscriptionDeleted(data: Stripe.Subscription) {
  const { userId, channelId } = data.metadata as SubscriptionDeletedMetadata;
  const subId = `${userId}/${channelId}`;

  // delete subscription
  await dynamoDb.send(
    new DeleteItemCommand({
      TableName: Table.ConsumerSubscriptions.tableName,
      Key: marshall({ id: subId }),
    })
  );
}

async function handleCheckoutCompleted(
  data: Stripe.CheckoutSessionCompletedEvent
) {
  const { userId, channelId } = data.data.object
    .metadata as CheckoutCompletedMetadata;

  const consumerSub: StConsumerSubscription = {
    id: `${userId}/${channelId}`,
    consumerStripeCustomerId: data.data.object.customer as string,
    consumerStripeSubscriptionId: data.data.object.subscription as string,
  };

  await dynamoDb.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: Table.ConsumerSubscriptions.tableName,
            Item: marshall(consumerSub),
          },
        },
        {
          Update: {
            TableName: Table.Users.tableName,
            Key: marshall({ id: userId }),
            UpdateExpression: `SET consumerStripeCustomerId = :consumerStripeCustomerId`,
            ExpressionAttributeValues: {
              ":consumerStripeCustomerId": {
                S: data.data.object.customer as string,
              },
            },
          },
        },
      ],
    })
  );
}

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
    },
    {
      stripeAccount: accountId,
    }
  );
}

async function ddbConnectAccount(accountId: string) {
  const scanInput: ScanCommandInput = {
    TableName: Table.Users.tableName,
    FilterExpression: "creatorStripeAccountId = :creatorStripeAccountId",
    ExpressionAttributeValues: {
      ":creatorStripeAccountId": { S: accountId },
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
      Key: marshall({ id: userId }),
      UpdateExpression: `SET creatorStripeAccountStatus = :creatorStripeAccountStatus`,
      ExpressionAttributeValues: {
        ":creatorStripeAccountStatus": { S: StConnectStatus.Connected },
      },
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.send(new UpdateItemCommand(updateInput));
  }
}
