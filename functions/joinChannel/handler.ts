import { TpSubscribeRequest } from "@/app/api/stripe/subscribe/route";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { dbGetUserById } from "../utils";
import Stripe from "stripe";

export const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is required" }),
    };
  }
  const req = JSON.parse(event.body) as TpSubscribeRequest;

  const user = await dbGetUserById(req.channelUserId);
  const stripeAccountId = user?.stripeAccountId;

  if (!stripeAccountId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No Stripe account found" }),
    };
  }

  const products = await client.products.list(
    {
      ids: [req.channelId],
    },
    {
      stripeAccount: stripeAccountId,
    }
  );

  if (products.object === "list" && products.data.length > 0) {
  } else {
    await client.products.create(
      {
        name: `Subscribe to ${req.username}`,
        id: req.channelId,
      },
      {
        stripeAccount: stripeAccountId,
      }
    );
  }

  console.log(products);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from joinChannel" }),
  };
};
