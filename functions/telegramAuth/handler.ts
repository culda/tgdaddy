import {
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { decode } from "next-auth/jwt";

export type AuthorizerContext = {
  userId?: string;
};

export const handler: APIGatewayAuthorizerHandler = async (event) => {
  if (event.type === "REQUEST") {
    const auth = event.headers?.["authorization"];
    const token = auth?.split("Bearer ")[1];

    // Throws error if token is invalid
    const jwt = await decode({
      token,
      secret: Buffer.from(process.env.NEXTAUTH_SECRET as string),
    });

    console.log(jwt);

    return generatePolicy("user", "Allow", event.methodArn, jwt?.sub);
  }

  return generatePolicy("user", "Deny", event.methodArn);
};

function generatePolicy(
  principalId: string,
  effect: string,
  resource: string,
  userId?: string
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
    context: {
      userId,
    },
  };
}

export default handler;
