import { NextRequest, NextResponse } from "next/server";
import { client } from "../stripe";
import { StConnectStatus, StUser } from "@/app/model/types";
import { auth } from "../../auth/[...nextauth]/route";

export type TpConnectStripeRequest = {
  userId: string;
  redirectUrl: string;
};

export type TpConnectStripeResponse = {
  url: string;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  try {
    const { userId, redirectUrl } =
      (await req.json()) as TpConnectStripeRequest;

    const account = await client.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        userId,
      },
    });

    await fetch(`${process.env.API_ENDPOINT}/user`, {
      method: "POST",
      body: JSON.stringify({
        creatorStripeAccountId: account.id,
        creatorStripeAccountStatus: StConnectStatus.Pending,
      } as StUser),
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const accountLink = await client.accountLinks.create({
      account: account.id,
      refresh_url: redirectUrl,
      return_url: redirectUrl,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
