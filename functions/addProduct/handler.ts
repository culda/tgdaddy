import { StProduct } from '@/app/model/types';
import { ApiResponse, checkNull, checkPermission } from '@/functions/errors';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { Table } from 'sst/node/table';
import { AuthorizerContext } from '../jwtAuth/handler';
import { lambdaWrapperAuth } from '../lambdaWrapper';
import { ddbGetPageById, dynamoDb } from '../utils';

type Request = {
  pageId: string;
  product: StProduct;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId) => {
    const body = checkNull(event.body, 400);
    console.log(body);
    const { pageId, product } = JSON.parse(body) as Request;
    switch (event.requestContext.http.method) {
      case 'PUT': {
        const page = checkNull(await ddbGetPageById(pageId), 400);
        checkPermission(userId, page.userId);
        // put product in dynamodb
        await ddbPutProduct(pageId, product);
        break;
      }
    }

    return ApiResponse({ status: 200 });
  });
};

export async function ddbPutProduct(pageId: string, product: StProduct) {
  await dynamoDb.send(
    new UpdateItemCommand({
      TableName: Table.Pages.tableName,
      Key: marshall({ id: pageId }),
      UpdateExpression:
        'SET #products = list_append(if_not_exists(#products, :empty_list), :product)',
      ExpressionAttributeNames: {
        '#products': 'products',
      },
      ExpressionAttributeValues: {
        ':product': { L: [{ M: marshall(product) }] },
        ':empty_list': { L: [] },
      },
    })
  );
}
