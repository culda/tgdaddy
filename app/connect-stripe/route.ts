import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  console.log(req.method);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  try {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_HOST}/reauth`,
      return_url: `${process.env.NEXT_PUBLIC_HOST}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
