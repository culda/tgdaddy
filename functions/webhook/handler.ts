import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Keyboard, Telegram, InlineKeyboard, APIError } from "puregram";
import { Table } from "sst/node/table";
import { LinkChannelText } from "./utils";
import { TelegramUpdate } from "puregram/generated";
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  TransactWriteItemsCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { StChannel, StChat, StLinkChat } from "../../app/model/types";

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

    // const stChat = await dbGetActiveChat(chat.id);

    // if (text === "/start") {
    //   return await telegram.api.sendMessage({
    //     chat_id: chat.id,
    //     text: "Welcome to TG Daddy!",
    //     parse_mode: "Markdown",
    //     reply_markup: Keyboard.keyboard([
    //       [Keyboard.textButton(LinkChannelText)],
    //     ]),
    //   });
    // }

    // if (text === LinkChannelText) {
    //   if (stChat) {
    //     return await telegram.api.sendMessage({
    //       chat_id: chat.id,
    //       text: "Finish or cancel your current action first",
    //     });
    //   }
    //   await dbStartLinkChat(chat.id);
    //   return await telegram.api.sendMessage({
    //     chat_id: chat.id,
    //     text: "Please forward a message from your channel",
    //     parse_mode: "Markdown",
    //     reply_markup: InlineKeyboard.keyboard([
    //       [
    //         InlineKeyboard.textButton({
    //           text: "Cancel",
    //           payload: "cancel",
    //         }),
    //       ],
    //     ]),
    //   });
    // }

    // if (forwardedMessage) {
    //   if (stChat?.type === "link") {
    //     if (!forwardedMessage.chat) {
    //       return await telegram.api.sendMessage({
    //         chat_id: chat.id,
    //         text: "Can't detect channel. Please forward a message from your channel",
    //         parse_mode: "Markdown",
    //       });
    //     }

    //     try {
    //       const channelId = forwardedMessage.chat?.id.toString();
    //       const channel = await ddbGetChannelById(channelId);

    //       if (!!channel) {
    //         return await telegram.api.sendMessage({
    //           chat_id: chat.id,
    //           text: "Channel already linked",
    //           parse_mode: "Markdown",
    //         });
    //       }

    //       const count = await telegram.api.getChatMemberCount({
    //         chat_id: forwardedMessage.chat.id,
    //       });

    //       await dbSetChannelInfo(
    //         chat.id.toString(),
    //         forwardedMessage.chat?.id.toString(),
    //         forwardedMessage.chat?.title
    //       );

    //       return await telegram.api.sendMessage({
    //         chat_id: chat.id,
    //         text: `Channel linked successfully\n**Title**: ${forwardedMessage.chat?.title}\n**ID**: ${forwardedMessage.chat.id}\n**Users**: ${count}`,
    //         parse_mode: "Markdown",
    //       });
    //     } catch (err) {
    //       console.log(err);
    //       if (err instanceof APIError) {
    //         await telegram.api.sendMessage({
    //           chat_id: chat.id,
    //           text: err.message,
    //           parse_mode: "Markdown",
    //         });
    //       }
    //     } finally {
    //       return await dbDeleteChat(chat.id);
    //     }
    //   }
    // }
  }

  // if (context?.is("callback_query")) {
  //   const { data, id, senderId } = context;
  //   await telegram.api.answerCallbackQuery({
  //     callback_query_id: id,
  //   });
  //   if (data === "cancel") {
  //     await dbDeleteChat(senderId);
  //     return await telegram.api.sendMessage({
  //       chat_id: senderId,
  //       text: "Action cancelled",
  //     });
  //   }
  // }
}

// async function dbDeleteChat(id: number) {
//   await dynamoDb.send(
//     new DeleteItemCommand({
//       TableName: Table.Chats.tableName,
//       Key: marshall({ id }),
//     })
//   );
// }

// async function dbStartLinkChat(id: number) {
//   const chat: StLinkChat = {
//     id,
//     type: "link",
//   };
//   await dynamoDb.send(
//     new PutItemCommand({
//       TableName: Table.Chats.tableName,
//       Item: marshall(chat),
//     })
//   );
// }

// async function dbSetChannelInfo(
//   id: string,
//   channelId: string,
//   title: string | undefined
// ) {
//   const username = title
//     ? encodeURIComponent(
//         title
//           .replace(/\s/g, "")
//           .replace(/[^\w-]/g, "")
//           .concat(channelId)
//       )
//     : channelId;

//   const channel: StChannel = {
//     id: channelId,
//     userId: id,
//     title,
//     username,
//   };

//   await dynamoDb.send(
//     new TransactWriteItemsCommand({
//       TransactItems: [
//         {
//           Put: {
//             TableName: Table.UniqueChannels.tableName,
//             Item: marshall({ username, channelId }),
//             ConditionExpression: "attribute_not_exists(username)",
//           },
//         },
//         {
//           Put: {
//             TableName: Table.Channels.tableName,
//             Item: marshall(channel),
//           },
//         },
//       ],
//     })
//   );
// }

// async function dbGetActiveChat(id: number): Promise<StChat | undefined> {
//   const { Item } = await dynamoDb.send(
//     new GetItemCommand({
//       TableName: Table.Chats.tableName,
//       Key: {
//         id: {
//           N: `${id}`,
//         },
//       },
//     })
//   );

//   if (!Item) {
//     return undefined;
//   }

//   return unmarshall(Item) as StChat;
// }
