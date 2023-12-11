"use client";
import React, { Fragment } from "react";
import { StChannel } from "../model/types";
import Link from "next/link";
import Button from "../components/Button";
import ChannelSection from "./channels/ChannelSection";
import { FaArrowRight } from "react-icons/fa";

type PpChannels = {
  channels?: StChannel[];
};

export default function Channels({ channels }: PpChannels) {
  return (
    <Fragment>
      <ChannelSection isFirstSection>
        <div className="justify-center items-stretch flex flex-col gap-2 px-14 py-12 max-md:px-5">
          {channels?.map((channel) => (
            <Button
              variant={"secondary"}
              key={channel.id}
              href={`/app/channels/${channel.id.split("/")[0]}`}
            >
              {channel.title}
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
    </Fragment>
  );
}
