import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { client, frequencyToInterval } from "../stripe";
import { StPriceFrequency, StUser } from "@/app/model/types";
import { auth } from "../../auth/[...nextauth]/route";

export type TpPriceRequest = {
  username: string;
  channelId: string;
  priceUsd: number; // in cents
  frequency: StPriceFrequency;
};

export type TpPriceResponse = {
  pricing: { id: string; usd: number; frequency: StPriceFrequency }[];
  needsStripeConnect?: boolean;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  const userRes = await fetch(`${process.env.API_ENDPOINT}/user`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  const user = (await userRes.json()).data as StUser;
  if (!user.creatorStripeAccountId) {
    return NextResponse.json({ needsStripeConnect: true });
  }
  const { username, channelId, priceUsd, frequency } =
    (await req.json()) as TpPriceRequest;

  try {
    const products = await client.products.list(
      {
        ids: [channelId],
      },
      {
        stripeAccount: user.creatorStripeAccountId,
      }
    );

    console.log(products);

    let product;
    if (products.data.length === 0) {
      product = await client.products.create(
        {
          name: username,
          id: channelId,
        },
        {
          stripeAccount: user.creatorStripeAccountId,
        }
      );
    } else {
      product = products.data[0];
    }

    // Check if an existing price matches the specified amount and frequency
    const existingPrices = await client.prices.list(
      {
        product: product.id,
      },
      {
        stripeAccount: user.creatorStripeAccountId,
      }
    );

    let price = existingPrices.data.find(
      (p) =>
        p.unit_amount === priceUsd &&
        p.recurring?.interval === frequencyToInterval(frequency)
    );

    if (!price) {
      // Create a new price if no matching price is found
      price = await client.prices.create(
        {
          product: product.id,
          unit_amount: priceUsd,
          currency: "usd",
          recurring: { interval: frequencyToInterval(frequency) },
        },
        {
          stripeAccount: user.creatorStripeAccountId,
        }
      );
    }

    const pricing = [
      { id: price.id, usd: price.unit_amount, frequency: frequency },
    ];

    return NextResponse.json({ pricing });
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message });
    }
    return NextResponse.json({ error: "Unknown error occurred" });
  }
}
