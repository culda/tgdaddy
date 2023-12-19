import { StChannel, StConsumerSubscription } from "../model/types";
import ChannelPublic from "./ChannelPublic";
import { TpGetSubscriptionRequest } from "@/functions/subscriptions/handler";
import { auth } from "../api/auth/[...nextauth]/auth";
import { Telegram } from "puregram";
import Button from "../components/Button";
import AccountWidget from "../components/AccountWidget";
import { notFound } from "next/navigation";

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

    if (!res.ok) {
      return undefined;
    }

    return (await res.json()) as StChannel;
  };

  const fetchSubscription = async (username: string) => {
    const res = await fetch(`${process.env.API_ENDPOINT}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      cache: "no-cache",
      body: JSON.stringify({
        username,
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

  if (!channel) {
    return notFound();
  }

  let sub;

  if (session?.user?.id) {
    sub = await fetchSubscription(channel.username as string);
  }

  const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);

  let link: string | undefined;

  if (sub && channel.channelId) {
    try {
      const inviteLink = await telegram.api.createChatInviteLink({
        chat_id: channel.channelId,
        member_limit: 1,
      });
      link = inviteLink.invite_link;
    } catch (err) {
      console.log(err);
    }
  }

  const myChannel = channel.userId === session?.user?.id;

  return (
    <div className="relative max-w-md flex mx-auto">
      <div className="absolute top-0 right-0 p-2 flex flex-row gap-2">
        {myChannel && (
          <Button variant="secondary" href={`/app/channels/${channel.id}`}>
            {" "}
            Manage{" "}
          </Button>
        )}
        <AccountWidget />
      </div>
      <div className="mt-8">
        <ChannelPublic channel={channel} sub={sub} link={link} />
      </div>
    </div>
  );
}
