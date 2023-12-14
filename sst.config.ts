import { SSTConfig } from "sst";
import { NextjsSite, Function, Api, Table, Bucket } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "memberspage",
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

      // Tables

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

      const uniqueChannelsTable = new Table(stack, "UniqueChannels", {
        fields: {
          username: "string",
        },
        primaryIndex: { partitionKey: "username" },
      });

      const usersTable = new Table(stack, "Users", {
        fields: {
          id: "string",
        },
        primaryIndex: { partitionKey: "id" },
      });

      const consumerSubscriptionsTable = new Table(
        stack,
        "ConsumerSubscriptions",
        {
          fields: {
            id: "string",
          },
          primaryIndex: { partitionKey: "id" },
        }
      );

      const telegramLinkCodesTable = new Table(stack, "TelegramLinkCodes", {
        fields: {
          code: "string",
        },
        primaryIndex: { partitionKey: "code" },
      });

      // Buckets

      const channelImagesBucket = new Bucket(stack, "ChannelImagesBucket", {
        cdk: {
          bucket: {
            publicReadAccess: true,
          },
        },
      });

      // Lambdas

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
          bind: [usersTable, consumerSubscriptionsTable],
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
        bind: [
          chatsTable,
          channelsTable,
          uniqueChannelsTable,
          telegramLinkCodesTable,
        ],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
        environment: {
          BOT_TOKEN: process.env.BOT_TOKEN as string,
        },
      });

      const channelHandler = new Function(stack, "ChannelHandler", {
        handler: "functions/channel/handler.handler",
        bind: [channelsTable, uniqueChannelsTable],
        permissions: ["dynamodb:GetItem"],
      });

      const channelsHandler = new Function(stack, "ChannelsHandler", {
        handler: "functions/channels/handler.handler",
        bind: [
          channelsTable,
          uniqueChannelsTable,
          telegramLinkCodesTable,
          channelImagesBucket,
        ],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
      });

      const channelUsernameHandler = new Function(
        stack,
        "ChannelUsernameHandler",
        {
          handler: "functions/channelUsername/handler.handler",
          bind: [channelsTable, uniqueChannelsTable],
          permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
        }
      );

      const joinChannelHandler = new Function(stack, "JoinChannelHandler", {
        handler: "functions/joinChannel/handler.handler",
        bind: [channelsTable, usersTable],
        permissions: ["dynamodb:GetItem"],
        environment: {
          STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
        },
      });

      const unjoinChannelHandler = new Function(stack, "UnjoinChannelHandler", {
        handler: "functions/unjoinChannel/handler.handler",
        bind: [consumerSubscriptionsTable, usersTable],
        permissions: ["dynamodb:GetItem", "dynamodb:PutItem"],
        environment: {
          STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
        },
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

      const subscriptionsHandler = new Function(stack, "SubscriptionsHandler", {
        handler: "functions/subscriptions/handler.handler",
        bind: [consumerSubscriptionsTable, channelsTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
      });

      const adminAuthHandler = new Function(stack, "AdminAuthHandler", {
        handler: "functions/adminAuth/handler.handler",
        environment: {
          ADMIN_AUTH_TOKEN: process.env.ADMIN_AUTH_TOKEN as string,
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

      const setChannelImageHandler = new Function(
        stack,
        "SetChannelImageHandler",
        {
          handler: "functions/setChannelImage/handler.handler",
          bind: [channelsTable, channelImagesBucket],
          permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
        }
      );

      const api = new Api(stack, "Api", {
        authorizers: {
          telegramAuth: {
            type: "lambda",
            function: telegramAuthHandler,
          },
          admin: {
            type: "lambda",
            function: adminAuthHandler,
            identitySource: ["$request.header.admintoken"],
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
          "PUT /channels": channelsHandler,
          "GET /channels/{username}": {
            function: channelHandler,
            authorizer: "none",
          },
          "POST /channelUsername": channelUsernameHandler,
          "POST /user": userHandler,
          "GET /user": userHandler,
          "POST /subscriptions": subscriptionsHandler,
          "POST /login": {
            function: loginHandler,
            authorizer: "none",
          },
          "POST /setChannelImage": setChannelImageHandler,

          // Consumer endpoints
          "POST /joinChannel": joinChannelHandler,
          "POST /unjoinChannel": unjoinChannelHandler,
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
