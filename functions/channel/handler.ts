import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ddbGetChannelById, ddbGetChannelIdByUsername } from "../utils";
import { ApiResponse } from "@/app/model/errors";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
  const username = event.pathParameters?.username;
  const id = await ddbGetChannelIdByUsername(username as string);
  const channel = await ddbGetChannelById(id as string);
  return ApiResponse({
    status: 200,
    body: channel,
  });
};
