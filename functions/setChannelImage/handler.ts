import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { StChannel } from "../../app/model/types";
import { AuthorizerContext } from "../telegramAuth/handler";
import { ddbGetChannelById } from "../utils";
import { Bucket } from "sst/node/bucket";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

type TpSetChannelImageRequest = {
  channelId: string;
  image: string;
};

type TpSetChannelImageResponse = {
  path: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  const userId = event.requestContext.authorizer.lambda.userId;
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No userId on the token" }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is required" }),
    };
  }

  const { image, channelId } = JSON.parse(
    event.body
  ) as TpSetChannelImageRequest;

  // Assuming the image is a base64 encoded string
  const buffer = Buffer.from(image, "base64");
  const imageKey = `${channelId}/${uuidv4()}`;
  const imageBucket = Bucket.ChannelImagesBucket.bucketName;

  let path;

  return {
    statusCode: 200,
    body: JSON.stringify({ path }),
  };
};
