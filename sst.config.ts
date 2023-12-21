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
      // Tables

      const pagesTable = new Table(stack, "Pages", {
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

      const uniquePagesTable = new Table(stack, "UniquePages", {
        fields: {
          username: "string",
        },
        primaryIndex: { partitionKey: "username" },
      });

      const usersTable = new Table(stack, "Users", {
        fields: {
          id: "string",
          telegramId: "string",
        },
        primaryIndex: { partitionKey: "id" },
        globalIndexes: {
          TelegramIdIndex: {
            partitionKey: "telegramId",
          },
        },
      });

      const usersCredsTable = new Table(stack, "UsersCreds", {
        fields: {
          email: "string",
        },
        primaryIndex: { partitionKey: "email" },
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

      const pageImagesBucket = new Bucket(stack, "PagesImagesBucket", {
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
          environment: {
            STRIPE_CONNECT_WEBHOOK_SECRET: process.env
              .STRIPE_CONNECT_WEBHOOK_SECRET as string,
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
          },
        }
      );

      const webhookHandler = new Function(stack, "WebhookHandler", {
        handler: "functions/webhook/handler.handler",
        bind: [pagesTable, uniquePagesTable, telegramLinkCodesTable],
        environment: {
          BOT_TOKEN: process.env.BOT_TOKEN as string,
        },
      });

      const pageHandler = new Function(stack, "PageHandler", {
        handler: "functions/page/handler.handler",
        bind: [pagesTable, uniquePagesTable],
      });

      const pagesHandler = new Function(stack, "PagesHandler", {
        handler: "functions/pages/handler.handler",
        bind: [
          pagesTable,
          uniquePagesTable,
          telegramLinkCodesTable,
          pageImagesBucket,
        ],
      });

      const joinPageHandler = new Function(stack, "JoinPageHandler", {
        handler: "functions/joinPage/handler.handler",
        bind: [pagesTable, usersTable],
        environment: {
          STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
        },
      });

      const unjoinPageHandler = new Function(stack, "UnjoinPageHandler", {
        handler: "functions/unjoinPage/handler.handler",
        bind: [consumerSubscriptionsTable, usersTable],
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
        bind: [consumerSubscriptionsTable, pagesTable],
      });

      const adminAuthHandler = new Function(stack, "AdminAuthHandler", {
        handler: "functions/adminAuth/handler.handler",
        environment: {
          ADMIN_AUTH_TOKEN: process.env.ADMIN_AUTH_TOKEN as string,
        },
      });

      const loginTelegramHandler = new Function(stack, "LoginTelegramHandler", {
        handler: "functions/loginTelegram/handler.handler",
        bind: [usersTable],
        environment: {
          BOT_TOKEN: process.env.BOT_TOKEN as string,
        },
      });

      const loginHandler = new Function(stack, "LoginHandler", {
        handler: "functions/login/handler.handler",
        bind: [usersTable, usersCredsTable],
      });

      const forgotPasswordHandler = new Function(
        stack,
        "ForgotPasswordHandler",
        {
          handler: "functions/forgotPassword/handler.handler",
          bind: [usersCredsTable],
          environment: {
            MAILGUN_API_KEY: process.env.MAILGUN_API_KEY as string,
          },
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
        customDomain:
          stack.stage === "production"
            ? "api.members.page"
            : "api-dev.members.page",
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
          "POST /pages": pagesHandler,
          "GET /pages": pagesHandler,
          "PUT /pages": pagesHandler,
          "GET /pages/{username}": {
            function: pageHandler,
            authorizer: "none",
          },
          "POST /user": userHandler,
          "GET /user": userHandler,
          "POST /subscriptions": subscriptionsHandler,
          "POST /forgotPassword": {
            function: forgotPasswordHandler,
            authorizer: "none",
          },
          "POST /login": {
            function: loginHandler,
            authorizer: "none",
          },
          "POST /loginTelegram": {
            function: loginTelegramHandler,
            authorizer: "none",
          },

          // Consumer endpoints
          "POST /joinPage": joinPageHandler,
          "POST /unjoinPage": unjoinPageHandler,
        },
      });

      const site = new NextjsSite(stack, "site", {
        bind: [api],
        environment: {
          NEXT_PUBLIC_API_ENDPOINT: api.url, // available on the client
          API_ENDPOINT: api.url, // available on the server
        },
        customDomain:
          stack.stage === "production" ? "members.page" : "dev.members.page",
      });

      stack.addOutputs({
        SiteUrl: site.url,
        ApiEndpoint: api.url,
      });
    });
  },
} satisfies SSTConfig;
