import { NextRequest, NextResponse } from "next/server";
import { client } from "../stripe";
import { StUser } from "@/app/model/types";

export type TpConnectStripeRequest = {
  user: StUser;
};

export type TpConnectStripeResponse = {
  accountId: string;
  connectUrl: string;
};

export async function POST(req: NextRequest) {
  try {
    const { user } = (await req.json()) as TpConnectStripeRequest;

    let accountId = user.stripeAccountId;
    if (!accountId) {
      const account = await client.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
    }

    const accountLink = await client.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_HOST}/plan`,
      return_url: `${process.env.NEXT_PUBLIC_HOST}/plan`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      accountId: accountId,
      connectUrl: accountLink.url,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
