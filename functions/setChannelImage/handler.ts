import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { marshall } from "@aws-sdk/util-dynamodb";
import { AuthorizerContext } from "../telegramAuth/handler";
import { Bucket } from "sst/node/bucket";
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

type TpSetChannelImageRequest = {
  channelId: string;
  fileBase64: string;
  fileType: string;
};

export type TpSetChannelImageResponse = {
  imagePath: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  console.log(event);
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

  const { fileBase64, fileType, channelId } = JSON.parse(
    event.body
  ) as TpSetChannelImageRequest;

  const buffer = Buffer.from(fileBase64, "base64");
  const imageKey = `${channelId}/${uuidv4()}`;
  const imageBucket = Bucket.ChannelImagesBucket.bucketName;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: imageBucket,
        Key: imageKey,
        Body: buffer,
        ContentType: fileType,
      })
    );

    const imagePath = `https://${imageBucket}.s3.amazonaws.com/${imageKey}`;

    await dynamoDb.send(
      new UpdateItemCommand({
        TableName: Table.Pages.tableName,
        Key: marshall({ id: channelId }),
        UpdateExpression: "SET imagePath = :imagePath",
        ExpressionAttributeValues: {
          ":imagePath": { S: imagePath },
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ imagePath }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
