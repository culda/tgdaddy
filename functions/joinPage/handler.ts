import {
  StConnectStatus,
  StPagePrice,
  StPlan,
  StPriceFrequency,
} from '@/app/model/types';
import { ApiResponse, checkNull } from '@/functions/errors';
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import Stripe from 'stripe';
import { AuthorizerContext } from '../jwtAuth/handler';
import { lambdaWrapperAuth } from '../lambdaWrapper';
import { ddbGetPageById, ddbGetUserById } from '../utils';

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
  return lambdaWrapperAuth(event, async (userId: string) => {
    const body = checkNull(event.body, 400);
    console.log(body);

    const { priceId, pageId, redirectUrl } = JSON.parse(
      body
    ) as TpJoinPageRequest;

    const user = await ddbGetUserById(userId);
    const page = await ddbGetPageById(pageId);
    if (!page) {
      return ApiResponse({
        status: 400,
        message: 'Page not found',
      });
    }
    const creatorUser = await ddbGetUserById(page.userId);
    const creatorStripeAccountId = creatorUser?.creatorStripeAccountId;
    const selectedPrice: StPagePrice | undefined = page?.prices?.find(
      (p) => p.id === priceId
    );

    if (!selectedPrice) {
      return ApiResponse({
        status: 400,
        message: 'Invalid price ID',
      });
    }

    if (creatorUser?.creatorStripeAccountStatus !== StConnectStatus.Connected) {
      return ApiResponse({
        status: 400,
        message: 'Payments are not enabled',
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
        p.unit_amount === selectedPrice.usd &&
        p.recurring?.interval === frequencyToInterval(selectedPrice.frequency)
    );

    if (!price) {
      // Create a new price if no matching price is found
      if (selectedPrice.frequency === StPriceFrequency.Once) {
        price = await client.prices.create(
          {
            product: product.id,
            unit_amount: selectedPrice.usd,
            currency: 'usd',
          },
          {
            stripeAccount: creatorStripeAccountId,
          }
        );
      } else {
        price = await client.prices.create(
          {
            product: product.id,
            unit_amount: selectedPrice.usd,
            currency: 'usd',
            recurring: {
              interval: frequencyToInterval(selectedPrice.frequency),
            },
          },
          {
            stripeAccount: creatorStripeAccountId,
          }
        );
      }
    }

    console.log('New checkout session', userId, pageId);

    /**
     * Create a Stripe Checkout session
     */
    const session = await client.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        line_items: [{ price: price.id, quantity: 1 }],
        mode:
          selectedPrice.frequency === StPriceFrequency.Once
            ? 'payment'
            : 'subscription',
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

    return ApiResponse({
      status: 200,
      body: {
        paymentLink: session.url,
      },
    });
  });
};

function getFeePercentage(plan: StPlan): number {
  switch (plan) {
    case StPlan.Starter:
      return 12;
    case StPlan.Growth:
      return 8;
    case StPlan.Pro:
      return 5;
    case StPlan.Business:
      return 1;
  }
}

const frequencyToInterval = (
  frequency: StPriceFrequency
): Stripe.PriceCreateParams.Recurring.Interval => {
  switch (frequency) {
    case StPriceFrequency.Month:
      return 'month';
    case StPriceFrequency.Week:
      return 'week';
    default:
      throw new Error('Invalid frequency');
  }
};
