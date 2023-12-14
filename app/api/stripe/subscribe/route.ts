import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import {
  TpJoinChannelRequest,
  TpJoinChannelResponse,
} from "@/functions/joinChannel/handler";
import { StChannelPrice } from "@/app/model/types";

export type TpSubscribeRequest = {
  redirectUrl: string;
  price: StChannelPrice;
  channelId: string;
};

export type TpSubscribeResponse = {
  paymentLink: string;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  const { channelId, price, redirectUrl } =
    (await req.json()) as TpSubscribeRequest;
  const joinRes = await fetch(`${process.env.API_ENDPOINT}/joinChannel`, {
    method: "POST",
    body: JSON.stringify({
      price,
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
