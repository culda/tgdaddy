import { NextRequest, NextResponse } from "next/server";
import { Telegram } from "puregram";

export type TpInviteLinkRequest = {
  channelId: string;
};

export type TpInviteLinkResponse = {
  link: string;
};

const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);

export async function POST(req: NextRequest) {
  const { channelId } = (await req.json()) as TpInviteLinkRequest;
  try {
    const link = await telegram.api.exportChatInviteLink({
      chat_id: channelId,
    });
    return NextResponse.json({ link });
  } catch (err) {
    console.log(err);
    return NextResponse.error();
  }
}
