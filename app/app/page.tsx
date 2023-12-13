import { auth } from "../api/auth/[...nextauth]/route";
import PageLayout from "../components/PageLayout";
import { StChannel } from "../model/types";
import Channels from "./Channels";

export default async function Page() {
  const session = await auth();

  if (!session?.accessToken) {
    return (
      <PageLayout title="Sign in">
        <h2>Please login before accessing this page</h2>
      </PageLayout>
    );
  }

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
