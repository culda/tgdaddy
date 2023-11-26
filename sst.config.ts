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
      const site = new NextjsSite(stack, "site");

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
      });

      const webhookHandler = new Function(stack, "WebhookHandler", {
        handler: "functions/webhook/handler.handler",
        bind: [chatsTable, channelsTable],
        permissions: ["dynamodb:PutItem", "dynamodb:GetItem"],
      });

      const api = new Api(stack, "Api", {
        defaults: {
          function: {},
        },
        routes: {
          "POST /webhook": webhookHandler,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
        ApiEndpoint: api.url,
      });
    });
  },
} satisfies SSTConfig;
