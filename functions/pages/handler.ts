import { ApiResponse, checkNull } from "@/functions/errors";
import {
  QueryCommand,
  TransactGetItemsCommandOutput,
  TransactWriteItem,
  TransactWriteItemsCommand,
  TransactionCanceledException,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { Bucket } from "sst/node/bucket";
import { Table } from "sst/node/table";
import { v4 as uuidv4 } from "uuid";
import { StPage } from "../../app/model/types";
import { AuthorizerContext } from "../jwtAuth/handler";
import { lambdaWrapperAuth } from "../lambdaWrapper";
import { ddbGetPageById, dynamoDb, s3PutImage } from "../utils";
import { ddbUpdatePageTransactItem } from "./updatePage";
import { getUpdatedPrices } from "./updatePrices";

export type TpImage = {
  fileBase64: string;
  fileType: string;
};

export type TpPageRequest = Partial<StPage & TpImage>;

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId: string) => {
    switch (event.requestContext.http.method) {
      case "PUT": {
        const body = checkNull(event.body, 400);
        console.log(body);

        const { fileBase64, fileType, ...rest } = JSON.parse(
          body
        ) as TpPageRequest;
        let obj: Partial<StPage> = rest;

        if (fileBase64 && fileType) {
          obj = await addImagePathToObj({ fileBase64, fileType }, obj);
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
        const body = checkNull(event.body, 400);
        console.log(body);

        const { fileBase64, fileType, ...rest } = JSON.parse(
          body
        ) as TpPageRequest;
        let obj: Partial<StPage> = rest;
        const commands = [];

        const page = checkNull(await ddbGetPageById(obj.id as string), 500);

        /**
         * If the username was updated, we attempt to need to verify that the new username is unique
         */
        if (obj.username) {
          // If the username wasn't changed, nothing to do
          if (page?.username !== obj.username) {
            // Delete old username from UniquePages table
            commands.push({
              Delete: {
                TableName: Table.UniquePages.tableName,
                Key: marshall({ username: page?.username }),
              },
            });

            // Add new username to UniquePages table
            commands.push({
              Put: {
                TableName: Table.UniquePages.tableName,
                Item: marshall({ username: obj.username, id: obj.id }),
                ConditionExpression: "attribute_not_exists(username)",
              },
            });
          }
        }

        /**
         * Append/Update/Remove pricing as changed in the form
         */
        if (obj.pricing) {
          obj.pricing = getUpdatedPrices(page?.pricing, obj.pricing);
        }

        /**
         * If a new image was uploaded, we need to upload it to S3
         */
        if (fileBase64 && fileType) {
          obj = await addImagePathToObj({ fileBase64, fileType }, obj);
        }

        console.log(obj);
        const updatePage = await ddbUpdatePageTransactItem(
          page?.id as string,
          obj
        );
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
  });
};

async function dbGetUserPages(id: string): Promise<StPage[] | undefined> {
  const { Items } = await dynamoDb.send(
    new QueryCommand({
      TableName: Table.Pages.tableName,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "userId = :userId",
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
        .resize({
          width: 1080,
          height: 1080,
          fit: "inside",
          withoutEnlargement: true,
        }) // Resize to max width/height
        .toFormat("webp") // Convert to Webp with 80% quality
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
