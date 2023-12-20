"use client";
import {
  StPage,
  StConsumerSubscription,
  StPriceFrequency,
} from "../model/types";
import Button from "../components/Button";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useSnackbar } from "../components/SnackbarProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  TpJoinPageRequest,
  TpJoinPageResponse,
} from "@/functions/joinPage/handler";

type PpPage = {
  page?: StPage;
  sub?: StConsumerSubscription;
  link?: string;
};

export default function PagePublic({ page, sub, link }: PpPage) {
  const session = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const snack = useSnackbar();

  useEffect(() => {
    if (!page?.pricing) {
      snack({
        key: "page-no-pricing",
        text: "Not verified",
        variant: "error",
      });
    }
  }, [snack, page?.pricing]);

  const joinPage = async (priceId: string) => {
    setIsLoading(true);
    const joinRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/joinPage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        key: "page-join",
        text: data.message,
        variant: "error",
      });
      setIsLoading(false);
      return;
    }

    const { paymentLink } = data as TpJoinPageResponse;

    setIsLoading(false);
    router.push(paymentLink);
  };
  return (
    <div>
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-8 items-center justify-center flex-col">
          <img
            className="w-5/6 mb-10 object-cover object-center rounded"
            alt="hero"
            src={page?.imagePath ?? "/images/page-default.webp"}
          />
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              {page?.title}
            </h1>
            <p className="mb-8 leading-relaxed">{page?.description}</p>
            {sub && link && (
              <div className="flex justify-center">
                <Button href={link} target="_blank">
                  <div className="flex items-center gap-2">
                    Access {page?.username}
                    <FaArrowRight />
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="text-gray-600 body-font overflow-hidden">
        <div className="container px-5 py-8 mx-auto">
          <div className="flex flex-wrap -m-4">
            {!sub &&
              page?.pricing?.map((p) => (
                <div key={p.id} className="p-4 mx-auto max-w-md">
                  <div className="h-full p-6  rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden">
                    <span className="text-sm tracking-widest title-font mb-1 font-medium">
                      {p.frequency === StPriceFrequency.Monthly && "Monthly"}
                      {p.frequency === StPriceFrequency.Yearly && "Yearly"}
                    </span>

                    <header className="text-5xl text-gray-900 pb-4 mb-4 border-b border-gray-200 leading-none">
                      ${(p.usd / 100).toFixed(2)}
                    </header>
                    <p className="flex items-center text-gray-600 mb-2">
                      <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                        <FaCheckCircle />
                      </span>
                      Cancel anytime.
                    </p>

                    <Button loading={isLoading} onClick={() => joinPage(p.id)}>
                      Join Now
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
      {sub && (
        <section className="text-gray-400 text-sm px-8">
          <p>
            If you want to cancel your subscription, please reach out to us at{" "}
            <a href="mailto:support@members.page" target="_blank">
              support@members.page
            </a>
            . Please quote your membership ID{" "}
            <u>{sub.consumerStripeSubscriptionId}</u>.
          </p>
        </section>
      )}
    </div>
  );
}