import PageLayout from "@/app/components/PageLayout";
import { StChannel, StUser } from "../../../model/types";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import Channel from "./Channel";
import { notFound } from "next/navigation";
import Button from "@/app/components/Button";

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

  if (!channel) {
    return notFound();
  }

  return (
    <PageLayout title={channel?.username}>
      {!user.creatorStripeAccountId && (
        <div class="flex gap-2">
          <p>Connect your Stripe account to enable payments</p>
          <Button
            href={`/app/connect?redirectUrl=${encodeURIComponent(
              `/app/channels/${channel.id}`
            )}`}
            variant="secondary"
          >
            Enable
          </Button>
        </div>
      )}

      <Channel channel={channel} />
    </PageLayout>
  );
}
