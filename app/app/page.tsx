import { auth } from "../api/auth/[...nextauth]/auth";
import ContentLayout from "../components/ContentLayout";
import { StPage, StConnectStatus, StUser } from "../model/types";
import Pages from "./Pages";
import Button from "../components/Button";
import { fetchRevenueData } from "./fetchRevenueData";
import { getFakeRevenueData } from "./fakeRevenueData";
import { isProd } from "./utils";

export default async function Page() {
  const session = await auth();

  const pagesRes = await fetch(`${process.env.API_ENDPOINT}/pages`, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      ContentType: "application/json",
    },
    cache: "no-cache",
  });
  const pages: StPage[] = await pagesRes.json();

  console.log(pages);

  const userRes = await fetch(`${process.env.API_ENDPOINT}/user`, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      ContentType: "application/json",
    },
  });
  const user = (await userRes.json()) as StUser;

  let revenueData;

  if (isProd() && user.creatorStripeAccountId) {
    revenueData = await fetchRevenueData(user.creatorStripeAccountId);
  } else {
    revenueData = getFakeRevenueData();
  }

  return (
    <ContentLayout title="Dashboard">
      {isProd() &&
        user.creatorStripeAccountStatus !== StConnectStatus.Connected && (
          <div className="flex gap-2 text-gray-800 mb-4">
            <p>
              Connect your Stripe account to receive instant payments from
              subscribers
            </p>
            <Button href={`/app/connect`} variant="secondary">
              Connect
            </Button>
          </div>
        )}
      <Pages
        chartData={revenueData?.chart}
        pages={pages}
        totalRevenue={revenueData?.total}
      />
    </ContentLayout>
  );
}
