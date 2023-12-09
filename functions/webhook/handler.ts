import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Keyboard, Telegram, InlineKeyboard } from "puregram";
import { Table } from "sst/node/table";
import { LinkChannelText } from "./utils";
import { TelegramUpdate } from "puregram/generated";
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  StChannel,
  StChat,
  StLinkChat,
  StPriceFrequency,
} from "../../app/model/types";

const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
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

  if (context?.is("message")) {
    const { text, chat, forwardedMessage } = context;
    const stChat = await dbGetActiveChat(chat.id);

    if (text === "/start") {
      return await telegram.api.sendMessage({
        chat_id: chat.id,
        text: "Welcome to TG Daddy!",
        parse_mode: "Markdown",
        reply_markup: Keyboard.keyboard([
          [Keyboard.textButton(LinkChannelText)],
        ]),
      });
    }

    if (text === LinkChannelText) {
      if (stChat) {
        return await telegram.api.sendMessage({
          chat_id: chat.id,
          text: "Finish or cancel your current action first",
        });
      }
      await dbStartLinkChat(chat.id);
      return await telegram.api.sendMessage({
        chat_id: chat.id,
        text: "Please forward a message from your channel",
        parse_mode: "Markdown",
        reply_markup: InlineKeyboard.keyboard([
          [
            InlineKeyboard.textButton({
              text: "Cancel",
              payload: "cancel",
            }),
          ],
        ]),
      });
    }

    if (forwardedMessage) {
      if (stChat?.type === "link") {
        if (!forwardedMessage.chat) {
          return await telegram.api.sendMessage({
            chat_id: chat.id,
            text: "Can't detect channel. Please forward a message from your channel",
            parse_mode: "Markdown",
          });
        }
        await dbSetChannelInfo(
          chat.id.toString(),
          forwardedMessage.chat?.id.toString(),
          forwardedMessage.chat?.title
        );
        await dbDeleteChat(chat.id);
        const count = await telegram.api.getChatMemberCount({
          chat_id: forwardedMessage.chat.id,
        });
        return await telegram.api.sendMessage({
          chat_id: chat.id,
          text: `Channel linked successfully\n**Title**: ${forwardedMessage.chat?.title}\n**ID**: ${forwardedMessage.chat.id}\n**Users**: ${count}`,
          parse_mode: "Markdown",
        });
      }
    }
  }

  if (context?.is("callback_query")) {
    const { data, id, senderId } = context;
    await telegram.api.answerCallbackQuery({
      callback_query_id: id,
    });
    if (data === "cancel") {
      await dbDeleteChat(senderId);
      return await telegram.api.sendMessage({
        chat_id: senderId,
        text: "Action cancelled",
      });
    }
  }
}

async function dbDeleteChat(id: number) {
  await dynamoDb.send(
    new DeleteItemCommand({
      TableName: Table.Chats.tableName,
      Key: marshall({ id }),
    })
  );
}

async function dbStartLinkChat(id: number) {
  const chat: StLinkChat = {
    id,
    type: "link",
  };
  await dynamoDb.send(
    new PutItemCommand({
      TableName: Table.Chats.tableName,
      Item: marshall(chat),
    })
  );
}

async function dbSetChannelInfo(
  id: string,
  channelId: string,
  title: string | undefined
) {
  const username = title
    ? encodeURIComponent(title.replace(/\s/g, "").replace(/[^\w-]/g, ""))
    : undefined;

  const channel: StChannel = {
    id: channelId,
    userId: id,
    title,
    username,
  };
  await dynamoDb.send(
    new PutItemCommand({
      TableName: Table.Channels.tableName,
      Item: marshall(channel),
    })
  );
}

async function dbGetActiveChat(id: number): Promise<StChat | undefined> {
  const { Item } = await dynamoDb.send(
    new GetItemCommand({
      TableName: Table.Chats.tableName,
      Key: {
        id: {
          N: `${id}`,
        },
      },
    })
  );

  if (!Item) {
    return undefined;
  }

  return unmarshall(Item) as StChat;
}
