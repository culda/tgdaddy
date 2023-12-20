import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { ddbGetPageById, ddbGetUserById } from "../utils";
import Stripe from "stripe";
import { AuthorizerContext } from "../telegramAuth/handler";
import {
  StPagePrice,
  StConnectStatus,
  StPlan,
  frequencyToInterval,
} from "@/app/model/types";
import { ApiResponse } from "@/app/model/errors";

export const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export type TpJoinPageRequest = {
  redirectUrl: string;
  priceId: string;
  pageId: string;
};

export type TpJoinPageResponse = {
  paymentLink: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  console.log(event);
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

  const { priceId, pageId, redirectUrl } = JSON.parse(
    event.body
  ) as TpJoinPageRequest;

  const user = await ddbGetUserById(userId);
  const page = await ddbGetPageById(pageId);
  if (!page) {
    return ApiResponse({
      status: 400,
      message: "Page not found",
    });
  }
  const creatorUser = await ddbGetUserById(page.userId);
  const creatorStripeAccountId = creatorUser?.creatorStripeAccountId;
  const pricing: StPagePrice | undefined = page?.pricing?.find(
    (p) => p.id === priceId
  );

  if (!pricing) {
    return ApiResponse({
      status: 400,
      message: "Invalid price ID",
    });
  }

  if (creatorUser?.creatorStripeAccountStatus !== StConnectStatus.Connected) {
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
   * Find or create an appropriate product
   */
  let product;
  const products = await client.products.list(
    {},
    {
      stripeAccount: creatorStripeAccountId,
    }
  );

  if (products.data.length === 0) {
    product = await client.products.create(
      {
        name: page.username,
      },
      {
        stripeAccount: creatorStripeAccountId,
      }
    );
  } else {
    product = products.data[0];
  }

  /**
   * Find or create an appropriate price
   */
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
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      success_url: redirectUrl,
      cancel_url: redirectUrl,
      customer: customerId,
      subscription_data: {
        application_fee_percent: getFeePercentage(creatorUser.creatorPlan),
        metadata: {
          userId,
          pageId,
        },
      },
      metadata: {
        userId,
        pageId,
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
    } as TpJoinPageResponse),
  };
};

function getFeePercentage(plan: StPlan): number {
  switch (plan) {
    case StPlan.Starter:
      return 18;
    case StPlan.Growth:
      return 8;
    case StPlan.Pro:
      return 5;
    case StPlan.Business:
      return 1;
  }
}
