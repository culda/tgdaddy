import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyHandlerV2WithLambdaAuthorizer,
} from "aws-lambda";
import { ddbGetChannelById, ddbGetUserById } from "../utils";
import Stripe from "stripe";
import { AuthorizerContext } from "../telegramAuth/handler";
import { StChannelPrice, frequencyToInterval } from "@/app/model/types";
import { ApiResponse } from "@/app/model/errors";

export const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export type TpJoinChannelRequest = {
  redirectUrl: string;
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
    return ApiResponse({
      status: 403,
    });
  }

  if (!event.body) {
    return ApiResponse({
      status: 400,
    });
  }

  const { priceId, channelId, redirectUrl } = JSON.parse(
    event.body
  ) as TpJoinChannelRequest;

  const user = await ddbGetUserById(userId);
  const channel = await ddbGetChannelById(channelId);
  const creatorUser = await ddbGetUserById(channel?.id as string);
  const creatorStripeAccountId = creatorUser?.creatorStripeAccountId;
  const pricing: StChannelPrice | undefined = channel?.pricing?.find(
    (p) => p.id === priceId
  );

  if (!pricing) {
    return ApiResponse({
      status: 400,
      message: "Invalid price ID",
    });
  }

  if (!creatorStripeAccountId) {
    return ApiResponse({
      status: 400,
      message: "Payments are not enabled",
    });
  }

  // Create custoer ID for the user if first time  customer
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

  /**
   * Find or create an appropriate Stripe price ID for the requested subscription
   */
  const products = await client.products.list(
    {
      ids: [channelId],
    },
    {
      stripeAccount: creatorStripeAccountId,
    }
  );
  const product = products.data[0];
  const existingPrices = await client.prices.list(
    {
      product: product.id,
    },
    {
      stripeAccount: creatorStripeAccountId,
    }
  );
  let price = existingPrices.data.find(
    (p) =>
      p.unit_amount === pricing.usd &&
      p.recurring?.interval === frequencyToInterval(pricing.frequency)
  );

  if (!price) {
    // Create a new price if no matching price is found
    price = await client.prices.create(
      {
        product: product.id,
        unit_amount: pricing.usd,
        currency: "usd",
        recurring: { interval: frequencyToInterval(pricing.frequency) },
      },
      {
        stripeAccount: creatorStripeAccountId,
      }
    );
  }

  /**
   * Create a Stripe Checkout session
   */
  const session = await client.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: redirectUrl,
      cancel_url: redirectUrl,
      customer: customerId,
      subscription_data: {
        metadata: {
          userId,
          channelId,
        },
      },
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
