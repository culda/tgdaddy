import { StChannel, StConsumerSubscription } from "../model/types";
import ChannelPublic from "./ChannelPublic";
import ConnectTelegram from "../components/ConnectTelegram";
import { TpGetSubscriptionRequest } from "@/functions/subscriptions/handler";
import { auth } from "../api/auth/[...nextauth]/route";
import { Telegram } from "puregram";

type PpChannel = {
  params: { username: string };
};

const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);

export default async function Page({ params }: PpChannel) {
  const session = await auth();

  const fetchChannel = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/channels/${params.username}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      }
    );
    const channel = await res.json();
    return channel.data as StChannel;
  };

  const fetchSubscription = async (channelId: string) => {
    const res = await fetch(`${process.env.API_ENDPOINT}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      cache: "no-cache",
      body: JSON.stringify({
        channelId,
      } as TpGetSubscriptionRequest),
    });
    const subscription = await res.json();
    return subscription.data as StConsumerSubscription | undefined;
  };

  const channel = await fetchChannel();
  const sub = await fetchSubscription(channel.id);
  const link = await telegram.api.createChatInviteLink({
    chat_id: channel.id,
    member_limit: 1,
  });

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 pt-4 pr-4">
        <ConnectTelegram />
      </div>
      <ChannelPublic channel={channel} sub={sub} link={link} />
    </div>
  );
}
