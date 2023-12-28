import { StTelegramProduct } from '@/app/model/types';
import { nanoid } from 'nanoid';
import Product from '../Telegram';

const Page = () => {
  const product: StTelegramProduct = {
    id: nanoid(10),
    type: 'channel',
    productType: 'telegramAccess',
    title: '',
    description: '',
    activationCode: `LINK-${nanoid(4)}`,
    active: false,
  };
  return <Product edit product={product} />;
};

export default Page;
