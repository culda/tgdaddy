import { StUser } from "../../model/types";
import PageLayout from "../../components/PageLayout";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import Plans from "@/app/app/plan/Plans";

export default async function Page() {
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

  if (!session?.accessToken) {
    return (
      <PageLayout title="Sign in">
        <h2>Please login before accessing this page</h2>
      </PageLayout>
    );
  }

  const user = await fetchUser();

  return (
    <PageLayout subtitle={"Change anytime"} title={"Membership plan"}>
      <Plans user={user} />
    </PageLayout>
  );
}
