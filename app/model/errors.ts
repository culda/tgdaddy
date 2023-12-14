type ApiResponseParams = {
  status: number;
  body?: any;
  message?: string;
};

// The ApiResponse function
function ApiResponse({ status, body, message }: ApiResponseParams) {
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

export { ApiResponse };
