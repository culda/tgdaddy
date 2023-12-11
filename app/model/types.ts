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
  channelId: string;
  userId: string;
  imagePath?: string;
  telegramLinkCode?: string;
  title?: string;
  username?: string;
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
  Monthly = "monthly",
  Yearly = "yearly",
}

export type StUserAuth = Pick<
  StUser,
  "id" | "username" | "firstName" | "lastName"
>;

export type StUser = {
  id: string;
  platformLogin?: boolean;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  creatorPlan: StPlan;
  creatorStripeSubscriptionId?: string;
  creatorStripeAccountId?: string;
  creatorStripeCustomerId?: string;
  consumerStripeCustomerId?: string;
};

export type StConsumerSubscription = {
  id: string; // userId/channelId
  consumerStripeCustomerId: string;
  consumerStripeSubscriptionId: string;
};

export enum StConnectStatus {
  Connected = "connected",
  Pending = "pending",
}

export enum StPlan {
  Starter = "Starter",
  Growth = "Growth",
  Pro = "Pro",
  Business = "Business",
}
