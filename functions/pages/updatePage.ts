import { StPage, StPagePrice } from "@/app/model/types";
import { AttributeValue, TransactWriteItem } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { Table } from "sst/node/table";

export async function ddbUpdatePageTransactItem(
  id: string,
  updateObj: Partial<StPage>,
  currentObj: StPage
): Promise<TransactWriteItem> {
  const updateExpressionParts = [];
  const expressionAttributeValues: Record<string, AttributeValue> = {};
  const expressionAttributeNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(updateObj)) {
    if (key === "id") {
      continue;
    }

    const attributeName = `#${key}`;
    const attributeValue = `:${key}`;

    updateExpressionParts.push(`${attributeName} = ${attributeValue}`);
    expressionAttributeNames[attributeName] = key;

    if (typeof value === "string") {
      expressionAttributeValues[attributeValue] = { S: value };
    }

    if (Array.isArray(value) && key === "pricing") {
      // Extract the current pricing from the currentPage
      const currentPricing = currentObj.pricing || [];

      // Iterate through the new pricing items
      for (const newItem of value as StPagePrice[]) {
        // Find the index of an existing pricing item with the same ID
        const existingIndex = currentPricing.findIndex(
          (item) => item.id === newItem.id
        );

        if (existingIndex !== -1) {
          // If found, update the existing item
          currentPricing[existingIndex] = newItem;
        } else {
          // If not found, append the new item
          currentPricing.push(newItem);
        }
      }

      // Update the pricing attribute with the modified array
      expressionAttributeValues[attributeValue] = {
        L: currentPricing.map((item) => ({
          M: {
            id: { S: item.id },
            usd: { N: item.usd.toString() },
            frequency: { S: item.frequency },
          },
        })),
      };
    }
  }

  return {
    Update: {
      TableName: Table.Pages.tableName,
      Key: marshall({ id }),
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    },
  };
}
