import ContentLayout from '@/app/components/ContentLayout';
import React from 'react';
import { StPage } from '@/app/model/types';
import PageScene from '../../PageScene';
import { auth } from '@/app/api/auth/[...nextauth]/auth';

type PpParams = {
  params: { id: string };
};

export default async function Page({ params }: PpParams) {
  const session = await auth();
  const fetchPage = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/pages?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          ContentType: 'application/json',
        },
        cache: 'no-cache',
      }
    );
    return (await res.json()) as StPage;
  };

  const page = await fetchPage();
  return (
    <ContentLayout title="Edit Page">
      <PageScene edit page={page} products={[]} />
    </ContentLayout>
  );
}
