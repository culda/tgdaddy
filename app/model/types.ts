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

export type StUser = {
  id: number;
  stripeAccountId?: string;
  channels?: StChannel[];
};
