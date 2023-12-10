import PageLayout from "@/app/components/PageLayout";
import { StChannel } from "../../../model/types";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import Channel from "./Channel";
import { notFound } from "next/navigation";

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
      }
    );
    const channel = await res.json();
    return channel.data as StChannel;
  };

  const channel = await fetchChannel();

  if (!channel) {
    return notFound();
  }

  return (
    <PageLayout title={channel?.title}>
      <Channel channel={channel} />
    </PageLayout>
  );
}
