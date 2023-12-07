"use client";
import React from "react";
import { StChannel } from "../model/types";
import Link from "next/link";
import Button from "./Button";

type PpChannels = {
  channels?: StChannel[];
};

export default function Channels({ channels }: PpChannels) {
  return (
    <div className="justify-center items-stretch bg-white flex flex-col px-14 py-12 max-md:px-5">
      {channels?.map((channel) => (
        <Button
          key={channel.id}
          href={`/app/channels/${channel.id.split("/")[0]}`}
        >
          {channel.title}
        </Button>
      ))}
      <Button href={`/channels/add`}>+</Button>
    </div>
  );
}
