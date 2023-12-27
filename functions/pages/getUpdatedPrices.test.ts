import { StPriceFrequency } from "@/app/model/types";
import { getUpdatedPrices } from "./getUpdatedPrices";

const testCases = [
  {
    base: [],
    prices: [
      {
        id: "1",
        frequency: StPriceFrequency.Monthly,
        usd: 1.99,
      },
    ],
    expected: [
      {
        id: "1",
        frequency: StPriceFrequency.Monthly,
        usd: 1.99,
      },
    ],
  },
  {
    base: [
      {
        id: "1",
        frequency: StPriceFrequency.Monthly,
        usd: 1.99,
      },
    ],
    prices: [
      {
        id: "1",
        frequency: StPriceFrequency.Monthly,
        usd: 2.99,
      },
    ],
    expected: [
      {
        id: "1",
        frequency: StPriceFrequency.Monthly,
        usd: 2.99,
      },
    ],
  },
  {
    base: [
      {
        id: "1",
        frequency: StPriceFrequency.Monthly,
        usd: 1.99,
      },
    ],
    prices: [
      {
        id: "2",
        frequency: StPriceFrequency.Monthly,
        usd: 2.99,
      },
    ],
    expected: [
      {
        id: "1",
        frequency: StPriceFrequency.Monthly,
        usd: 1.99,
      },
      {
        id: "2",
        frequency: StPriceFrequency.Monthly,
        usd: 2.99,
      },
    ],
  },
  {
    base: [
      {
        id: "1",
        frequency: StPriceFrequency.Yearly,
        usd: 1.99,
      },
      {
        id: "2",
        frequency: StPriceFrequency.Monthly,
        usd: 2.99,
      },
    ],
    prices: [
      {
        id: "1",
        frequency: StPriceFrequency.Yearly,
        usd: 2.99,
      },
    ],
    expected: [
      {
        id: "1",
        frequency: StPriceFrequency.Yearly,
        usd: 2.99,
      },
    ],
  },
];

describe("getUpdatedPrices", () => {
  testCases.forEach(({ base, prices, expected }) => {
    it(`should return ${JSON.stringify(expected)} when base is ${JSON.stringify(
      base
    )} and prices is ${JSON.stringify(prices)}`, async () => {
      const changedProps = getUpdatedPrices(base, prices);
      expect(changedProps).toEqual(expected);
    });
  });
});
