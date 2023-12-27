import { StPage } from "@/app/model/types";
import { AttributeValue, TransactWriteItem } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { Table } from "sst/node/table";

export async function ddbUpdatePageTransactItem(
  id: string,
  obj: Partial<StPage>
): Promise<TransactWriteItem> {
  const updateExpressionParts = [];
  const expressionAttributeValues: Record<string, AttributeValue> = {};
  const expressionAttributeNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
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
      // Update the pricing attribute with the modified array
      expressionAttributeValues[attributeValue] = {
        L: obj.pricing!.map((item) => ({
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
