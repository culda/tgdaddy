import { StChannel, StConsumerSubscription } from "../model/types";
import ChannelPublic from "./ChannelPublic";
import ConnectTelegram from "../components/ConnectTelegram";
import { TpGetSubscriptionRequest } from "@/functions/subscriptions/handler";
import { auth } from "../api/auth/[...nextauth]/route";
import { Telegram } from "puregram";
import Button from "../components/Button";

type PpChannel = {
  params: { username: string };
};

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
    return (await res.json()) as StChannel;
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

    const data = await res.json();

    if (
      !res.ok ||
      (Object.keys(data).length === 0 && data.constructor === Object)
    ) {
      return undefined;
    }

    return data as StConsumerSubscription;
  };

  const channel = await fetchChannel();
  const sub = await fetchSubscription(channel.id);
  const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);
  const link =
    sub &&
    (await telegram.api.createChatInviteLink({
      chat_id: channel.id,
      member_limit: 1,
    }));

  const myChannel = channel.userId === session?.user?.id;

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 pt-4 pr-4 flex flex-row gap-2">
        {myChannel && (
          <Button variant="secondary" href={`/app/channels/${channel.id}`}>
            {" "}
            Manage{" "}
          </Button>
        )}
        <ConnectTelegram />
      </div>
      <ChannelPublic channel={channel} sub={sub} link={link?.invite_link} />
    </div>
  );
}
