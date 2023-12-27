import Stripe from "stripe";

export type StPage = {
  id: string;
  userId: string;
  imagePath?: string;
  products: StProduct[];
  channelId?: string;
  telegramLinkCode?: string;
  title?: string;
  username: string;
  description?: string;
  pricing?: StPagePrice[];
};

export type StInviteLink = {
  id: string; // userId/channelId
  userId: string;
  channelId: string;
  link: string;
};

export type StPagePrice = {
  id: string;
  usd: number; // Price in USD cents
  oldUsd?: number; // Strikethrough price for promo
  frequency: StPriceFrequency;
};

export enum StPriceFrequency {
  OneOff = "oneoff",
  Monthly = "monthly",
  Yearly = "yearly",
}

export type StUser = {
  id: string;
  createdAt: string;
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

export type StProductType = "telegramAccess";

export type StProduct = {
  type: StProductType;
  title: string;
  description: string;
  inviteLink: string;
  active: boolean;
  activationCode: string;
};

export type StUserCredentials = {
  email: string;
  password: string;
  resetCode?: string;
  resetCodeExpiry?: number;
  id: string;
};

export type StConsumerSubscription = {
  id: string; // userId/pageId
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
