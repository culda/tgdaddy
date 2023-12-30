import { TpGetSubscriptionRequest } from '@/functions/subscriptions/handler';
import { notFound } from 'next/navigation';
import { isProd } from '../../utils';
import { auth } from '../api/auth/[...nextauth]/auth';
import AccountWidget from '../components/AccountWidget';
import Button from '../components/Button';
import { StConsumerSubscription, StPage, StProduct } from '../model/types';
import PagePublic from './PagePublic';

type PpPage = {
  params: { username: string };
  searchParams: { sub?: string };
};

export default async function Page({ params, searchParams }: PpPage) {
  const session = await auth();

  const fetchPage = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/pages/${params.username}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      }
    );

    if (!res.ok) {
      return undefined;
    }

    return (await res.json()) as StPage;
  };

  const fetchSubscription = async (username: string) => {
    const res = await fetch(`${process.env.API_ENDPOINT}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
      },
      cache: 'no-cache',
      body: JSON.stringify({
        username,
      } as TpGetSubscriptionRequest),
    });

    const data = await res.json();

    if (
      !res.ok ||
      (Object.keys(data).length === 0 && data.constructor === Object)
    ) {
      return undefined;
    }

    return data as StConsumerSubscription;
  };

  const fetchProducts = async (pageId: string) => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/products?pageId=${pageId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          ContentType: 'application/json',
        },
        cache: 'no-cache',
      }
    );
    return (await res.json()) as StProduct[];
  };

  const page = await fetchPage();

  if (!page) {
    return notFound();
  }

  const products = await fetchProducts(page.id);

  let sub;

  // Fetch subscription and access links if logged in
  if (session?.accessToken) {
    if (isProd()) {
      sub = await fetchSubscription(page.username as string);
    } else if (searchParams.sub) {
      sub = {
        id: '1234',
        consumerStripeCustomerId: '1234',
        consumerStripeSubscriptionId: '1234',
      };
    }
  }

  const myPage = page.userId === session?.user?.id;

  return (
    <div className="relative max-w-md flex mx-auto">
      <div className="absolute top-0 right-0 p-2 flex flex-row gap-2">
        {myPage && (
          <Button variant="secondary" href={`/app/pages/${page.id}`}>
            {' '}
            Manage{' '}
          </Button>
        )}
        <AccountWidget platformLogin={false} />
      </div>
      <div className="mt-8">
        <PagePublic products={products} page={page} sub={sub} />
      </div>
    </div>
  );
}
