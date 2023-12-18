import PageLayout from "@/app/components/PageLayout";
import React from "react";
import { StChannel } from "@/app/model/types";
import Channel from "../[id]/Channel";
import { nanoid } from "nanoid";

type PpParams = {
  searchParams: { username: string };
};

export default async function Page({ searchParams }: PpParams) {
  const channel: Partial<StChannel> = {
    id: nanoid(10),
    username: searchParams.username,
    telegramLinkCode: `LINK-${nanoid(4)}`,
  };

  return (
    <PageLayout title="Add Page">
      <Channel newChannel channel={channel} />
    </PageLayout>
  );
}
