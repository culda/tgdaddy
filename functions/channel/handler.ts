import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ddbGetChannelByUsername } from "../utils";
import { ApiResponse } from "@/app/model/errors";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
  const username = event.pathParameters?.username;
  const channel = await ddbGetChannelByUsername(username as string);
  return ApiResponse({
    status: 200,
    body: channel,
  });
};
