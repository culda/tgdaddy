import Channels from "./Channels";
import { auth } from "../../api/auth/[...nextauth]/route";
import { StChannel } from "../../model/types";
import PageLayout from "../../components/PageLayout";

export default async function Page() {
  const session = await auth();
  const res = await fetch(`${process.env.API_ENDPOINT}/channels`, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      ContentType: "application/json",
    },
  });
  const data = await res.json();
  const channels: StChannel[] = data.data;

  return (
    <PageLayout title="Channels">
      <Channels channels={channels} />
    </PageLayout>
  );
}
