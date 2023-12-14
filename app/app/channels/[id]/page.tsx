import PageLayout from "@/app/components/PageLayout";
import { StChannel, StConnectStatus, StUser } from "../../../model/types";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import Channel from "./Channel";
import { notFound } from "next/navigation";
import Button from "@/app/components/Button";
import { client } from "@/app/api/stripe/stripe";
import { TpConnectStripeResponse } from "@/app/api/stripe/connect/route";

type PpChannel = {
  params: { id: string };
};

export default async function Page({ params }: PpChannel) {
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

  const fetchChannel = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/channels?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          ContentType: "application/json",
        },
      }
    );
    return (await res.json()) as StChannel;
  };

  const channel = await fetchChannel();
  const user = await fetchUser();
  let connectUrl: string | undefined;

  // if (user.creatorStripeAccountStatus !== StConnectStatus.Connected) {
  //   // let accountId;

  //   // if (!user.creatorStripeAccountId) {
  //   //   const account = await client.accounts.create({
  //   //     type: "express",
  //   //     capabilities: {
  //   //       card_payments: { requested: true },
  //   //       transfers: { requested: true },
  //   //     },
  //   //     metadata: {
  //   //       userId: session?.user?.id as string,
  //   //     },
  //   //   });

  //   //   accountId = account.id;
  //   // } else {
  //   //   accountId = user.creatorStripeAccountId;
  //   // }

  //   // const redirectUrl = `${process.env.NEXT_PUBLIC_HOST}/app/channels/${channel.id}`;
  //   // const accountLink = await client.accountLinks.create({
  //   //   account: accountId,
  //   //   refresh_url: redirectUrl,
  //   //   return_url: redirectUrl,
  //   //   type: "account_onboarding",
  //   // });
  //   const connectRes = await fetch(
  //     `${process.env.NEXT_PUBLIC_HOST}"/api/stripe/connect"`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );

  //   connectUrl = ((await connectRes.json()) as TpConnectStripeResponse)
  //     .connectUrl;
  // }

  if (!channel) {
    return notFound();
  }

  return (
    <PageLayout title={channel?.username}>
      {user.creatorStripeAccountStatus !== StConnectStatus.Connected && (
        <div className="flex gap-2">
          <p>Connect your Stripe account to enable payments</p>
          <Button href={`/app/connect`} variant="secondary">
            Enable
          </Button>
        </div>
      )}

      <Channel channel={channel} />
    </PageLayout>
  );
}
