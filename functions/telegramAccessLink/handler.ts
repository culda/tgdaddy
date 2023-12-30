import { ApiResponse, checkNull } from '@/functions/errors';
import { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { StTelegramProduct } from '../../app/model/types';
import { AuthorizerContext } from '../jwtAuth/handler';
import { lambdaWrapperAuth } from '../lambdaWrapper';
import { dbGetSubscription, ddbGetProductById } from '../utils';
import { Telegram } from 'puregram';

export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<
  AuthorizerContext
> = async (event) => {
  return lambdaWrapperAuth(event, async (userId: string) => {
    switch (event.requestContext.http.method) {
      case 'GET': {
        const productId = checkNull(
          event.queryStringParameters?.productId,
          400
        );
        const product = checkNull(await ddbGetProductById(productId), 400);
        const sub = await dbGetSubscription(userId, product.pageId);
        if (!sub) {
          return ApiResponse({
            status: 400,
            message: 'Subscription not found',
          });
        }

        if (product.productType !== 'telegramAccess') {
          return ApiResponse({
            status: 400,
            message: 'Not a telegram access product',
          });
        }

        const tgProduct = product as StTelegramProduct;

        if (!tgProduct.channelId || !tgProduct.active) {
          return ApiResponse({
            status: 400,
            message: 'Telegram channel not ready',
          });
        }

        // Subscription found, produce invite link
        const telegram = Telegram.fromToken(process.env.BOT_TOKEN as string);
        const inviteLink = await telegram.api.createChatInviteLink({
          chat_id: tgProduct.channelId,
          member_limit: 1,
        });
        return ApiResponse({
          status: 200,
          body: {
            accessLink: inviteLink.invite_link,
          },
        });
      }
      default:
        return ApiResponse({
          status: 405,
        });
    }
  });
};
