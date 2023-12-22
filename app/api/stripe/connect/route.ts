import { NextRequest, NextResponse } from "next/server";
import { client } from "../stripe";
import { StConnectStatus, StUser } from "@/app/model/types";
import { auth } from "../../auth/[...nextauth]/auth";

export type TpConnectStripeRequest = {
  redirectUrl: string;
};

export type TpConnectStripeResponse = {
  connectUrl: string;
};

export async function POST(req: NextRequest) {
  const session = await auth();

  const fetchUser = async () => {
    const userRes = await fetch(`${process.env.API_ENDPOINT}/user`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: "application/json",
      },
    });
    return (await userRes.json()) as StUser;
  };

  try {
    const user = await fetchUser();

    let accountId;
    if (!user.creatorStripeAccountId) {
      const account = await client.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: user.id as string,
        },
      });

      accountId = account.id;
    } else {
      accountId = user.creatorStripeAccountId;
    }

    const accountLink = await client.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_HOST}/api/stripe/connect`,
      return_url: `${process.env.NEXT_PUBLIC_HOST}/app`,
      type: "account_onboarding",
    });

    /**
     * Store account ID in order to continue setup if link is interrupted
     */
    await fetch(`${process.env.API_ENDPOINT}/user`, {
      method: "POST",
      body: JSON.stringify({
        creatorStripeAccountId: accountId,
        creatorStripeAccountStatus: StConnectStatus.Pending,
      } as StUser),
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json({ connectUrl: accountLink.url });
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
