import dayjs from 'dayjs';
import {
  TpMembers,
  TpRevenueChartData,
  TpTotalRevenue,
} from '../components/RevenueChart';

export const getFakeRevenueData = (): {
  chart: TpRevenueChartData;
  total: TpTotalRevenue;
  members: TpMembers;
} => {
  const now = dayjs();
  const oneDayAgo = now.subtract(1, 'day');
  const sevenDaysAgo = now.subtract(7, 'day');
  const thirtyDaysAgo = now.subtract(30, 'day');
  // Initialize data sets
  let revenue: TpRevenueChartData = {
    day: {
      labels: [],
      datasets: [{ data: [] }],
    },
    day2: {
      labels: [],
      datasets: [{ data: [] }],
    },
  };

  const totalRevenue = {
    day: 0,
    week: 0,
    month: 0,
  };

  // Initialize buckets based on intervals
  const intervals = {
    day: Array(30).fill(0), // 30 days
    day2: Array(15).fill(0), // 30 days / 2
  };

  // Populate labels for each dataset
  for (let i = 0; i < 30; i++) {
    revenue.day.labels!.push(thirtyDaysAgo.add(i, 'day').format('DD'));
    if (i % 2 === 0) {
      revenue.day2.labels!.push(thirtyDaysAgo.add(i, 'day').format('DD'));
    }
  }

  // Mock revenue data
  const dayRevenue = [
    6172, 5599, 2552, 8416, 3324, 8577, 7386, 4467, 3658, 1803, 1296, 1544,
    6715, 7702, 8730, 4037, 5226, 2131, 7513, 6447, 8447, 1408, 1519, 5106,
    8117, 1105, 4111, 5280, 6800, 4236,
  ];
  const day2Revenue = [
    8457, 8923, 9341, 2610, 2609, 9416, 2063, 1906, 3085, 3013, 5302, 5880,
    1254, 2932, 5156,
  ];

  // Assigning mock data to datasets
  revenue.day.datasets[0].data = dayRevenue;
  revenue.day2.datasets[0].data = day2Revenue;

  // Calculating total revenues
  totalRevenue.day = dayRevenue.reduce((a, b) => a + b, 0);
  totalRevenue.week = dayRevenue.slice(-7).reduce((a, b) => a + b, 0);
  totalRevenue.month = totalRevenue.day;

  // Mock member data
  const members: TpMembers = {
    day: 12,
    week: 80,
    month: 300,
  };

  return { chart: revenue, total: totalRevenue, members };
};
