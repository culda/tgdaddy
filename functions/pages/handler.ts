import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Table } from "sst/node/table";
import {
  AttributeValue,
  DynamoDBClient,
  ScanCommand,
  TransactGetItemsCommandOutput,
  TransactWriteItem,
  TransactWriteItemsCommand,
  TransactionCanceledException,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { StPage } from "../../app/model/types";
import { AuthorizerContext } from "../telegramAuth/handler";
import { ddbGetPageById } from "../utils";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Bucket } from "sst/node/bucket";
import { ApiResponse } from "@/app/model/errors";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

export type TpImage = {
  fileBase64: string;
  fileType: string;
};

type Request = Partial<StPage & TpImage>;

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  console.log(event.body);
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

      const req = JSON.parse(event.body) as Request;
      let obj: Partial<StPage> = req;

      if (req.fileBase64 && req.fileType) {
        obj = await addImagePathToObj(
          { fileBase64: req.fileBase64, fileType: req.fileType },
          obj
        );
      }

      try {
        const res = await ddbPutPage(obj);

        return ApiResponse({
          status: 200,
          body: res,
        });
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
              return ApiResponse({
                status: 409,
                message: "Username already exists",
              });
            }
          }
        }
        return ApiResponse({
          status: 500,
        });
      }
    }
    case "POST": {
      if (!event.body) {
        return ApiResponse({
          status: 400,
        });
      }

      const req = JSON.parse(event.body) as Request;
      let obj: Partial<StPage> = req;

      console.log(obj);

      const commands = [];

      /**
       * If the username was updated, we attempt to need to verify that the new username is unique
       */
      if (req.username) {
        const ch = await ddbGetPageById(req.id as string);
        // If the username wasn't changed, nothing to do
        if (ch?.username !== req.username) {
          // Delete old username from UniquePages table
          commands.push({
            Delete: {
              TableName: Table.UniquePages.tableName,
              Key: marshall({ username: ch?.username }),
            },
          });

          // Add new username to UniquePages table
          commands.push({
            Put: {
              TableName: Table.UniquePages.tableName,
              Item: marshall({ username: req.username, id: req.id }),
              ConditionExpression: "attribute_not_exists(username)",
            },
          });
        }
      }

      /**
       * If a new image was uploaded, we need to upload it to S3
       */
      if (req.fileBase64 && req.fileType) {
        obj = await addImagePathToObj(
          { fileBase64: req.fileBase64, fileType: req.fileType },
          obj
        );
      }

      const updatePage = await ddbUpdatePageTransactItem(obj);
      commands.push(updatePage);

      const res = await dynamoDb.send(
        new TransactWriteItemsCommand({
          TransactItems: commands,
        })
      );

      return ApiResponse({
        status: 200,
        body: res,
      });
    }
    case "GET": {
      if (event.queryStringParameters?.id) {
        const id = event.queryStringParameters?.id;
        const page = await ddbGetPageById(id);
        if (userId !== page?.userId) {
          return ApiResponse({
            status: 403,
          });
        }
        return ApiResponse({
          status: 200,
          body: page,
        });
      }

      const pages = await dbGetUserPages(userId);

      return ApiResponse({
        status: 200,
        body: pages,
      });
    }
    default:
      return ApiResponse({
        status: 405,
      });
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

async function dbGetUserPages(id: string): Promise<StPage[] | undefined> {
  const { Items } = await dynamoDb.send(
    new ScanCommand({
      TableName: Table.Pages.tableName,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: id },
      },
    })
  );

  if (!Items) {
    return undefined;
  }

  return Items.map((item) => unmarshall(item)) as StPage[];
}

async function ddbPutPage(
  page: Partial<StPage>
): Promise<TransactGetItemsCommandOutput> {
  const commands: TransactWriteItem[] = [];

  commands.push({
    Put: {
      TableName: Table.UniquePages.tableName,
      Item: marshall(
        { username: page.username?.toLowerCase(), id: page.id },
        { removeUndefinedValues: true }
      ),
      ConditionExpression: "attribute_not_exists(username)",
    },
  });

  commands.push({
    Put: {
      TableName: Table.Pages.tableName,
      Item: marshall(page, { removeUndefinedValues: true }),
      ConditionExpression: "attribute_not_exists(id)",
    },
  });

  commands.push({
    Put: {
      TableName: Table.TelegramLinkCodes.tableName,
      Item: marshall(
        {
          code: page.telegramLinkCode,
          pageId: page.id,
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

async function ddbUpdatePageTransactItem(
  page: Partial<StPage>
): Promise<TransactWriteItem> {
  const updateExpressionParts = [];
  const expressionAttributeValues: Record<string, AttributeValue> = {};
  const expressionAttributeNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(page)) {
    if (key === "id") {
      continue;
    }
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
            id: { S: item.id! },
            usd: { N: item.usd.toString() },
            frequency: { S: item.frequency },
          },
        }));
        expressionAttributeValues[attributeValue] = { L: pricingArray };
      }
    }
  }

  return {
    Update: {
      TableName: Table.Pages.tableName,
      Key: {
        id: { S: page.id! },
      },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    },
  };
}

async function addImagePathToObj(
  img: TpImage,
  page: Partial<StPage>
): Promise<Partial<StPage>> {
  try {
    let buffer = Buffer.from(img.fileBase64, "base64");

    try {
      const sharp = require("sharp");

      // Image optimization
      buffer = await sharp(buffer)
        // .resize({
        //   width: 1080,
        //   height: 1080,
        //   fit: "inside",
        //   withoutEnlargement: true,
        // }) // Resize to max width/height
        .toFormat("webp", { quality: 80 }) // Convert to Webp with 80% quality
        .toBuffer();
    } catch (err) {
      console.log(err);
    }

    const imageKey = `${page.id}/${uuidv4()}`;
    const imageBucket = Bucket.PagesImagesBucket.bucketName;

    await s3PutImage(buffer, imageKey, imageBucket, "image/webp"); // Upload the optimized image

    return {
      ...page,
      imagePath: `https://${imageBucket}.s3.amazonaws.com/${imageKey}`,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error; // Rethrow the error for handling upstream
  }
}
