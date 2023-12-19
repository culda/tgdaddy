import PageLayout from "@/app/components/PageLayout";
import { StChannel } from "../../../model/types";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import Channel from "../Channel";
import { notFound } from "next/navigation";
import Button from "@/app/components/Button";

type PpChannel = {
  params: { id: string };
};

export default async function Page({ params }: PpChannel) {
  const session = await auth();

  const fetchChannel = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/channels?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          ContentType: "application/json",
        },
        cache: "no-cache",
      }
    );
    return (await res.json()) as StChannel;
  };

  const channel = await fetchChannel();

  if (!channel) {
    return notFound();
  }

  return (
    <PageLayout title={channel?.username}>
      <div className="flex flex-row gap-2">
        <Button href={`/app/channels/${channel.id}/edit`} variant="secondary">
          Edit Details
        </Button>
        {/* <Button href={`/app/channels/${channel.id}/edit`} variant="secondary">
          Edit Details
        </Button> */}
      </div>

      <Channel channel={channel} />
    </PageLayout>
  );
}
