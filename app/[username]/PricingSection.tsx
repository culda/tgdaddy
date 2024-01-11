import React, { useState, useMemo } from 'react';
import Button from '../components/Button';
import { StPagePrice, StPriceFrequency } from '../model/types';

const PricingSection = ({
  prices,
  join,
}: {
  prices: StPagePrice[];
  join: (priceId: string) => void;
}) => {
  const [selectedPrice, setSelectedPrice] = useState<StPagePrice>(prices[0]);

  const oncePrice = useMemo(
    () => prices?.find((p) => p.frequency === StPriceFrequency.Once),
    [prices]
  );

  const monthPrice = useMemo(
    () => prices?.find((p) => p.frequency === StPriceFrequency.Month),
    [prices]
  );

  const weekPrice = useMemo(
    () => prices?.find((p) => p.frequency === StPriceFrequency.Week),
    [prices]
  );

  return (
    <section id="pricing" className="text-gray-600 body-font overflow-hidden">
      <div className="container px-5 py-8 mx-auto ">
        <div className="flex flex-col text-center w-full ">
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-gray-500">
            Instantly become a member and gain access to the community.
          </p>

          <div className="flex flex-row gap-2 mx-auto mt-6">
            {oncePrice && (
              <PriceButton
                header={'One Off'}
                price={oncePrice}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />
            )}
            {weekPrice && (
              <PriceButton
                header={'Weekly'}
                price={weekPrice}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />
            )}
            {monthPrice && (
              <PriceButton
                header={'Monthly'}
                price={monthPrice}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />
            )}
          </div>
        </div>
        <div className="flex justify-center items-center -m-2 gap-2">
          <div className="h-full p-6 rounded-lg  flex flex-col relative overflow-hidden">
            <Button onClick={() => join(selectedPrice.id)}>
              Get Instant Access
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const PriceButton = ({
  header,
  price,
  selectedPrice,
  setSelectedPrice,
}: {
  header: string;
  price: StPagePrice;
  selectedPrice: StPagePrice;
  setSelectedPrice: (price: StPagePrice) => void;
}) => {
  let className =
    'flex flex-col cursor-pointer gap-2 justify-center items-center rounded-md p-4 ';

  if (selectedPrice.frequency === price.frequency) {
    className += ' outline outline-2 outline-blue-500';
  }

  return (
    <div className={className} onClick={() => setSelectedPrice(price)}>
      <h3 className="font-bold">{header}</h3>
      <div className="flex flex-col justify-between gap-2 flex-wrap max-w-sm">
        <span>$ {(price.usd / 100).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PricingSection;
