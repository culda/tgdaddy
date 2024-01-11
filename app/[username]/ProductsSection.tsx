import React, { useState } from 'react';
import { FaLock, FaArrowRight } from 'react-icons/fa';
import FormattedText from '../components/FormattedText';
import Button from '../components/Button';
import { StProduct } from '../model/types';

type PpProductsSection = {
  products: StProduct[];
  sub: boolean;
  goToChannel: (id: string) => void;
};

type PpProduct = {
  product: StProduct;
  sub: boolean;
  goToChannel: (id: string) => void;
};

const ProductsSection: React.FC<PpProductsSection> = ({
  goToChannel,
  products,
  sub,
}) => {
  return (
    <section>
      <div className="p-4">
        {products?.map((product, index) => (
          <Product
            key={index}
            product={product}
            sub={sub}
            goToChannel={goToChannel}
          />
        ))}
      </div>
    </section>
  );
};

const Product: React.FC<PpProduct> = ({ product, sub, goToChannel }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="bg-neutral-50 cursor-pointer rounded-md flex flex-row gap-2 justify-between items-center p-4 shadow-xl relative" // Add 'relative' class
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <img src="/images/telegram-logo.svg" className="w-8 h-8" />
          <h2 className="text-xl font-bold">{product.title}</h2>
        </div>

        <div className={`${isOpen ? '' : 'hidden'}`}>
          <p className={`text-gray-600`}>
            <FormattedText text={product.description} />
          </p>
        </div>
      </div>
      {!sub ? (
        <FaLock className="text-2xl" />
      ) : (
        <Button className="max-w-20" onClick={() => goToChannel(product.id)}>
          <FaArrowRight />
        </Button>
      )}
    </div>
  );
};

export default ProductsSection;
