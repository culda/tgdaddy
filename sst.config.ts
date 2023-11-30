import { SSTConfig } from "sst";
import { NextjsSite, Function, Api, Table } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "tgdaddy",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const chatsTable = new Table(stack, "Chats", {
        fields: {
          id: "number",
        },
        primaryIndex: { partitionKey: "id" },
      });

      const channelsTable = new Table(stack, "Channels", {
        fields: {
          id: "string",
          userId: "number",
        },
        primaryIndex: { partitionKey: "id", sortKey: "userId" },
        localIndexes: {
          userId: { sortKey: "userId" },
        },
      });

      const usersTable = new Table(stack, "Users", {
        fields: {
          id: "number",
        },
        primaryIndex: { partitionKey: "id" },
      });

      const webhookHandler = new Function(stack, "WebhookHandler", {
        handler: "functions/webhook/handler.handler",
        bind: [chatsTable, channelsTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
        environment: {
          BOT_TOKEN: process.env.BOT_TOKEN as string,
        },
      });

      const stripeAccountHandler = new Function(stack, "StripeAccountHandler", {
        handler: "functions/stripeAccount/handler.handler",
        bind: [usersTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
      });

      const channelsHandler = new Function(stack, "ChannelsHandler", {
        handler: "functions/channels/handler.handler",
        bind: [channelsTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
      });

      const telegramAuthHandler = new Function(stack, "TelegramAuthHandler", {
        handler: "functions/telegramAuth/handler.handler",
        environment: {
          BOT_TOKEN: process.env.BOT_TOKEN as string,
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
        },
      });

      const api = new Api(stack, "Api", {
        authorizers: {
          telegramAuth: {
            type: "lambda",
            function: telegramAuthHandler,
            resultsCacheTtl: "30 seconds",
          },
        },
        defaults: {
          authorizer: "telegramAuth",
        },
        routes: {
          "POST /webhook": {
            function: webhookHandler,
            authorizer: "none",
          },
          "POST /stripeAccount": stripeAccountHandler,
          "GET /stripeAccount": stripeAccountHandler,
          "GET /channels": channelsHandler,
        },
      });

      const site = new NextjsSite(stack, "site", {
        bind: [api],
        environment: {
          NEXT_PUBLIC_API_ENDPOINT: api.url,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
        ApiEndpoint: api.url,
      });
    });
  },
} satisfies SSTConfig;
