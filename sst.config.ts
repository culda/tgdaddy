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
          username: "string",
        },
        primaryIndex: { partitionKey: "id" },
        globalIndexes: {
          UsernameIndex: {
            partitionKey: "username",
          },
        },
      });

      const usersTable = new Table(stack, "Users", {
        fields: {
          id: "string",
        },
        primaryIndex: { partitionKey: "id" },
      });

      const stripeWebhookHandler = new Function(stack, "StripeWebhookHandler", {
        handler: "functions/stripeWebhook/handler.handler",
        bind: [usersTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
        environment: {
          STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
        },
      });

      const stripeConnectWebhookHandler = new Function(
        stack,
        "StripeConnectWebhookHandler",
        {
          handler: "functions/stripeConnectWebhook/handler.handler",
          bind: [usersTable],
          permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
          environment: {
            STRIPE_CONNECT_WEBHOOK_SECRET: process.env
              .STRIPE_CONNECT_WEBHOOK_SECRET as string,
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
          },
        }
      );

      const webhookHandler = new Function(stack, "WebhookHandler", {
        handler: "functions/webhook/handler.handler",
        bind: [chatsTable, channelsTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
        environment: {
          BOT_TOKEN: process.env.BOT_TOKEN as string,
        },
      });

      const channelsHandler = new Function(stack, "ChannelsHandler", {
        handler: "functions/channels/handler.handler",
        bind: [channelsTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
      });

      const userHandler = new Function(stack, "UserHandler", {
        handler: "functions/user/handler.handler",
        bind: [usersTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
      });

      const telegramAuthHandler = new Function(stack, "TelegramAuthHandler", {
        handler: "functions/telegramAuth/handler.handler",
        environment: {
          BOT_TOKEN: process.env.BOT_TOKEN as string,
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
        },
      });

      const loginHandler = new Function(stack, "LoginHandler", {
        handler: "functions/login/handler.handler",
        bind: [usersTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
        environment: {
          BOT_TOKEN: process.env.BOT_TOKEN as string,
        },
      });

      const api = new Api(stack, "Api", {
        authorizers: {
          telegramAuth: {
            type: "lambda",
            function: telegramAuthHandler,
          },
        },
        defaults: {
          authorizer: "telegramAuth",
        },
        routes: {
          "POST /stripeWebhook": {
            function: stripeWebhookHandler,
            authorizer: "none", // auth is handled inside the function
          },
          "POST /stripeConnectWebhook": {
            function: stripeConnectWebhookHandler,
            authorizer: "none", // auth is handled inside the function
          },
          "POST /webhook": {
            function: webhookHandler,
            authorizer: "none",
          },
          "POST /channels": channelsHandler,
          "GET /channels": channelsHandler,
          "POST /user": userHandler,
          "GET /user": userHandler,
          "POST /login": {
            function: loginHandler,
            authorizer: "none",
          },
        },
      });

      const site = new NextjsSite(stack, "site", {
        bind: [api],
        environment: {
          NEXT_PUBLIC_API_ENDPOINT: api.url, // available on the client
          API_ENDPOINT: api.url, // available on the server
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
        ApiEndpoint: api.url,
      });
    });
  },
} satisfies SSTConfig;
