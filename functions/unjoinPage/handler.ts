import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from "aws-lambda";
import { ddbGetPageById, ddbGetUserById } from "../utils";
import Stripe from "stripe";
import { AuthorizerContext } from "../jwtAuth/handler";
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { Table } from "sst/node/table";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { StConsumerSubscription } from "@/app/model/types";
import { Telegram } from "puregram";

const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);
const client = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export type TpUnjoinChannelRequest = {
  pageId: string;
};

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  const userId = event.requestContext.authorizer.lambda.userId;
  if (!userId) {
    return {
      statusCode: 403,
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
    };
  }

  const { pageId } = JSON.parse(event.body) as TpUnjoinChannelRequest;

  const page = await ddbGetPageById(pageId);
  if (!page) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Channel not found" }),
    };
  }
  const creatorUserId = page.userId;
  const creatorUser = await ddbGetUserById(creatorUserId);
  const subId = `${userId}/${pageId}`;
  const sub = await ddbGetSub(subId);

  await client.subscriptions.cancel(
    sub?.consumerStripeSubscriptionId as string,
    {
      stripeAccount: creatorUser?.creatorStripeAccountId as string,
    }
  );

  // kick user from channel
  // try {
  //   await telegram.api.kickChatMember(channel.channelId, userId);
  // } catch (err) {
  //   console.log(err);
  // }

  return {
    statusCode: 200,
  };
};

async function ddbGetSub(
  id: string
): Promise<StConsumerSubscription | undefined> {
  const params: GetItemCommandInput = {
    TableName: Table.ConsumerSubscriptions.tableName,
    Key: marshall({ id }),
  };

  const res = await dynamoDb.send(new GetItemCommand(params));
  return res.Item
    ? (unmarshall(res.Item) as StConsumerSubscription)
    : undefined;
}
