import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { dbGetChannelById, dbGetChannelIdByUsername } from "../utils";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
  const username = event.pathParameters?.username;
  const id = await dbGetChannelIdByUsername(username as string);
  const data = await dbGetChannelById(id as string);
  return {
    statusCode: 200,
    body: JSON.stringify({ data }),
  };
};
