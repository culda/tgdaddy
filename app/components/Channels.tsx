"use client";
import React from "react";
import { StChannel } from "../model/types";
import Link from "next/link";

type PpChannels = {
  channels?: StChannel[];
};

export default function Channels({ channels }: PpChannels) {
  return (
    <div className="justify-center items-stretch bg-white flex flex-col px-14 py-12 max-md:px-5 h-screen">
      {channels?.map((channel) => (
        <Link
          href={`/channels/${channel.id}`}
          className="text-black text-xl whitespace-nowrap justify-center text-center items-center bg-cyan-300 px-16 py-5 max-md:mt-10 max-md:px-5"
        >
          {channel.title}
        </Link>
      ))}
    </div>
  );
}
