import { StProduct } from "@/app/model/types";
import { ApiResponse, checkNull } from "@/functions/errors";
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { AuthorizerContext } from "../jwtAuth/handler";
import { lambdaWrapperAuth } from "../lambdaWrapper";

type Request = {
  id: string;
  product: StProduct;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId) => {
    const body = checkNull(event.body, 400);

    return ApiResponse({ status: 200, body: { message: "Success" } });
  });
};

export async function ddbPutProduct(product: StProduct) {}
