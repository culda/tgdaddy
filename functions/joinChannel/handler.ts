import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyHandlerV2WithLambdaAuthorizer,
} from "aws-lambda";
import { dbGetUserById } from "../utils";
import Stripe from "stripe";
import { AuthorizerContext } from "../telegramAuth/handler";

export const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export type TpJoinChannelRequest = {
  redirectUrl: string;
  creatorUserId: string;
  priceId: string;
  channelId: string;
};

export type TpJoinChannelResponse = {
  paymentLink: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  const userId = event.requestContext.authorizer.lambda.userId;
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No userId on the token" }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is required" }),
    };
  }

  const { priceId, creatorUserId, channelId, redirectUrl } = JSON.parse(
    event.body
  ) as TpJoinChannelRequest;

  const user = await dbGetUserById(userId);
  const creatorUser = await dbGetUserById(creatorUserId);
  const creatorStripeAccountId = creatorUser?.creatorStripeAccountId;

  if (!creatorStripeAccountId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No Stripe account found" }),
    };
  }

  let customerId = user?.consumerStripeCustomerId;
  if (!customerId) {
    const customer = await client.customers.create(
      {},
      {
        stripeAccount: creatorStripeAccountId,
      }
    );
    customerId = customer.id;
  }

  const session = await client.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: redirectUrl,
      cancel_url: redirectUrl,
      customer: customerId,
      metadata: {
        userId,
        channelId,
      },
    },
    {
      stripeAccount: creatorStripeAccountId,
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      paymentLink: session.url,
    } as TpJoinChannelResponse),
  };
};
