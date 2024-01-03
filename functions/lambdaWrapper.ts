import { ApiResponse, checkNull } from '@/functions/errors';
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  APIGatewayProxyEventV2WithLambdaAuthorizer,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { AuthorizerContext } from './jwtAuth/handler';

export async function lambdaWrapper(
  eventHandler: () => Promise<APIGatewayProxyResultV2>
) {
  try {
    return eventHandler();
  } catch (error) {
    console.log('error', error);
    if (error instanceof Error && error.message.startsWith('{')) {
      const errorObject = JSON.parse(error.message);
      return ApiResponse({
        status: errorObject.statusCode || 500,
        message: errorObject.message,
      });
    } else if (
      error instanceof TransactionCanceledException &&
      error?.CancellationReasons
    ) {
      console.log(error.CancellationReasons);
      return ApiResponse({
        status: 500,
      });
    } else {
      return ApiResponse({
        status: 500,
      });
    }
  }
}

export function lambdaWrapperAuth(
  event: APIGatewayProxyEventV2WithLambdaAuthorizer<AuthorizerContext>,
  eventHandler: (userId: string) => Promise<APIGatewayProxyResultV2>
) {
  try {
    const userId = checkNull(
      event.requestContext.authorizer.lambda.userId,
      403
    );
    return eventHandler(userId);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('{')) {
      const errorObject = JSON.parse(error.message);
      return ApiResponse({
        status: errorObject.statusCode || 500,
        message: errorObject.message,
      });
    } else if (
      error instanceof TransactionCanceledException &&
      error?.CancellationReasons
    ) {
      console.log(error.CancellationReasons);
      return ApiResponse({
        status: 500,
      });
    } else {
      return ApiResponse({
        status: 500,
      });
    }
  }
}
