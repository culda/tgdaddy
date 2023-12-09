import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerHandler,
} from "aws-lambda";

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  console.log(event);
  if (event.authorizationToken === process.env.ADMIN_AUTH_TOKEN) {
    return generatePolicy("user", "Allow", event.methodArn);
  } else {
    return generatePolicy("user", "Deny", event.methodArn);
  }
};

function generatePolicy(
  principalId: string,
  effect: string,
  resource: string
): APIGatewayAuthorizerResult {
  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  };

  return {
    principalId: principalId,
    policyDocument: policyDocument,
  };
}
