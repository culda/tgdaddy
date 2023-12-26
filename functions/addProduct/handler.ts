import {
  APIGatewayProxyHandlerV2WithLambdaAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { AuthorizerContext } from "../jwtAuth/handler";
import { StProduct } from "@/app/model/types";
import { ApiResponse, checkNull } from "@/functions/errors";
import { lambdaWrapper } from "../lambdaWrapper";

type Request = {
  id: string;
  product: StProduct;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapper(async () => {
    const userId = checkNull(
      event.requestContext.authorizer.lambda.userId,
      403
    );
    const body = checkNull(event.body, 400);

    return ApiResponse({ status: 200, body: { message: "Success" } });
  });
};

export async function ddbPutProduct(product: StProduct) {}
