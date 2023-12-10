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
    const user = await userRes.json();
    return user.data as StUser;
  };

  const user = await fetchUser();

  return (
    <PageLayout subtitle={"Change anytime"} title={"Membership plan"}>
      <Plans user={user} />
    </PageLayout>
  );
}
