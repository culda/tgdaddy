export type StChat = {
  id: number;
  type: "link";
};

export type StLinkChat = {
  id: number;
  type: "link";
};

export type StChannel = {
  id: string; // ChannelId/UserId
  userId: string;
  imageUrl?: string;
  title?: string;
  username?: string;
  description?: string;
  pricing?: StChannelPrice[];
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
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  plan: StPlan;
  stripeSubscriptionId?: string;
  stripeAccountId?: string;
  stripeAccountStatus?: StConnectStatus;
  stripeCustomerId?: string;
};

export type StPage = {
  username: string;
  stripeAccountId: string;
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
