import {
  APIGatewayAuthorizerEvent,
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import crypto from "crypto";

export const handler: APIGatewayAuthorizerHandler = async (event) => {
  console.log(event);
  if (event.type === "REQUEST") {
    if (!event.headers) {
      return generatePolicy("user", "Deny", event.methodArn);
    }
    const token = event.headers["Authorization"];

    // Extract the user data from the request
    const userData = JSON.parse(event.headers["X-User-Data"] as string);
    // Construct the data-check-string
    const dataCheckString = Object.keys(userData)
      .filter((key) => key !== "hash")
      .sort()
      .map((key) => `${key}=${userData[key]}`)
      .join("\n");

    const secretKey = crypto
      .createHash("sha256")
      .update(process.env.BOT_TOKEN as string)
      .digest();

    // Calculate HMAC-SHA-256 signature
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (hmac === token) {
      return generatePolicy("user", "Allow", event.methodArn);
    } else {
      return generatePolicy("user", "Deny", event.methodArn);
    }
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
