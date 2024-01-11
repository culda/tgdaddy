'use client';
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js/auto';
import { BarElement, LinearScale, CategoryScale, Chart } from 'chart.js';
import Button from './Button';

Chart.register(LinearScale);
Chart.register(CategoryScale);
Chart.register(BarElement);

export type TpRevenueChartData = {
  day: ChartData<'bar'>;
  day2: ChartData<'bar'>;
};

export type TpTotalRevenue = {
  day: number;
  week: number;
  month: number;
};

export type TpMembers = {
  day: number;
  week: number;
  month: number;
};

type PpRevenueChart = {
  data: TpRevenueChartData;
  total: TpTotalRevenue;
  members: TpMembers;
};

const RevenueChart = ({ data, total, members }: PpRevenueChart) => {
  const [chartData, setChartData] = useState<ChartData<'bar'>>(data.day);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const updateChartData = (candle: 'day' | 'day2') => {
    switch (candle) {
      case 'day':
        setTimeframe('week');
        break;
      case 'day2':
        setTimeframe('month');
        break;
    }
    setChartData(data[candle]);
  };

  return (
    <div>
      <div className="flex text-lg items-center font-extrabold gap-4">
        <span className="font-medium">Revenue</span>
        <span className="font-extrabold text-4xl">{`$${total[
          timeframe
        ].toLocaleString(undefined, { useGrouping: true })}`}</span>
      </div>
      <div className="flex  text-lg items-center  font-extrabold gap-4 ">
        <span className="font-medium">Members</span>
        <span className="font-extrabold text-4xl">{members[timeframe]}</span>
      </div>
      <div className="flex flex-col gap-2 justify-center items-center mt-8">
        <Bar
          data={chartData}
          options={{
            scales: {
              y: {
                title: {
                  display: true,
                  text: '$',
                },
                beginAtZero: true,
              },
            },
          }}
        />
        <div className="flex flex-row gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateChartData('day')}
            active={timeframe === 'week'}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateChartData('day2')}
            active={timeframe === 'month'}
          >
            Month
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
