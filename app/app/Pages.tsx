"use client";
import React from "react";
import { StPage } from "../model/types";
import Button from "../components/Button";
import PageSection from "./pages/PageSection";
import { FaArrowRight } from "react-icons/fa";
import { isEmptyArray, isFalseyOrEmptyArray } from "./utils";
import RevenueChart, {
  TpRevenueChartData,
  TpTotalRevenue,
} from "../components/RevenueChart";

type PpPages = {
  channels?: StPage[];
  chartData?: TpRevenueChartData;
  totalRevenue?: TpTotalRevenue;
};

export default function Pages({ chartData, channels, totalRevenue }: PpPages) {
  return (
    <div className="mt-16">
      <div title="💸 Revenue">
        {chartData && totalRevenue && (
          <RevenueChart data={chartData} total={totalRevenue} />
        )}
      </div>
      <div className="flex flex-col gap-2 mt-8">
        <h2 className="font-bold title-font text-gray-900 mb-1 text-xl">
          Pages
        </h2>
        {isFalseyOrEmptyArray(channels) && (
          <h2>You don't have any pages yet. </h2>
        )}

        {!isEmptyArray(channels) &&
          channels.map((channel) => (
            <Button
              variant={"secondary"}
              key={channel.id}
              href={`/app/pages/${channel.id.split("/")[0]}`}
            >
              {channel.username}
            </Button>
          ))}
        <Button href={`/app/pages/add`}>
          <div className="flex flex-row gap-2 items-center">
            New Page
            <FaArrowRight />
          </div>
        </Button>
      </div>
    </div>
  );
}
