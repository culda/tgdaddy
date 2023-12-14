import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ddbGetChannelById, ddbGetChannelIdByUsername } from "../utils";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
  const username = event.pathParameters?.username;
  const id = await ddbGetChannelIdByUsername(username as string);
  console.log(id);
  const data = await ddbGetChannelById(id as string);
  return {
    statusCode: 200,
    body: JSON.stringify({ data }),
  };
};
