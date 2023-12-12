"use client";
import React from "react";
import { StChannel } from "../model/types";
import Button from "../components/Button";
import ChannelSection from "./channels/[id]/ChannelSection";
import { FaArrowRight } from "react-icons/fa";

type PpChannels = {
  channels?: StChannel[];
};

export default function Channels({ channels }: PpChannels) {
  return (
    <div class="mt-16">
      <ChannelSection isFirstSection>
        <div className="flex flex-col gap-2">
          {!channels && <h2>You don't have any channels yet. </h2>}

          {channels?.map((channel) => (
            <Button
              variant={"secondary"}
              key={channel.id}
              href={`/app/channels/${channel.id.split("/")[0]}`}
            >
              {channel.username}
            </Button>
          ))}
        </div>
      </ChannelSection>
      <ChannelSection isLastSection>
        <div class="flex">
          <Button href={`/app/channels/add`}>
            <div class="flex flex-row gap-2 items-center">
              New Channel
              <FaArrowRight />
            </div>
          </Button>
        </div>
      </ChannelSection>
    </div>
  );
}
