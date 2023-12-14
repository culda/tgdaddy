import { StUser } from "../../model/types";
import PageLayout from "../../components/PageLayout";
import Plans from "@/app/app/plan/Plans";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

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

  const user = await fetchUser();

  return (
    <PageLayout subtitle={"Change anytime"} title={"Membership plan"}>
      <Plans user={user} />
    </PageLayout>
  );
}
