import ContentLayout from '@/app/components/ContentLayout';
import { StPage, StPriceFrequency } from '@/app/model/types';
import { nanoid } from 'nanoid';
import PageScene from '../PageScene';
import { auth } from '@/app/api/auth/[...nextauth]/auth';

type PpParams = {
  searchParams: { username?: string };
};

export default async function Page({ searchParams }: PpParams) {
  const session = await auth();
  const page: StPage = {
    id: nanoid(10),
    username: searchParams.username?.toLowerCase() ?? '',
    userId: session?.user.id as string,
    prices: [
      {
        id: nanoid(10),
        usd: 0,
        frequency: StPriceFrequency.Month,
      },
    ],
  };

  return (
    <ContentLayout title="Add Page">
      <PageScene products={[]} edit isNew page={page} />
    </ContentLayout>
  );
}
