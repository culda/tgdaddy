import { ApiResponse, checkNull, checkPermission } from '@/functions/errors';
import {
  QueryCommand,
  TransactGetItemsCommandOutput,
  TransactWriteItem,
  TransactWriteItemsCommand,
  TransactionCanceledException,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';
import { StPage, StPagePrice } from '../../app/model/types';
import { AuthorizerContext } from '../jwtAuth/handler';
import { lambdaWrapperAuth } from '../lambdaWrapper';
import { ddbGetPageById, dynamoDb, s3PutImage } from '../utils';
import { ddbUpdatePageTransactItem } from './updatePage';

export type TpImage = {
  fileBase64: string;
  fileType: string;
};

export type TpPostPageRequest = {
  id: string;
  username?: string;
  title?: string;
  prices?: StPagePrice[];
} & Partial<TpImage>;

export type TpPutPageRequest = StPage & Partial<TpImage>;

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId: string) => {
    switch (event.requestContext.http.method) {
      case 'PUT': {
        const body = checkNull(event.body, 400);
        console.log(event.requestContext.http.method, body);

        const { fileBase64, fileType, ...page } = JSON.parse(
          body
        ) as TpPutPageRequest;

        if (fileBase64 && fileType) {
          const imagePath = await getImagePath(
            { fileBase64, fileType },
            page.id
          );
          page.imagePath = imagePath;
        }

        try {
          const res = await ddbPutPage(page);

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
              if (reason.Code === 'ConditionalCheckFailed') {
                // Here you can determine which condition failed based on the reason
                // The `reason.Message` property may contain more details
                return ApiResponse({
                  status: 409,
                  message: 'Username already exists',
                });
              }
            }
          }
          return ApiResponse({
            status: 500,
          });
        }
      }
      case 'POST': {
        const body = checkNull(event.body, 400);
        console.log(event.requestContext.http.method, body);

        const { fileBase64, fileType, id, prices, title, username } =
          JSON.parse(body) as TpPostPageRequest;

        let update: Partial<StPage> = {
          prices,
          title,
          username,
        };

        const commands = [];

        const page = checkNull(await ddbGetPageById(id), 500);
        checkPermission(userId, page.userId);

        /**
         * If the username was updated, we attempt to need to verify that the new username is unique
         */
        if (update.username) {
          // If the username wasn't changed, nothing to do
          if (page?.username !== update.username) {
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
                Item: marshall({ username: update.username, id }),
                ConditionExpression: 'attribute_not_exists(username)',
              },
            });
          }
        }

        /**
         * If a new image was uploaded, we need to upload it to S3
         */
        if (fileBase64 && fileType) {
          const imagePath = await getImagePath(
            { fileBase64, fileType },
            page.id
          );
          update.imagePath = imagePath;
        }

        console.log('updateObj', update);
        if (Object.keys(update).length > 0) {
          commands.push(await ddbUpdatePageTransactItem(id, update));
        }

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
      case 'GET': {
        if (event.queryStringParameters?.id) {
          const id = event.queryStringParameters?.id;
          const page = checkNull(await ddbGetPageById(id as string), 500);
          checkPermission(userId, page.userId);
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
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: id },
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
      ConditionExpression: 'attribute_not_exists(username)',
    },
  });

  commands.push({
    Put: {
      TableName: Table.Pages.tableName,
      Item: marshall(page, { removeUndefinedValues: true }),
      ConditionExpression: 'attribute_not_exists(id)',
    },
  });

  const response = await dynamoDb.send(
    new TransactWriteItemsCommand({
      TransactItems: commands,
    })
  );

  return response;
}

async function getImagePath(img: TpImage, pageId: string): Promise<string> {
  try {
    let buffer = Buffer.from(img.fileBase64, 'base64');

    try {
      const sharp = require('sharp');

      // Image optimization
      buffer = await sharp(buffer)
        .resize({
          width: 1080,
          height: 1080,
          fit: 'inside',
          withoutEnlargement: true,
        }) // Resize to max width/height
        .toFormat('webp') // Convert to Webp with 80% quality
        .toBuffer();
    } catch (err) {
      console.log(err);
    }

    const imageKey = `${pageId}/${uuidv4()}`;
    const imageBucket = Bucket.PagesImagesBucket.bucketName;

    await s3PutImage(buffer, imageKey, imageBucket, 'image/webp'); // Upload the optimized image

    return `https://${imageBucket}.s3.amazonaws.com/${imageKey}`;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error; // Rethrow the error for handling upstream
  }
}
