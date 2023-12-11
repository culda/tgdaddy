import Button from "@/app/components/Button";
import PageLayout from "@/app/components/PageLayout";
import React from "react";
import ChannelSection from "../../ChannelSection";
import { FaCopy } from "react-icons/fa";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import AddChannel from "./AddChannel";
import { StChannel } from "@/app/model/types";
import Channel from "../Channel";
import { v4 as uuid } from "uuid";

export default async function Page(params) {
  const session = await auth();

  // create unique ID
  // wait until webhook receives the ID
  // show refresh button

  // const codeRes = await fetch(`${process.env.API_ENDPOINT}/channels/code`, {)

  const code = "ABCD";
  const copyCode = () => {
    console.log("copying");
  };

  const channel: StChannel = {
    id: uuid(),
    username: params.params.id,
    telegramLinkCode: "ABCD",
  };

  console.log(params);

  return (
    <PageLayout title="Add Channel">
      <Channel newChannel channel={channel} />
    </PageLayout>
  );
}
