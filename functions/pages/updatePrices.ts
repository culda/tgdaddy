import { StPagePrice } from "@/app/model/types";

export const getUpdatedPrices = (
  pagePrices: StPagePrice[],
  newPrices: StPagePrice[]
): StPagePrice[] => {
  let updatedPricing = [...newPrices];

  newPrices.forEach((pr) => {
    // Find the index of the matching price entry by comparing amount and frequency
    const matchingIndex = updatedPricing.findIndex(
      (existingPrice) => existingPrice.frequency === pr.frequency
    );

    if (matchingIndex !== -1) {
      // If a matching price entry is found, update it
      updatedPricing[matchingIndex] = pr;
    } else {
      // If no matching price entry is found, append the new price
      updatedPricing.push(pr);
    }

    updatedPricing = pagePrices.filter((existingPrice) => {
      return newPrices.some(
        (pr) =>
          existingPrice.usd === pr.usd &&
          existingPrice.frequency === pr.frequency
      );
    });
  });

  return updatedPricing;
};
