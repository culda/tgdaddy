"use client";
import React from "react";
import { StChannel } from "../model/types";
import Button from "../components/Button";
import ChannelSection from "./channels/[id]/ChannelSection";
import { FaArrowRight } from "react-icons/fa";
import { isEmptyArray, isFalseyOrEmptyArray } from "./utils";

type PpChannels = {
  channels?: StChannel[];
};

export default function Channels({ channels }: PpChannels) {
  return (
    <div className="mt-16">
      <ChannelSection isFirstSection>
        <div className="flex flex-col gap-2">
          {isFalseyOrEmptyArray(channels) && (
            <h2>You don't have any channels yet. </h2>
          )}

          {!isEmptyArray(channels) &&
            channels.map((channel) => (
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
        <div className="flex">
          <Button href={`/app/channels/add`}>
            <div className="flex flex-row gap-2 items-center">
              New Channel
              <FaArrowRight />
            </div>
          </Button>
        </div>
      </ChannelSection>
    </div>
  );
}
