import {
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { decode } from "next-auth/jwt";

export const handler: APIGatewayAuthorizerHandler = async (event) => {
  console.log("authing");
  if (event.type === "REQUEST") {
    const auth = event.headers?.["authorization"];
    const token = auth?.split("Bearer ")[1];

    await decode({
      token,
      secret: Buffer.from(process.env.NEXTAUTH_SECRET as string),
    });

    return generatePolicy("user", "Allow", event.methodArn);
  }

  return generatePolicy("user", "Deny", event.methodArn);
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

export default handler;
