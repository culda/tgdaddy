import PageLayout from "@/app/components/PageLayout";
import React from "react";
import { StPage } from "@/app/model/types";
import { nanoid } from "nanoid";
import Channel from "../../Channel";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

type PpParams = {
  params: { id: string };
};

export default async function Page({ params }: PpParams) {
  const session = await auth();
  const fetchChannel = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/channels?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          ContentType: "application/json",
        },
        cache: "no-cache",
      }
    );
    return (await res.json()) as StPage;
  };

  const channel = await fetchChannel();
  return (
    <PageLayout title="Edit Page">
      <Channel edit channel={channel} />
    </PageLayout>
  );
}
