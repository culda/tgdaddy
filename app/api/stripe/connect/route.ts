import { NextRequest, NextResponse } from "next/server";
import { client } from "../stripe";
import { StUser } from "@/app/model/types";
import { auth } from "../../auth/[...nextauth]/route";

export type TpConnectStripeRequest = {
  user: StUser;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  try {
    const { user } = (await req.json()) as TpConnectStripeRequest;

    let accountId = user.creatorStripeAccountId;
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

    await fetch(`${process.env.API_ENDPOINT}/user`, {
      method: "POST",
      body: JSON.stringify({
        creatorStripeAccountId: accountId,
      } as StUser),
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const accountLink = await client.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_HOST}/app/plan`,
      return_url: `${process.env.NEXT_PUBLIC_HOST}/app/plan`,
      type: "account_onboarding",
    });

    return NextResponse.redirect(accountLink.url);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
