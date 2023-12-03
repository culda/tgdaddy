"use client";
import React from "react";
import { StChannel } from "../model/types";
import Link from "next/link";

type PpChannels = {
  channels?: StChannel[];
};

export default function Channels({ channels }: PpChannels) {
  return (
    <div className="justify-center items-stretch bg-white flex flex-col px-14 py-12 max-md:px-5">
      {channels?.map((channel) => (
        <Link
          key={channel.id}
          href={`/channels/${channel.id.split("/")[0]}`}
          className="text-black text-xl whitespace-nowrap justify-center text-center items-center bg-cyan-200 px-5 py-5 mt-10 "
        >
          {channel.title}
        </Link>
      ))}
      <Link
        href={`/channels/add`}
        className="text-black text-3xl font-extrabold whitespace-nowrap justify-center text-center items-center bg-cyan-200 px-5 py-5 mt-10 "
      >
        +
      </Link>
    </div>
  );
}
