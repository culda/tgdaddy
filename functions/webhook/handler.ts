import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { Telegram } from 'puregram';
import { TelegramUpdate } from 'puregram/generated';
import { Table } from 'sst/node/table';

const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);
const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event.body);
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

  if (context?.is('channel_post')) {
    const { text, chat } = context;

    if (text?.startsWith('LINK-')) {
      const { Item } = await dynamoDb.send(
        new GetItemCommand({
          TableName: Table.TelegramLinkCodes.tableName,
          Key: marshall({ code: text }),
        })
      );

      if (Item) {
        // const { code, pageId, productId } = unmarshall(
        //   Attributes
        // ) as StTelegramLinkCode;

        await dynamoDb.send(
          new UpdateItemCommand({
            TableName: Table.TelegramLinkCodes.tableName,
            Key: marshall({ code: text }),
            UpdateExpression: 'SET channelId = :channelId',
            ExpressionAttributeValues: {
              ':channelId': { S: String(chat.id) },
            },
          })
        );
      }
    }
  }
}
