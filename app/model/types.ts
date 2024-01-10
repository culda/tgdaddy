import Stripe from 'stripe';

export type StPage = {
  id: string;
  userId: string;
  imagePath?: string;
  channelId?: string;
  title?: string;
  username: string;
  description?: string;
  prices: StPagePrice[];
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
  Once = 'Once',
  Week = 'Week',
  Month = 'Month',
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

export type StProductType = 'telegramAccess';

export type StProduct = {
  id: string;
  pageId: string;
  productType: StProductType;
  title: string;
  description: string;
  active: boolean;
};

export type StTelegramProduct = StProduct & {
  productType: 'telegramAccess';
  type: 'channel' | 'group';
  accessLink?: string;
  activationCode: string;
  channelId?: string;
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
  Connected = 'connected',
  Pending = 'pending',
  NotStarted = 'notStarted',
}

export enum StPlan {
  Starter = 'Starter',
  Growth = 'Growth',
  Pro = 'Pro',
  Business = 'Business',
}

export type StTelegramLinkCode = {
  code: string;
  productId: string;
  pageId: string;
  channelId?: string;
};
