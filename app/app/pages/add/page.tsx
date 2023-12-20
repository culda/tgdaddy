import ContentLayout from "@/app/components/ContentLayout";
import React from "react";
import { StPage } from "@/app/model/types";
import PageScreen from "../PageScreen";
import { nanoid } from "nanoid";

type PpParams = {
  searchParams: { username?: string };
};

export default async function Page({ searchParams }: PpParams) {
  const page: Partial<StPage> = {
    id: nanoid(10),
    username: searchParams.username?.toLowerCase(),
    telegramLinkCode: `LINK-${nanoid(4)}`,
  };

  return (
    <ContentLayout title="Add Page">
      <PageScreen edit isNew page={page} />
    </ContentLayout>
  );
}
