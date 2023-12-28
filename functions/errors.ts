import { APIGatewayProxyResultV2 } from "aws-lambda";

type ApiResponseParams = {
  status: number;
  body?: any;
  message?: string;
};

// The ApiResponse function
function ApiResponse({
  status,
  body,
  message,
}: ApiResponseParams): APIGatewayProxyResultV2 {
  if (status >= 400) {
    // Handle error responses
    return {
      statusCode: status,
      body: JSON.stringify({ message: message || "An error occurred" }),
    };
  } else {
    // Handle successful responses
    return {
      statusCode: status,
      body: JSON.stringify(body || {}),
    };
  }
}

export function checkNull<T>(
  value: T | null | undefined,
  statusCode: number
): T {
  if (value === null || value === undefined) {
    throw new Error(
      JSON.stringify({
        statusCode,
        message: "Value is null",
      })
    );
  }
  return value as T;
}

export function checkPermission(
  jwtUserId: string,
  requestUserId: string,
) {
  if (requestUserId !== jwtUserId) {
    throw new Error(
      JSON.stringify({
        403,
        message: "Not authorized",
      })
    );
  }
}

export { ApiResponse };
