import { isProd } from '../../utils';
import { auth } from '../api/auth/[...nextauth]/auth';
import Button from '../components/Button';
import ContentLayout from '../components/ContentLayout';
import { StConnectStatus, StPage, StUser } from '../model/types';
import Pages from './Pages';
import { getFakeRevenueData } from './fakeRevenueData';
import { fetchStripeData } from './fetchRevenueData';

export default async function Page() {
  const session = await auth();

  const pagesRes = await fetch(`${process.env.API_ENDPOINT}/pages`, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      ContentType: 'application/json',
    },
    cache: 'no-cache',
  });
  const pages: StPage[] = await pagesRes.json();

  const userRes = await fetch(`${process.env.API_ENDPOINT}/user`, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      ContentType: 'application/json',
    },
  });
  const user = (await userRes.json()) as StUser;

  let stripeData;

  if (isProd() && user.creatorStripeAccountId) {
    stripeData = await fetchStripeData(user.creatorStripeAccountId);
  } else if (!isProd()) {
    stripeData = getFakeRevenueData();
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
        chartData={stripeData?.chart}
        pages={pages}
        totalRevenue={stripeData?.total}
        members={stripeData?.members}
      />
    </ContentLayout>
  );
}
