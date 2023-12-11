"use client";
import Button from "@/app/components/Button";
import PageLayout from "@/app/components/PageLayout";
import React from "react";
import ChannelSection from "../../ChannelSection";
import { FaCopy } from "react-icons/fa";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { StChannel } from "@/app/model/types";
import { useSession } from "next-auth/react";

type PpAddChannel = {
  channel: StChannel;
};

export default function AddChannel({ channel }: PpAddChannel) {
  const session = useSession();
  // create unique ID
  // wait until webhook receives the ID
  // show refresh button

  // const codeRes = await fetch(`${process.env.API_ENDPOINT}/channels/code`, {)

  const code = "ABCD";
  const copyCode = () => {
    console.log("copying");
  };

  return (
    <PageLayout title="Add Channel">
      {/* <ChannelSection isFirstSection>
        <div class="flex flex-col gap-2">
          <h2>
            Open Telegram and create new a channel. You can use an existing one. Make sure it's a private one.
          </h2>
          <Button href="https://t.me" target="_blank">
            Open in Telegram
          </Button>
        </div>
      </ChannelSection> */}

      <ChannelSection isFirstSection>
        <div class="flex flex-col gap-2">
          <h2 class="font-bold title-font text-gray-900 mb-1 text-xl">
            Telegram
          </h2>
          <p>
            Add <b>tgdaddybot</b> as an admin to your channel. Create a new
            channel if you don't have one
          </p>
          <p className="text-black text-base text-left flex-1">
            <b>Note:</b> You only need to enable <i>Add Members</i>
          </p>
        </div>
      </ChannelSection>

      <ChannelSection>
        <h2 class="font-bold title-font text-gray-900 mb-1 text-xl">
          Connection
        </h2>
        <p> Copy and paste the below code in your channel </p>
        <div className="text-black text-base text-left flex-1">
          <div className="relative text-black text-center text-sm whitespace-nowrap rounded-md justify-center items-center border border-zinc-300 bg-neutral-50 grow py-2.5 border-solid px-1 md:px-5">
            {code}
            <div className="absolute right-4 inset-y-0 flex items-center">
              <button onClick={copyCode}>
                <FaCopy className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </ChannelSection>

      <ChannelSection isLastSection>
        <div class="flex flex-col gap-2">
          <div className="text-black text-base text-left">You’re done!</div>
          <Button href="/app">View Channels</Button>
        </div>
      </ChannelSection>
    </PageLayout>
  );
}
