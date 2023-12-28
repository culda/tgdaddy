import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { Table } from 'sst/node/table';
import { ApiResponse, checkNull, checkPermission } from '../errors';
import { AuthorizerContext } from '../jwtAuth/handler';
import { lambdaWrapperAuth } from '../lambdaWrapper';
import { ddbGetPageById, dynamoDb } from '../utils';

type TpPutRequest = {
  code: string;
  pageId: string;
  productId: string;
  //   channelId?: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId: string) => {
    switch (event.requestContext.http.method) {
      case 'PUT': {
        const body = checkNull(event.body, 400);
        console.log(body);
        const { pageId, productId, code } = JSON.parse(body) as TpPutRequest;

        const page = checkNull(await ddbGetPageById(pageId), 400);
        checkPermission(userId, page.userId);
        // put code in dynamodb
        await dynamoDb.send(
          new PutItemCommand({
            TableName: Table.TelegramLinkCodes.tableName,
            Item: marshall({
              code,
              pageId,
              productId,
            }),
          })
        );
        break;
      }
      case 'GET': {
        console.log(event.queryStringParameters);
        const code = checkNull(event.queryStringParameters?.code, 400);
        const { Item } = await dynamoDb.send(
          new GetItemCommand({
            TableName: Table.TelegramLinkCodes.tableName,
            Key: marshall({ code }),
          })
        );
        return ApiResponse({
          status: 200,
          body: unmarshall(checkNull(Item, 404)),
        });
      }
    }

    return ApiResponse({
      status: 200,
    });
  });
};
