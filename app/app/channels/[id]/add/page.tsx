import PageLayout from "@/app/components/PageLayout";
import React from "react";
import { StChannel } from "@/app/model/types";
import Channel from "../Channel";
import { nanoid } from "nanoid";

type PpParams = {
  params: { id: string };
};

export default async function Page({ params }: PpParams) {
  const channel: StChannel = {
    id: nanoid(10),
    username: params.id,
    telegramLinkCode: `LINK-${nanoid(4)}`,
  };

  return (
    <PageLayout title="Add Channel">
      <Channel newChannel channel={channel} />
    </PageLayout>
  );
}
