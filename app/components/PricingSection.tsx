import Button from './Button';
import PricingCheckpoint from './PricingCheckpoint';

const PricingSection = ({ getStarted }: { getStarted: () => void }) => {
  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h1 className="sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900">
            Pricing
          </h1>
          <p className="md:w-2/3 mx-auto leading-relaxed text-base text-gray-600">
            The best pricing for you depends on the number of monthly
            subscribers. Don't worry, you can change it later. 100% moneyback
            guarantee
          </p>
        </div>
        <div className="flex flex-wrap -m-4">
          <div className="p-4 xl:w-1/4 md:w-1/2 w-full ">
            <div className="h-full shadow-xl p-6 rounded-lg flex flex-col relative overflow-hidden">
              <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                Starter
              </h2>
              <h1 className="text-5xl text-gray-900 pb-4 mb-4 border-b border-gray-200 leading-none">
                Free
              </h1>
              <PricingCheckpoint text="12% transaction fee" />
              <PricingCheckpoint text="Unlimited subscribers" />

              <Button className="flex-grow-0" onClick={getStarted}>
                Get started
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="w-4 h-4 ml-auto"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </Button>
              <p className="text-xs text-gray-500 mt-3"></p>
            </div>
          </div>
          <div className="p-4 xl:w-1/4 md:w-1/2 w-full">
            <div className="h-full shadow-xl p-6 rounded-lg flex flex-col relative overflow-hidden">
              <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                Growth
              </h2>
              <h1 className="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                <span>$49</span>
                <span className="text-lg ml-1 font-normal text-gray-500">
                  /mo
                </span>
              </h1>
              <PricingCheckpoint text="8% transaction fee" />
              <PricingCheckpoint text="Unlimited subscribers" />
              <PricingCheckpoint text="Best for $500+/mo pages" />
              <Button className="flex-grow-0" onClick={getStarted}>
                Get started
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="w-4 h-4 ml-auto"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </Button>
              <p className="text-xs text-gray-500 mt-3"></p>
            </div>
          </div>
          <div className="p-4 xl:w-1/4 md:w-1/2 w-full ">
            <div className="h-full shadow-xl p-6 rounded-lg border-2 border-blue-500 flex flex-col relative overflow-hidden">
              <span className="bg-blue-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl">
                POPULAR
              </span>
              <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                Pro
              </h2>
              <h1 className="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                <span>$99</span>
                <span className="text-lg ml-1 font-normal text-gray-500">
                  /mo
                </span>
              </h1>
              <PricingCheckpoint text="5% transaction fee" />
              <PricingCheckpoint text="Best for $1000+/mo pages" />
              <PricingCheckpoint text="Unlimited subscribers" />

              <Button className="flex-grow-0" onClick={getStarted}>
                Get started
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="w-4 h-4 ml-auto"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </Button>
              <p className="text-xs text-gray-500 mt-3"></p>
            </div>
          </div>
          <div className="p-4 xl:w-1/4 md:w-1/2 w-full ">
            <div className="h-full shadow-xl p-6 rounded-lg flex flex-col relative overflow-hidden">
              <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                Business
              </h2>
              <h1 className="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                <span>$199</span>
                <span className="text-lg ml-1 font-normal text-gray-500">
                  /mo
                </span>
              </h1>
              <PricingCheckpoint text="1% transaction fee" />
              <PricingCheckpoint text="Best for $2000+/mo pages" />
              <PricingCheckpoint text="Unlimited subscribers" />
              <Button className="flex-grow-0" onClick={getStarted}>
                Get started
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="w-4 h-4 ml-auto"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </Button>
              <p className="text-xs text-gray-500 mt-3"></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
