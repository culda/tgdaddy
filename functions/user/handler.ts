import { ApiResponse, checkNull } from "@/functions/errors";
import {
  AttributeValue,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import { StUser } from "../../app/model/types";
import { AuthorizerContext } from "../jwtAuth/handler";
import { lambdaWrapperAuth } from "../lambdaWrapper";
import { ddbGetUserById, dynamoDb } from "../utils";

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId: string) => {
    switch (event.requestContext.http.method) {
      case "POST": {
        const body = checkNull(event.body, 400);
        console.log(body);

        const req = JSON.parse(body) as Partial<StUser>;
        const user = await ddbUpdateUser(userId, req);

        return ApiResponse({
          status: 200,
          body: user,
        });
      }
      case "GET": {
        const user = await ddbGetUserById(userId);

        return ApiResponse({
          status: 200,
          body: user,
        });
      }
      default:
        return ApiResponse({
          status: 405,
        });
    }
  });
};

async function ddbUpdateUser(
  id: string,
  user: Partial<StUser>
): Promise<StUser | undefined> {
  const updateExpressionParts = [];
  const expressionAttributeValues: Record<string, AttributeValue> = {};
  const expressionAttributeNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(user)) {
    if (key !== "id") {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;

      updateExpressionParts.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = { S: value.toString() };
    }
  }

  const input: UpdateItemCommandInput = {
    TableName: Table.Users.tableName,
    Key: {
      id: { S: id },
    },
    ReturnValues: "ALL_NEW",
  };

  if (updateExpressionParts.length !== 0) {
    Object.assign(input, {
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });
  }

  const { Attributes } = await dynamoDb.send(new UpdateItemCommand(input));

  if (!Attributes) {
    return undefined;
  }

  return unmarshall(Attributes) as StUser;
}
