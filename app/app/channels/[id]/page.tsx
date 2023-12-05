import { auth } from "@/app/api/auth/[...nextauth]/route";
import Channel from "@/app/components/Channel";
import { StChannel } from "@/app/model/types";

type PpChannel = {
  params: { id: string };
};

export default async function Page({ params }: PpChannel) {
  const session = await auth();

  const res = await fetch(
    `${process.env.API_ENDPOINT}/channels?id=${params.id}`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }
  );
  const data = await res.json();
  const channel: StChannel = data.data;

  return <Channel channel={channel} />;
}
