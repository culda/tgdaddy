import { StPriceFrequency } from "@/app/model/types";
import Stripe from "stripe";

export const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const frequencyToInterval = (
  frequency: StPriceFrequency
): Stripe.PriceCreateParams.Recurring.Interval => {
  switch (frequency) {
    case StPriceFrequency.Monthly:
      return "month";
    case StPriceFrequency.Yearly:
      return "year";
  }
};
