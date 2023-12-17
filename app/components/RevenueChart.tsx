"use client";
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData } from "chart.js/auto";
import { BarElement, LinearScale, CategoryScale, Chart } from "chart.js";
import Button from "./Button";

Chart.register(LinearScale);
Chart.register(CategoryScale);
Chart.register(BarElement);

export type TpRevenueChartData = {
  day: ChartData<"bar">;
  day2: ChartData<"bar">;
};

export type TpTotalRevenue = {
  day: number;
  week: number;
  month: number;
};

type PpRevenueChart = {
  data: TpRevenueChartData;
  total: TpTotalRevenue;
};

const RevenueChart = ({ data, total }: PpRevenueChart) => {
  const [chartData, setChartData] = useState<ChartData<"bar">>(data.day);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day");

  console.log(chartData);

  const updateChartData = (timeframe: "day" | "day2") => {
    switch (timeframe) {
      case "day":
        setTimeframe("day");
        break;
      case "day2":
        setTimeframe("month");
        break;
    }
    setChartData(data[timeframe]);
  };

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <div className="flex  text-lg font-extrabold">
        Total: ${total[timeframe]}
      </div>
      <Bar
        data={chartData}
        options={{ scales: { y: { beginAtZero: true } } }}
      />
      <div className="flex flex-row gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => updateChartData("day")}
          active={timeframe === "day"}
        >
          Week
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => updateChartData("day2")}
          active={timeframe === "month"}
        >
          Month
        </Button>
      </div>
    </div>
  );
};

export default RevenueChart;
