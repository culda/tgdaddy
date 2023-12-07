import { StPlan, StUser } from "@/app/model/types";
import { NextRequest, NextResponse } from "next/server";
import { client } from "../stripe";
import Stripe from "stripe";

export type TpPlanRequest = {
  user: StUser;
  plan: StPlan;
};

export type TpPlanResponse = {
  paymentLink: Stripe.PaymentLink;
};

export async function POST(req: NextRequest) {
  try {
    const { user, plan } = (await req.json()) as TpPlanRequest;

    const products = await client.products.list();
    const product = products.data[0];

    let customerId = user.stripeCustomerId;

    const prices = await client.prices.list({
      product: product.id,
    });
    const price = prices.data.find((p) => p.nickname === plan);

    if (!price) {
      return NextResponse.json({ error: "Invalid plan" });
    }

    if (!customerId) {
      const customer = await client.customers.create({
        name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;
    }

    const paymentLink = await client.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        plan,
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.NEXT_PUBLIC_HOST}/plan`,
        },
      },
    });

    return NextResponse.json({ paymentLink });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message });
    }
  }
}
