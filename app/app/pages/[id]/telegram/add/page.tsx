import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { StTelegramProduct } from '@/app/model/types';
import { nanoid } from 'nanoid';
import { redirect } from 'next/navigation';
import Product from '../Telegram';

const Page = async ({ params }: { params: { id: string } }) => {
  const session = await auth();

  const code = `LINK-${nanoid(4)}`;
  const product: StTelegramProduct = {
    id: nanoid(10),
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
    console.log(codeRes);
    return redirect(`/app/pages/${params.id}`);
  }

  return <Product edit product={product} />;
};

export default Page;
