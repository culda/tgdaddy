import dayjs from 'dayjs';
import {
  TpMembers,
  TpRevenueChartData,
  TpTotalRevenue,
} from '../components/RevenueChart';
import { client } from '../api/stripe/stripe';

export async function fetchStripeData(accountId: string): Promise<{
  chart: TpRevenueChartData;
  total: TpTotalRevenue;
  members: TpMembers;
}> {
  const now = dayjs();
  const oneDayAgo = now.subtract(1, 'day');
  const sevenDaysAgo = now.subtract(7, 'day');
  const thirtyDaysAgo = now.subtract(30, 'day');

  // Fetch charges
  const charges = await client.charges.list(
    {
      created: {
        gte: thirtyDaysAgo.unix(), // Fetch charges created in the last 30 days
      },
    },
    {
      stripeAccount: accountId,
    }
  );

  // Fetch customers
  const customers = await client.customers.list(
    {
      created: {
        gte: thirtyDaysAgo.unix(), // Fetch customers created in the last 30 days
      },
    },
    {
      stripeAccount: accountId,
    }
  );

  let members: TpMembers = {
    day: 0,
    week: 0,
    month: 0,
  };

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

  // Function to add amounts to respective data sets
  const addToEarnings = (date: number, amount: number) => {
    const usd = amount / 100;
    const transactionDate = dayjs.unix(date);
    const diffInDays = now.diff(transactionDate, 'day');

    // Add to daily dataset
    if (diffInDays < intervals.day.length) {
      intervals.day[diffInDays] += usd;
    }

    // Add to 2-day dataset
    const day2Index = Math.floor(diffInDays / 2);
    if (day2Index < intervals.day2.length) {
      intervals.day2[day2Index] += usd;
    }

    // Add to total revenue for each period
    if (transactionDate.isAfter(oneDayAgo)) {
      totalRevenue.day += usd;
    }
    if (transactionDate.isAfter(sevenDaysAgo)) {
      totalRevenue.week += usd;
    }
    totalRevenue.month += usd; // All transactions are within the last 30 days
  };

  // Process charges
  charges.data.forEach((charge) => {
    addToEarnings(charge.created, charge.amount);
  });

  // Process customers
  customers.data.forEach((customer) => {
    const joinDate = dayjs.unix(customer.created);
    if (joinDate.isAfter(oneDayAgo)) {
      members.day++;
    }
    if (joinDate.isAfter(sevenDaysAgo)) {
      members.week++;
    }
    members.month++; // All customers are within the last 30 days
  });

  // Assign calculated data to the revenue object
  revenue.day.datasets[0].data = intervals.day.reverse();
  revenue.day2.datasets[0].data = intervals.day2.reverse();

  return {
    chart: revenue,
    total: totalRevenue,
    members,
  };
}
