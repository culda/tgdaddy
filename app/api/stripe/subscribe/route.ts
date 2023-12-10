import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import {
  TpJoinChannelRequest,
  TpJoinChannelResponse,
} from "@/functions/joinChannel/handler";

export type TpSubscribeRequest = {
  redirectUrl: string;
  creatorUserId: string;
  priceId: string;
  channelId: string;
};

export type TpSubscribeResponse = {
  paymentLink: string;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  const { channelId, creatorUserId, priceId, redirectUrl } =
    (await req.json()) as TpSubscribeRequest;
  const joinRes = await fetch(`${process.env.API_ENDPOINT}/joinChannel`, {
    method: "POST",
    body: JSON.stringify({
      creatorUserId,
      priceId,
      redirectUrl,
      channelId,
    } as TpJoinChannelRequest),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });

  const { paymentLink } = (await joinRes.json()) as TpJoinChannelResponse;

  return NextResponse.json({ paymentLink });
}
