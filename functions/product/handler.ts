import { StProduct } from '@/app/model/types';
import { ApiResponse, checkNull, checkPermission } from '@/functions/errors';
import {
  AttributeValue,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { Table } from 'sst/node/table';
import { AuthorizerContext } from '../jwtAuth/handler';
import { lambdaWrapperAuth } from '../lambdaWrapper';
import { ddbGetPageById, dynamoDb } from '../utils';

export type TpPutProductRequest = {
  product: StProduct;
};

export type TpPostProductRequest = {
  id: string;
  title?: string;
  description?: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId) => {
    switch (event.requestContext.http.method) {
      case 'PUT': {
        const body = checkNull(event.body, 400);
        console.log(event.requestContext.http.method, body);
        const { product } = JSON.parse(body) as TpPutProductRequest;

        const page = checkNull(await ddbGetPageById(product.pageId), 400);
        checkPermission(userId, page.userId);
        await ddbPutProduct(product);
        break;
      }
      case 'POST': {
        const body = checkNull(event.body, 400);
        console.log(event.requestContext.http.method, body);
        await ddbUpdateProduct(JSON.parse(body) as TpPostProductRequest);
        break;
      }
      case 'GET': {
        const pageId = checkNull(event.queryStringParameters?.pageId, 400);
        const page = checkNull(await ddbGetPageById(pageId), 400);
        checkPermission(userId, page.userId);
        const products = await ddbGetProducts(pageId);
        return ApiResponse({ status: 200, body: products });
      }
      default:
        return ApiResponse({ status: 405 });
    }

    return ApiResponse({ status: 200 });
  });
};

export async function ddbUpdateProduct({
  id,
  title,
  description,
}: TpPostProductRequest) {
  const expressionAttributeValues: Record<string, AttributeValue> = {};

  let updateExpression = 'SET';

  if (title) {
    expressionAttributeValues[':title'] = { S: title };
    updateExpression += ' title = :title,';
  }

  if (description) {
    expressionAttributeValues[':description'] = { S: description };
    updateExpression += ' description = :description,';
  }

  updateExpression = updateExpression.slice(0, -1); // Remove the trailing comma

  await dynamoDb.send(
    new UpdateItemCommand({
      TableName: Table.Products.tableName,
      Key: marshall({ id }),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
}

export async function ddbGetProducts(pageId: string) {
  const result = await dynamoDb.send(
    new QueryCommand({
      TableName: Table.Products.tableName,
      IndexName: 'PageIdIndex',
      KeyConditionExpression: 'pageId = :pageId',
      ExpressionAttributeValues: {
        ':pageId': { S: pageId },
      },
    })
  );

  return result.Items?.map((item) => unmarshall(item)) as StProduct[];
}

export async function ddbPutProduct(product: StProduct) {
  await dynamoDb.send(
    new PutItemCommand({
      TableName: Table.Products.tableName,
      Item: marshall(product, { removeUndefinedValues: true }),
    })
  );
}
