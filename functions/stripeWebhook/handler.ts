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
  plan: StPlan;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
  const sig = event.headers?.["stripe-signature"];
  const verify = Stripe.webhooks.constructEvent(
    Buffer.from(event.body ?? ""),
    Buffer.from(sig ?? ""),
    process.env.STRIPE_WEBHOOK_SECRET as string
  );
  switch (verify.type) {
    case "checkout.session.completed": {
      handleCheckoutCompleted(verify.data.object);
    }
    case "customer.subscription.updated": {
      if (verify.data.object.object === "subscription") {
        handleSubscriptionUpdated(verify.data.object);
      }
    }
    case "customer.subscription.deleted": {
      if (verify.data.object.object === "subscription") {
        handleSubscriptionDeleted(verify.data.object);
      }
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
    UpdateExpression: `SET #plan = :plan REMOVE stripeSubscriptionId`,
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
  const { userId } = data.metadata as CheckoutCompletedMetadata;
  const input: UpdateItemCommandInput = {
    TableName: Table.Users.tableName,
    Key: {
      id: { S: userId },
    },
    UpdateExpression: `SET #plan = :plan, stripeSubscriptionId = :stripeSubscriptionId`,
    ExpressionAttributeValues: {
      ":plan": { S: data.items.data[0].plan.nickname as string },
      ":stripeSubscriptionId": { S: data.id as string },
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

async function handleCheckoutCompleted(data: Stripe.Checkout.Session) {
  const { plan, userId } = data.metadata as CheckoutCompletedMetadata;
  const input: UpdateItemCommandInput = {
    TableName: Table.Users.tableName,
    Key: {
      id: { S: userId },
    },
    UpdateExpression: `SET #plan = :plan, stripeSubscriptionId = :stripeSubscriptionId, stripeCustomerId = :stripeCustomerId`,
    ExpressionAttributeValues: {
      ":plan": { S: plan as string },
      ":stripeSubscriptionId": { S: data.subscription as string },
      ":stripeCustomerId": { S: data.customer as string },
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
