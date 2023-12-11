import Button from "@/app/components/Button";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";
import React from "react";
import ChannelSection from "../ChannelSection";

export default function Page() {
  return (
    <PageLayout title="Add Channel">
      <ChannelSection isFirstSection>
        <div class="flex flex-col gap-2">
          <h2>
            Launch{" "}
            <b>
              <a target="_blank" href="https://t.me/tgdaddybot">
                tgdaddybot
              </a>
            </b>
          </h2>
          <Button href="https://t.me/tgdaddybot" target="_blank">
            Open in Telegram
          </Button>
        </div>
      </ChannelSection>

      <ChannelSection>
        <div class="flex flex-col gap-2">
          <h2>
            Add <b>tgdaddybot</b> as an admin to your channel.
          </h2>
          <div className="text-black text-base text-left flex-1">
            <b>Note:</b> You only need to enable <i>Add Members</i>
          </div>
        </div>
      </ChannelSection>

      <ChannelSection>
        <div className="text-black text-base text-left flex-1">
          In the bot chat, start the <b>Link Channel</b> action and forward a
          message from your channel to the bot
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
