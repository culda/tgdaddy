import { StPlan, StUser } from "@/app/model/types";
import { NextRequest, NextResponse } from "next/server";
import { client } from "../stripe";
import Stripe from "stripe";

export type TpSubscribeRequest = {
  username: string;
  channelUserId: string;
  channelId: string;
  priceId: string;
};

export type TpSubscribeResponse = {
  paymentLink: Stripe.PaymentLink;
};

export async function POST(req: NextRequest) {
  const { username, channelId, channelUserId, priceId } =
    (await req.json()) as TpSubscribeRequest;
  const joinRes = await fetch(`${process.env.API_ENDPOINT}/joinChannel`, {
    method: "POST",
    body: JSON.stringify({
      username,
      channelUserId,
      channelId,
      priceId,
    }),
    headers: {
      "Content-Type": "application/json",
      admintoken: process.env.ADMIN_AUTH_TOKEN as string,
    },
  });

  console.log(await joinRes.json());

  try {
    // const { stripeAccountId } = (await req.json()) as TpSubscribeRequest;
    // const products = await client.products.list(
    //   {},
    //   {
    //     stripeAccount: stripeAccountId,
    //   }
    // );
    // console.log(products);
    // const product = products.data[0];
    // let customerId = user.stripeCustomerId;
    // const prices = await client.prices.list({
    //   product: product.id,
    // });
    // const price = prices.data.find((p) => p.nickname === plan);
    // if (!price) {
    //   return NextResponse.json({ error: "Invalid plan" });
    // }
    // if (!customerId) {
    //   const customer = await client.customers.create({
    //     name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    //     metadata: {
    //       userId: user.id,
    //     },
    //   });
    //   customerId = customer.id;
    // }
    // const paymentLink = await client.paymentLinks.create(
    //   {
    //     line_items: [
    //       {
    //         price: price.id,
    //         quantity: 1,
    //       },
    //     ],
    //     metadata: {
    //       userId: user.id,
    //     },
    //     after_completion: {
    //       type: "redirect",
    //       redirect: {
    //         url: `${process.env.NEXT_PUBLIC_HOST}/plan`,
    //       },
    //     },
    //   },
    //   {
    //     stripeAccount: connectedAccountId,
    //   }
    // );
    // return NextResponse.json({ paymentLink });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message });
    }
  }
}
