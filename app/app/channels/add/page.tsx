import PageLayout from "@/app/components/PageLayout";
import React from "react";
import { StPage } from "@/app/model/types";
import Channel from "../Channel";
import { nanoid } from "nanoid";

type PpParams = {
  searchParams: { username?: string };
};

export default async function Page({ searchParams }: PpParams) {
  const channel: Partial<StPage> = {
    id: nanoid(10),
    username: searchParams.username?.toLowerCase(),
    telegramLinkCode: `LINK-${nanoid(4)}`,
  };

  return (
    <PageLayout title="Add Page">
      <Channel edit isNew channel={channel} />
    </PageLayout>
  );
}
