import { StPriceFrequency } from '@/app/model/types';
import { getChangedProps } from './getChangedProps';

const testCases = [
  {
    base: {
      id: '1',
      userId: 'user1',
      title: 'Title',
    },
    newPage: {
      id: '1',
      userId: 'user1',
      title: 'Title',
    },
    expected: {},
  },
  {
    base: {
      id: '1',
      userId: 'user1',
      title: 'Title',
    },
    newPage: {
      id: '1',
      userId: 'user2', // Changed value
      title: 'Updated Title', // Changed value
      description: 'Description', // New property
    },
    expected: {
      userId: 'user2',
      title: 'Updated Title',
      description: 'Description',
    },
  },
  {
    base: {
      id: '1',
      userId: 'user1',
    },
    newPage: {
      id: '1',
      userId: 'user2',
      title: 'Title', // New property
    },
    expected: {
      userId: 'user2',
      title: 'Title',
    },
  },
  {
    base: {
      id: '1',
      userId: 'user1',
      title: 'Title', // Existing property
    },
    newPage: {
      id: '1',
      userId: 'user2',
    },
    expected: {
      userId: 'user2',
    },
  },
  {
    base: {
      prices: [
        {
          id: '1',
          usd: 100,
          frequency: StPriceFrequency.Month,
        },
      ],
    },
    newPage: {
      prices: [
        {
          id: '1',
          usd: 100,
          frequency: StPriceFrequency.Month,
        },
      ],
    },
    expected: {},
  },
  {
    base: {
      prices: [
        {
          id: '1',
          usd: 100,
          frequency: StPriceFrequency.Month,
        },
      ],
    },
    newPage: {
      prices: [
        {
          id: '1',
          usd: 105,
          frequency: StPriceFrequency.Month,
        },
      ],
    },
    expected: {
      prices: [
        {
          id: '1',
          usd: 105,
          frequency: StPriceFrequency.Month,
        },
      ],
    },
  },
];

describe('getChangedProps', () => {
  testCases.forEach(({ base, newPage, expected }) => {
    it(`should return ${JSON.stringify(expected)} when base is ${JSON.stringify(
      base
    )} and newPage is ${JSON.stringify(newPage)}`, async () => {
      const changedProps = await getChangedProps(base, newPage);
      expect(changedProps).toEqual(expected);
    });
  });
});
