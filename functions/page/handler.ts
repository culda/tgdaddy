import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ddbGetPageByUsername } from "../utils";
import { ApiResponse } from "@/functions/errors";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event.pathParameters);
  const username = event.pathParameters?.username;
  const page = await ddbGetPageByUsername(username as string);
  return ApiResponse({
    status: 200,
    body: page,
  });
};
