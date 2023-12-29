import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { StTelegramProduct } from '@/app/model/types';
import { nanoid } from 'nanoid';
import { redirect } from 'next/navigation';
import Telegram from '../TelegramProduct';
import ContentLayout from '@/app/components/ContentLayout';

const Page = async ({ params }: { params: { id: string } }) => {
  const session = await auth();

  const code = `LINK-${nanoid(4)}`;
  const product: StTelegramProduct = {
    id: nanoid(10),
    pageId: params.id,
    type: 'channel',
    productType: 'telegramAccess',
    title: '',
    description: '',
    activationCode: code,
    active: false,
  };

  const codeRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/telegramCode`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
      },
      body: JSON.stringify({
        code,
        pageId: params.id,
        productId: product.id,
      }),
    }
  );

  if (!codeRes.ok) {
    return redirect(`/app/pages/${params.id}`);
  }

  return (
    <ContentLayout title="Add Telegram">
      <Telegram edit isNew product={product} />;
    </ContentLayout>
  );
};

export default Page;
