import { StProduct } from '@/app/model/types';
import { nanoid } from 'nanoid';
import Product from '../Telegram';

export default function Page() {
  const product: StProduct = {
    id: nanoid(10),
    type: 'telegramAccess',
    title: '',
    description: '',
    activationCode: `LINK-${nanoid(4)}`,
    active: false,
  };
  return <Product edit product={product} />;
}
