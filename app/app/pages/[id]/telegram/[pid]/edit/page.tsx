import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { StPage, StProduct, StTelegramProduct } from '@/app/model/types';
import TelegramProduct from '../../TelegramProduct';
import ContentLayout from '@/app/components/ContentLayout';

const Page = async ({ params }: { params: { id: string; pid: string } }) => {
  const session = await auth();

  const fetchProducts = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/products?pageId=${params.id}`,
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

  const products = await fetchProducts();
  const product = products.find(
    (p) => p.id === params.pid
  ) as StTelegramProduct;

  return (
    <ContentLayout title="Edit">
      <TelegramProduct edit product={product} />
    </ContentLayout>
  );
};

export default Page;
