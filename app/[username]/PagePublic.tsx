'use client';
import {
  TpJoinPageRequest,
  TpJoinPageResponse,
} from '@/functions/joinPage/handler';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FaArrowAltCircleRight,
  FaArrowRight,
  FaCheckCircle,
} from 'react-icons/fa';
import Button from '../components/Button';
import { useSnackbar } from '../components/SnackbarProvider';
import {
  StConsumerSubscription,
  StPage,
  StPriceFrequency,
  StProduct,
} from '../model/types';
import PricingSection from './PricingSection';

type PpPage = {
  page: StPage;
  sub?: StConsumerSubscription;
  link?: string;
  products: StProduct[];
};

export default function PagePublic({ page, products, sub, link }: PpPage) {
  const session = useSession();
  const router = useRouter();
  const snack = useSnackbar();

  console.log(products);

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
          <img
            className="w-5/6 mb-10 object-cover object-center rounded"
            alt="hero"
            src={page?.imagePath ?? '/images/page-default.webp'}
          />
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              {page?.title}
            </h1>
            <p className="mb-8 leading-relaxed">{page?.description}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="p-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-md flex flex-row gap-2 justify-between items-center p-4"
            >
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{product.title}</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>
              {sub && (
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
        <section className="text-gray-400 text-sm px-8">
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
    </div>
  );
}
