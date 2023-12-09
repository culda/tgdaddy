import { StChannel } from "../model/types";
import ChannelPublic from "../components/ChannelPublic";
import ConnectTelegram from "../components/ConnectTelegram";

type PpChannel = {
  params: { username: string };
};

export default async function Page({ params }: PpChannel) {
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

  const channel = await fetchChannel();
  console.log(channel);

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 pt-4 pr-4">
        <ConnectTelegram />
      </div>
      <ChannelPublic channel={channel} />
    </div>
  );
}
