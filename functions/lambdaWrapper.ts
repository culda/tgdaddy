import { ApiResponse, checkNull } from "@/functions/errors";
import {
  APIGatewayProxyEventV2WithLambdaAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { AuthorizerContext } from "./jwtAuth/handler";

export function lambdaWrapper(
  eventHandler: () => Promise<APIGatewayProxyResultV2>
) {
  try {
    return eventHandler();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("{")) {
      const errorObject = JSON.parse(error.message);
      return ApiResponse({
        status: errorObject.statusCode || 500,
        message: errorObject.message,
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
    if (error instanceof Error && error.message.startsWith("{")) {
      const errorObject = JSON.parse(error.message);
      return ApiResponse({
        status: errorObject.statusCode || 500,
        message: errorObject.message,
      });
    } else {
      return ApiResponse({
        status: 500,
      });
    }
  }
}
