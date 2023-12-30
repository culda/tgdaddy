import { StPagePrice } from "@/app/model/types";

export const getUpdatedPrices = (
  pagePrices: StPagePrice[],
  newPrices: StPagePrice[]
) => {
  const updatedPrices: StPagePrice[] = [];
  const pagePricesMap = new Map(pagePrices.map((price) => [price.id, price]));

  newPrices.forEach((newPrice) => {
    if (pagePricesMap.has(newPrice.id)) {
      // Update existing price with the new price info
      updatedPrices.push(newPrice);
    } else {
      // Append new price as it doesn't exist in the base list
      updatedPrices.push(newPrice);
    }
  });

  return updatedPrices;
};
