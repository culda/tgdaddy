import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import { TpJoinChannelRequest } from "@/functions/joinChannel/handler";

export type TpUnjoinRequest = {
  channelId: string;
  creatorUserId: string;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  const { channelId, creatorUserId } = (await req.json()) as TpUnjoinRequest;
  await fetch(`${process.env.API_ENDPOINT}/unjoinChannel`, {
    method: "POST",
    body: JSON.stringify({
      creatorUserId,
      channelId,
    } as TpJoinChannelRequest),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });

  return NextResponse.json({});
}
