import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Telegram } from "puregram";
import { Table } from "sst/node/table";
import { TelegramUpdate } from "puregram/generated";
import {
  DeleteItemCommand,
  DynamoDBClient,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);
const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);
  try {
    const update: TelegramUpdate = JSON.parse(event.body as string);
    await handleUpdate(update);
  } catch (err) {
    console.log(err);
  } finally {
    return {
      statusCode: 200,
    };
  }
};

async function handleUpdate(u: TelegramUpdate) {
  const context = await telegram.updates.handleUpdate(u);
  console.log(context);

  if (context?.is("channel_post")) {
    const { text, chat } = context;

    if (text?.startsWith("LINK-")) {
      const { Attributes } = await dynamoDb.send(
        new DeleteItemCommand({
          TableName: Table.TelegramLinkCodes.tableName,
          Key: marshall({ code: text }),
          ReturnValues: "ALL_OLD",
        })
      );

      if (Attributes) {
        const { channelId } = unmarshall(Attributes) as {
          channelId: string;
        };

        await dynamoDb.send(
          new UpdateItemCommand({
            TableName: Table.Channels.tableName,
            Key: marshall({ id: channelId }),
            UpdateExpression: "SET channelId = :channelId",
            ExpressionAttributeValues: {
              ":channelId": { S: chat.id.toString() },
            },
          })
        );
      }
    }
  }
}
