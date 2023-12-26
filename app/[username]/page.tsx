import { StPage, StConsumerSubscription } from "../model/types";
import { TpGetSubscriptionRequest } from "@/functions/subscriptions/handler";
import { auth } from "../api/auth/[...nextauth]/auth";
import { Telegram } from "puregram";
import Button from "../components/Button";
import AccountWidget from "../components/AccountWidget";
import { notFound } from "next/navigation";
import PagePublic from "./PagePublic";
import { isProd } from "../../utils";

type PpPage = {
  params: { username: string };
};

export default async function Page({ params }: PpPage) {
  const session = await auth();

  const fetchPage = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/pages/${params.username}`,
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

    return (await res.json()) as StPage;
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

  const page = await fetchPage();

  if (!page) {
    return notFound();
  }

  let sub;

  if (session?.user?.id && isProd()) {
    sub = await fetchSubscription(page.username as string);
  } else {
    sub = {
      id: "1234",
      consumerStripeCustomerId: "1234",
      consumerStripeSubscriptionId: "1234",
    };
  }

  const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);

  let link: string | undefined;

  if (sub && isProd() && page.channelId) {
    try {
      const inviteLink = await telegram.api.createChatInviteLink({
        chat_id: page.channelId,
        member_limit: 1,
      });
      link = inviteLink.invite_link;
    } catch (err) {
      console.log(err);
    }
  } else {
    link = "https://t.me/thisislink";
  }

  const myPage = page.userId === session?.user?.id;

  return (
    <div className="relative max-w-md flex mx-auto">
      <div className="absolute top-0 right-0 p-2 flex flex-row gap-2">
        {myPage && (
          <Button variant="secondary" href={`/app/pages/${page.id}`}>
            {" "}
            Manage{" "}
          </Button>
        )}
        <AccountWidget platformLogin={false} />
      </div>
      <div className="mt-8">
        <PagePublic page={page} sub={sub} link={link} />
      </div>
    </div>
  );
}
