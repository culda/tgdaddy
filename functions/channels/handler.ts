import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  TransactGetItemsCommandOutput,
  TransactWriteItem,
  TransactWriteItemsCommand,
  TransactionCanceledException,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { StChannel } from "../../app/model/types";
import { AuthorizerContext } from "../telegramAuth/handler";
import { ddbGetChannelById } from "../utils";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Bucket } from "sst/node/bucket";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

export type WithImage = {
  fileBase64: string;
  fileType: string;
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

  switch (event.requestContext.http.method) {
    case "PUT": {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Request body is required" }),
        };
      }

      const req = JSON.parse(event.body) as Partial<StChannel & WithImage>;

      if (req.fileBase64 && req.fileType) {
        const buffer = Buffer.from(req.fileBase64, "base64");
        const imageKey = `${req.id}/${uuidv4()}`;
        const imageBucket = Bucket.ChannelImagesBucket.bucketName;

        await s3PutImage(buffer, imageKey, imageBucket, req.fileType);

        req.imagePath = `https://${imageBucket}.s3.amazonaws.com/${imageKey}`;
        delete req.fileBase64;
        delete req.fileType;
      }

      try {
        const res = await ddbPutChannel(req);

        return {
          statusCode: 200,
          body: JSON.stringify({ data: res }),
        };
      } catch (error) {
        console.log(error);
        if (
          error instanceof TransactionCanceledException &&
          error?.CancellationReasons
        ) {
          // Inspect the CancellationReasons from the error
          for (const reason of error.CancellationReasons) {
            if (reason.Code === "ConditionalCheckFailed") {
              // Here you can determine which condition failed based on the reason
              // The `reason.Message` property may contain more details
              return {
                statusCode: 409,
                body: JSON.stringify({
                  message: "Username already exists",
                }),
              };
            }
          }
        }
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Failed to execute TransactGetItemsCommandOutput",
          }),
        };
      }
    }
    case "POST": {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Request body is required" }),
        };
      }

      const req = JSON.parse(event.body) as Partial<StChannel>;
      const res = await ddbUpdateChannel(req.id as string, req);

      return {
        statusCode: 200,
        body: JSON.stringify({ data: res }),
      };
    }
    case "GET": {
      if (event.queryStringParameters?.id) {
        const id = event.queryStringParameters?.id;
        const data = await ddbGetChannelById(id);
        if (userId !== data?.userId) {
          return {
            statusCode: 401,
            body: JSON.stringify({ message: "Unauthorized" }),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify({ data }),
        };
      }

      const data = await dbGetUserChannels(userId);

      return {
        statusCode: 200,
        body: JSON.stringify({ data }),
      };
    }
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
  }
};

async function s3PutImage(
  image: Buffer,
  key: string,
  bucket: string,
  fileType: string
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: image,
      ContentType: fileType,
    })
  );
}

async function dbGetUserChannels(id: string): Promise<StChannel[] | undefined> {
  const { Items } = await dynamoDb.send(
    new ScanCommand({
      TableName: Table.Channels.tableName,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: id },
      },
    })
  );

  if (!Items) {
    return undefined;
  }

  return Items.map((item) => unmarshall(item)) as StChannel[];
}

async function ddbPutChannel(
  channel: Partial<StChannel>
): Promise<TransactGetItemsCommandOutput> {
  const commands: TransactWriteItem[] = [];

  commands.push({
    Put: {
      TableName: Table.UniqueChannels.tableName,
      Item: marshall(
        { username: channel.username, id: channel.id },
        { removeUndefinedValues: true }
      ),
      ConditionExpression: "attribute_not_exists(username)",
    },
  });

  commands.push({
    Put: {
      TableName: Table.Channels.tableName,
      Item: marshall(channel, { removeUndefinedValues: true }),
      ConditionExpression: "attribute_not_exists(id)",
    },
  });

  commands.push({
    Put: {
      TableName: Table.TelegramLinkCodes.tableName,
      Item: marshall(
        {
          code: channel.telegramLinkCode,
          channelId: channel.id,
        },
        { removeUndefinedValues: true }
      ),
    },
  });

  const response = await dynamoDb.send(
    new TransactWriteItemsCommand({
      TransactItems: commands,
    })
  );

  return response;
}

async function ddbUpdateChannel(
  id: string,
  channel: Partial<StChannel>
): Promise<StChannel | undefined> {
  const updateExpressionParts = [];
  const expressionAttributeValues: Record<string, AttributeValue> = {};
  const expressionAttributeNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(channel)) {
    if (key !== "id") {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;

      updateExpressionParts.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;

      if (typeof value === "string") {
        expressionAttributeValues[attributeValue] = { S: value };
      } else if (Array.isArray(value)) {
        // Handle pricing array separately
        if (key === "pricing") {
          const pricingArray = value.map((item) => ({
            M: {
              stripePriceId: { S: item.stripePriceId! },
              usd: { N: item.usd.toString() },
              frequency: { S: item.frequency },
            },
          }));
          expressionAttributeValues[attributeValue] = { L: pricingArray };
        }
      }
    }
  }

  const { Attributes } = await dynamoDb.send(
    new UpdateItemCommand({
      TableName: Table.Channels.tableName,
      Key: {
        id: { S: id },
      },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!Attributes) {
    return undefined;
  }

  return unmarshall(Attributes) as StChannel;
}
