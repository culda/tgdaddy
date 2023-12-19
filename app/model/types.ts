import Stripe from "stripe";

export type StChat = {
  id: number;
  type: "link";
};

export type StLinkChat = {
  id: number;
  type: "link";
};

export type StChannel = {
  id: string;
  channelId?: string;
  userId: string;
  imagePath?: string;
  telegramLinkCode?: string;
  title?: string;
  username: string;
  description?: string;
  pricing?: StChannelPrice[];
};

export type StInviteLink = {
  id: string; // userId/channelId
  userId: string;
  channelId: string;
  link: string;
};

export type StChannelPrice = {
  id: string;
  usd: number; // Price in USD cents
  frequency: StPriceFrequency;
};

export enum StPriceFrequency {
  OneOff = "oneoff",
  Monthly = "monthly",
  Yearly = "yearly",
}

export type StUser = {
  id: string;
  telegramId?: string;
  email?: string;
  platformLogin?: boolean;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  creatorPlan: StPlan;
  creatorStripeAccountStatus: StConnectStatus;
  creatorStripeSubscriptionId?: string;
  creatorStripeAccountId?: string;
  creatorStripeCustomerId?: string;
  consumerStripeCustomerId?: string;
};

export type StUserCredentials = {
  email: string;
  password: string;
  resetCode?: string;
  resetCodeExpiry?: number;
  id: string;
};

export type StConsumerSubscription = {
  id: string; // userId/channelId
  consumerStripeCustomerId: string;
  consumerStripeSubscriptionId: string;
};

export enum StConnectStatus {
  Connected = "connected",
  Pending = "pending",
  NotStarted = "notStarted",
}

export enum StPlan {
  Starter = "Starter",
  Growth = "Growth",
  Pro = "Pro",
  Business = "Business",
}

export type StTelegramLinkCodes = {
  code: string;
  channelId: string;
};

export const frequencyToInterval = (
  frequency: StPriceFrequency
): Stripe.PriceCreateParams.Recurring.Interval => {
  switch (frequency) {
    case StPriceFrequency.Monthly:
      return "month";
    case StPriceFrequency.Yearly:
      return "year";
    default:
      throw new Error("Invalid frequency");
  }
};
