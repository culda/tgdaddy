import {
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Stripe } from "stripe";
import { Table } from "sst/node/table";
import { dynamoDb } from "../utils";
import { StPlan } from "@/app/model/types";

export type CheckoutCompletedMetadata = {
  userId: string;
  creatorPlan: StPlan;
};

export type SubscriptionUpdatedMetadata = {
  userId: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event.body);
  const sig = event.headers?.["stripe-signature"];
  const verify = Stripe.webhooks.constructEvent(
    Buffer.from(event.body ?? ""),
    Buffer.from(sig ?? ""),
    process.env.STRIPE_WEBHOOK_SECRET as string
  );
  switch (verify.type) {
    case "checkout.session.completed": {
      handleCheckoutCompleted(verify.data.object);
      break;
    }
    case "customer.subscription.updated": {
      handleSubscriptionUpdated(verify.data.object);
      break;
    }
    case "customer.subscription.deleted": {
      handleSubscriptionDeleted(verify.data.object);
      break;
    }
  }
  return {
    statusCode: 200,
  };
};

async function handleSubscriptionDeleted(data: Stripe.Subscription) {
  const { userId } = data.metadata as CheckoutCompletedMetadata;
  const input: UpdateItemCommandInput = {
    TableName: Table.Users.tableName,
    Key: {
      id: { S: userId },
    },
    UpdateExpression: `SET #plan = :plan REMOVE creatorStripeSubscriptionId`,
    ExpressionAttributeValues: {
      ":plan": { S: StPlan.Starter },
    },
    ExpressionAttributeNames: {
      "#plan": "plan",
    },
    ReturnValues: "ALL_NEW",
  };

  const { Attributes } = await dynamoDb.send(new UpdateItemCommand(input));

  if (!Attributes) {
    return undefined;
  }
}

async function handleSubscriptionUpdated(data: Stripe.Subscription) {
  const { userId } = data.metadata as SubscriptionUpdatedMetadata;
  if (!userId) {
    console.log("No userId in metadata");
    return;
  }
  const input: UpdateItemCommandInput = {
    TableName: Table.Users.tableName,
    Key: {
      id: { S: userId },
    },
    UpdateExpression: `SET #plan = :plan, creatorStripeSubscriptionId = :creatorStripeSubscriptionId`,
    ExpressionAttributeValues: {
      ":plan": { S: data.items.data[0].plan.nickname as string },
      ":creatorStripeSubscriptionId": { S: data.id as string },
    },
    ExpressionAttributeNames: {
      "#plan": "plan",
    },
    ConditionExpression: "attribute_exists(creatorStripeSubscriptionId)",
    ReturnValues: "ALL_NEW",
  };

  const { Attributes } = await dynamoDb.send(new UpdateItemCommand(input));

  if (!Attributes) {
    return undefined;
  }
}

async function handleCheckoutCompleted(data: Stripe.Checkout.Session) {
  const { creatorPlan, userId } = data.metadata as CheckoutCompletedMetadata;
  const input: UpdateItemCommandInput = {
    TableName: Table.Users.tableName,
    Key: {
      id: { S: userId },
    },
    UpdateExpression: `SET creatorPlan = :creatorPlan, creatorStripeSubscriptionId = :creatorStripeSubscriptionId, creatorStripeCustomerId = :creatorStripeCustomerId`,
    ExpressionAttributeValues: {
      ":creatorPlan": { S: creatorPlan as string },
      ":creatorStripeSubscriptionId": { S: data.subscription as string },
      ":creatorStripeCustomerId": { S: data.customer as string },
    },
    ReturnValues: "ALL_NEW",
  };

  const { Attributes } = await dynamoDb.send(new UpdateItemCommand(input));

  if (!Attributes) {
    return undefined;
  }
}
