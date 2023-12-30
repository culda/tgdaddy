import React, { useState, useMemo } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import Button from '../components/Button';
import {
  StConsumerSubscription,
  StPagePrice,
  StPriceFrequency,
} from '../model/types';

const PricingSection = ({
  prices,
  join,
}: {
  prices: StPagePrice[];
  join: (priceId: string) => void;
}) => {
  const [selectedFrequency, setSelectedFrequency] = useState<StPriceFrequency>(
    prices[0].frequency
  );

  const handleFrequencyChange = (frequency: StPriceFrequency) => {
    setSelectedFrequency(frequency);
  };

  const selectedPrice = useMemo(
    () => prices?.find((p) => p.frequency === selectedFrequency) as StPagePrice,
    [prices, selectedFrequency]
  );

  return (
    <section className="text-gray-600 body-font overflow-hidden mt-10">
      <div className="flex flex-col text-center w-full ">
        <h1 className="sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900">
          Choose a membership plan
        </h1>
        <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-gray-500">
          Instantly gain access to ALL products on this page. Cancel anytime.
        </p>

        <div className="flex flex-row gap-2 mx-auto mt-6">
          <Button
            variant="secondary"
            active={selectedFrequency === StPriceFrequency.Monthly}
            onClick={() => handleFrequencyChange(StPriceFrequency.Monthly)}
          >
            Monthly
          </Button>
          <Button
            variant="secondary"
            active={selectedFrequency === StPriceFrequency.Yearly}
            onClick={() => handleFrequencyChange(StPriceFrequency.Yearly)}
          >
            Yearly
          </Button>
        </div>
      </div>

      <div className="container px-5 py-8 mx-auto">
        <div className="flex justify-center items-center -m-2 gap-2">
          <div key={selectedPrice.id} className="">
            <div className="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden">
              <span className="text-sm tracking-widest title-font mb-1 font-medium">
                {selectedFrequency}
              </span>
              <header className="text-3xl text-gray-900 pb-4 mb-4 border-b border-gray-200 leading-none">
                ${(selectedPrice.usd / 100).toFixed(2)}
              </header>
              <p className="flex items-center text-gray-600 mb-2">
                <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                  <FaCheckCircle />
                </span>
                Instant Access.
              </p>
              <p className="flex items-center text-gray-600 mb-2">
                <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                  <FaCheckCircle />
                </span>
                Cancel anytime.
              </p>
              <Button onClick={() => join(selectedPrice.id)}>Join Now</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;