const plans = [
  {
    name: "Starter",
    fee: "18%",
  },
  {
    name: "Growth",
    fee: "8%",
    price: "$49 / mo",
  },
  {
    name: "Pro",
    fee: "5%",
    price: "$99 / mo",
    recommended: true,
  },
  {
    name: "Business",
    fee: "1%",
    price: "$199 / mo",
  },
];

export default function Plans() {
  return (
    <div className="bg-white flex flex-col py-12 max-w-md">
      <header className="text-black text-4xl font-extrabold whitespace-nowrap ml-9 mt-4 self-start max-md:ml-2.5">
        Pro plan
      </header>
      <hr className="bg-neutral-200 self-stretch min-h-[1px] w-full mt-6" />
      {plans.map((plan, index) => (
        <form
          key={index}
          className="flex justify-between items-center self-center w-full gap-5 mt-7 px-2 py-2.5"
        >
          <div className="flex grow basis-[0%] flex-col px-5 py-0.5">
            <header className="text-black text-xl font-semibold whitespace-nowrap">
              {plan.name}
            </header>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              {plan.fee && (
                <div className="text-black text-xs justify-center items-stretch bg-orange-200 mt-1 px-2 py-2.5 max-md:pr-5">
                  {plan.fee} fee*
                </div>
              )}
              {plan.price && (
                <div className="text-black text-xs justify-center items-stretch bg-orange-200 mt-1 px-2 py-2.5 max-md:pr-5">
                  {plan.price}
                </div>
              )}
              {plan.recommended && (
                <div className="text-black text-xs justify-center items-stretch bg-cyan-200 mt-1 py-2.5 px-2">
                  Recommended
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end flex-none w-8 h-8">
            <input
              type="radio"
              name="plan"
              value={plan.name}
              className="w-6 h-6 my-auto rounded-full border-gray-400 border-2 checked:bg-blue-500"
            />
          </div>
        </form>
      ))}
      <hr className="bg-neutral-200 self-stretch min-h-[1px] w-full mt-9" />
      <div className="text-black text-xs italic font-light max-w-[316px] ml-8 mt-9 mb-24 self-start max-md:ml-2.5 max-md:mb-10">
        *the transaction fee is incurred whenever a user subscribes to your
        channel
      </div>
    </div>
  );
}
