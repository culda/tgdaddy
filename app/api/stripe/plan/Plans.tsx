"use client";
import { StPlan, StUser } from "../../../model/types";
import { useState } from "react";
import { TpPlanRequest } from "./route";
import Button from "../../../components/Button";

const plans = [
  {
    name: StPlan.Starter,
    fee: "18%",
  },
  {
    name: StPlan.Growth,
    fee: "8%",
    price: "$49 / mo",
  },
  {
    name: StPlan.Pro,
    fee: "5%",
    price: "$99 / mo",
    recommended: true,
  },
  {
    name: StPlan.Business,
    fee: "1%",
    price: "$199 / mo",
  },
];

type PpPlans = {
  user: StUser;
};

export default function Plans({ user }: PpPlans) {
  const [us, setUs] = useState(user);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanChange = async (plan: StPlan) => {
    setIsLoading(true);

    const res = await fetch("/api/stripe/plan", {
      method: "POST",
      body: JSON.stringify({
        user,
        plan,
      } as TpPlanRequest),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }

    if (res.status === 200) {
      setUs({ ...us, plan });
    }

    setIsLoading(false);
  };

  const connectStripe = async () => {
    setIsLoading(true);

    await fetch("/api/stripe/connect", {
      method: "POST",
      body: JSON.stringify({ user }),
    });

    setIsLoading(false);
  };

  if (!!user && user?.stripeAccountStatus !== "connected") {
    return (
      <div>
        <Button loading={isLoading} onClick={connectStripe}>
          Connect Stripe
        </Button>
      </div>
    );
  }

  return (
    <div>
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
                <div className="text-black text-xs justify-center items-stretch bg-indigo-200 mt-1 py-2.5 px-2">
                  Recommended
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end flex-none w-8 h-8 items-center">
            <div className="flex items-center justify-center">
              {us ? (
                <input
                  type="radio"
                  name="plan"
                  value={plan.name}
                  checked={us?.plan === plan.name}
                  onChange={() => handlePlanChange(plan.name)}
                  disabled={isLoading}
                  hidden={isLoading}
                  className={`radio-button ${
                    !isLoading && "checked:bg-indigo-500"
                  }`}
                />
              ) : (
                // If the user object is null, show the skeleton
                <div className="skeleton-radio-button animate-pulse"></div>
              )}
              {isLoading && <div className="loader"></div>}
            </div>
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
