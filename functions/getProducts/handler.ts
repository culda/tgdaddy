import { StProduct } from '@/app/model/types';
import { ApiResponse, checkNull, checkPermission } from '@/functions/errors';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { Table } from 'sst/node/table';
import { lambdaWrapper } from '../lambdaWrapper';
import { dynamoDb } from '../utils';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  return lambdaWrapper(async () => {
    switch (event.requestContext.http.method) {
      case 'GET': {
        const pageId = checkNull(event.queryStringParameters?.pageId, 400);
        console.log(event.requestContext.http.method, pageId);
        const products = await ddbGetProducts(pageId);
        return ApiResponse({ status: 200, body: products });
      }
      default:
        return ApiResponse({ status: 405 });
    }
  });
};

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
