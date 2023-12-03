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
  userId: number;
  imageUrl?: string;
  title?: string;
  username?: string;
  joinFee?: string;
};

export type StUserAuth = Pick<
  StUser,
  "id" | "username" | "firstName" | "lastName"
>;

export type StUser = {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  plan: StPlan;
  stripeAccountId?: string;
  channels?: StChannel[];
};

export enum StPlan {
  Starter = "Starter",
  Growth = "Growth",
  Pro = "Pro",
  Business = "Business",
}
