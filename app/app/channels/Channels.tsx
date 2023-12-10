"use client";
import React from "react";
import { StChannel } from "../../model/types";
import Link from "next/link";
import Button from "../../components/Button";

type PpChannels = {
  channels?: StChannel[];
};

export default function Channels({ channels }: PpChannels) {
  return (
    <div className="justify-center items-stretch flex flex-col gap-2 px-14 py-12 max-md:px-5">
      {channels?.map((channel) => (
        <Button
          key={channel.id}
          href={`/app/channels/${channel.id.split("/")[0]}`}
        >
          {channel.title}
        </Button>
      ))}
      <Button href={`/app/channels/add`}>+</Button>
    </div>
  );
}
