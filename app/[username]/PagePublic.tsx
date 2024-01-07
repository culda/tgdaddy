'use client';
import {
  TpJoinPageRequest,
  TpJoinPageResponse,
} from '@/functions/joinPage/handler';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaArrowRight, FaLock } from 'react-icons/fa';
import Button from '../components/Button';
import FormattedText from '../components/FormattedText';
import { useSnackbar } from '../components/SnackbarProvider';
import { StConsumerSubscription, StPage, StProduct } from '../model/types';
import PricingSection from './PricingSection';

type PpPage = {
  page: StPage;
  sub?: StConsumerSubscription;
  link?: string;
  products?: StProduct[];
};

export default function PagePublic({ page, products, sub }: PpPage) {
  const session = useSession();
  const router = useRouter();
  const snack = useSnackbar();

  const joinPage = async (priceId: string) => {
    const joinRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/joinPage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify({
          pageId: page?.id,
          priceId,
          redirectUrl: window.location.href,
        } as TpJoinPageRequest),
      }
    );

    const data = await joinRes.json();

    if (!joinRes.ok) {
      snack({
        key: 'page-join',
        text: data.message,
        variant: 'error',
      });
      return;
    }

    const { paymentLink } = data as TpJoinPageResponse;

    router.push(paymentLink);
  };

  const goToChannel = async (productId: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/telegramAccessLink?productId=${productId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      snack({
        key: 'page-join',
        text: data.message,
        variant: 'error',
      });
      return;
    }

    const { accessLink } = data;
    window.open(accessLink, '_blank');
  };

  return (
    <div>
      {/* Header */}
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-8 items-center justify-center flex-col">
          <div className="relative">
            <img
              className="w-64 h-64 object-center rounded-full object-cover"
              alt="hero"
              src={page?.imagePath ?? '/images/page-default.webp'}
            />
            <div className="absolute inset-0 rounded-full border-4 border-white shadow-xl"></div>
          </div>
        </div>
        <h1 className="title-font text-center sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
          {page?.title}
        </h1>
      </section>

      <section>
        <div className="p-4">
          {products?.map((product, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-md flex flex-row gap-2 justify-between items-center p-4 shadow-xl relative" // Add 'relative' class
            >
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{product.title}</h2>
                <p className="text-gray-600">
                  <FormattedText text={product.description} />
                </p>
              </div>
              {!sub ? (
                <FaLock className="text-2xl" />
              ) : (
                <Button
                  className="max-w-20"
                  disabled={!sub}
                  onClick={() => goToChannel(product.id)}
                >
                  <FaArrowRight />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      {!sub && <PricingSection prices={page.prices} join={joinPage} />}

      {sub && (
        <section className="text-gray-400 text-sm px-8 pb-16">
          <p>
            If you want to cancel your subscription, please reach out to us at{' '}
            <a href="mailto:support@members.page" target="_blank">
              support@members.page
            </a>
            . Please quote your membership ID{' '}
            <u>{sub.consumerStripeSubscriptionId}</u>.
          </p>
        </section>
      )}
      {!sub && (
        <section className="text-gray-400 text-sm px-8 pb-16">
          <p>
            By subscribing you are agreeing to our{' '}
            <a href="/privacyPolicy" target="_blank" className="underline">
              privacy policy
            </a>
            . The subscription is managed by Stripe and you can cancel anytime.
          </p>
        </section>
      )}
    </div>
  );
}
