import { StUser } from "../../model/types";
import PageLayout from "../../components/PageLayout";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import Plans from "@/app/api/stripe/plan/Plans";

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

  // useEffect(() => {
  //   if (!session.data?.accessToken) return;
  //   let isMounted = true;
  //   const interval = setInterval(async () => {
  //     if (isMounted) {
  //       const user = await fetchUser();
  //       setUser(user);
  //     }
  //   }, 3000);

  //   return () => {
  //     isMounted = false;
  //     clearInterval(interval);
  //   };
  // }, [session.data?.accessToken]);

  // const handlePlanChange = async (plan: StPlan) => {
  //   setIsLoading(true);

  //   const planRes = await fetch("/api/stripe/plan", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       user,
  //       plan,
  //     } as TpPlanRequest),
  //   });
  //   const { paymentLink } = (await planRes.json()) as TpPlanResponse;

  //   window.location.href = paymentLink.url;
  // };

  // const connectStripe = async () => {
  //   const connectRes = await fetch(
  //     `${process.env.NEXT_PUBLIC_HOST}/api/stripe/connect`,
  //     {
  //       method: "POST",
  //       body: JSON.stringify({ user }),
  //     }
  //   );

  //   const { accountId, connectUrl } =
  //     (await connectRes.json()) as TpConnectStripeResponse;

  //   /**
  //    * Persist account and redirect to account setup
  //    */
  //   await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/user`, {
  //     method: "POST",
  //     body: JSON.stringify({
  //       stripeAccountId: accountId,
  //       stripeAccountStatus: StConnectStatus.Pending,
  //     } as StUser),
  //     headers: {
  //       Authorization: `Bearer ${session.data?.accessToken}`,
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   setIsLoading(false);
  //   window.location.href = connectUrl;
  // };

  return (
    <PageLayout subtitle={"Change anytime"} title={"Membership plan"}>
      <Plans user={user} />
    </PageLayout>
  );
}
