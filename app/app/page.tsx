import { auth } from "../api/auth/[...nextauth]/auth";
import PageLayout from "../components/PageLayout";
import { StChannel } from "../model/types";
import Channels from "./Channels";

export default async function Page() {
  const session = await auth();

  const res = await fetch(`${process.env.API_ENDPOINT}/channels`, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      ContentType: "application/json",
    },
  });

  const channels: StChannel[] = await res.json();

  return (
    <PageLayout title="Channels">
      <Channels channels={channels} />
    </PageLayout>
  );
}
