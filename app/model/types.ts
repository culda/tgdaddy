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
  userId: number;
  title?: string;
};

export type StUser = {
  id: number;
  stripeAccountId?: string;
  channels?: StChannel[];
};
