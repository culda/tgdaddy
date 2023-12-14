"use client";
import {
  TpSubscribeRequest,
  TpSubscribeResponse,
} from "../api/stripe/subscribe/route";
import {
  StChannel,
  StChannelPrice,
  StConsumerSubscription,
  StPriceFrequency,
} from "../model/types";
import Button from "../components/Button";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useSnackbar } from "../components/SnackbarProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PpChannel = {
  channel?: StChannel;
  sub?: StConsumerSubscription;
  link?: string;
};

export default function Channel({ channel, sub, link }: PpChannel) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const snack = useSnackbar();

  useEffect(() => {
    if (!channel?.pricing) {
      snack({
        key: "channel-no-pricing",
        text: "Not verified",
        variant: "error",
      });
    }
  }, [snack, channel?.pricing]);

  const joinChannel = async (price: StChannelPrice) => {
    setIsLoading(true);

    const joinRes = await fetch("/api/stripe/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelId: channel?.id,
        price,
        redirectUrl: window.location.href,
      } as TpSubscribeRequest),
    });

    const { paymentLink } = (await joinRes.json()) as TpSubscribeResponse;

    setIsLoading(false);
    router.push(paymentLink);
  };

  const cancelMembership = async () => {
    setIsLoading(true);
    const res = await fetch("/api/stripe/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creatorUserId: channel?.userId,
        channelId: channel?.id,
      }),
    });

    if (res.status === 200) {
      snack({
        key: "channel-cancel",
        text: "Canceled",
        variant: "success",
      });
    } else {
      snack({
        key: "channel-cancel",
        text: "Failed",
        variant: "error",
      });
    }

    setIsLoading(false);
    router.refresh();
  };

  console.log(channel);

  return (
    <div>
      <section class="text-gray-600 body-font">
        <div class="container mx-auto flex px-5 py-8 items-center justify-center flex-col">
          <img
            class="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded"
            alt="hero"
            src={channel?.imagePath}
          />
          <div class="text-center lg:w-2/3 w-full">
            <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              {channel?.title}
            </h1>
            <p class="mb-8 leading-relaxed">{channel?.description}</p>
            {sub && link && (
              <div class="flex justify-center">
                <Button href={link} target="_blank">
                  <div class="flex items-center gap-2">
                    Access {channel?.username}
                    <FaArrowRight />
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      <section class="text-gray-600 body-font overflow-hidden">
        <div class="container px-5 py-8 mx-auto">
          <div class="flex flex-wrap -m-4">
            {!sub &&
              channel?.pricing?.map((p) => (
                <div class="p-4 mx-auto max-w-md">
                  <div class="h-full p-6  rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden">
                    <span class="text-sm tracking-widest title-font mb-1 font-medium">
                      {p.frequency === StPriceFrequency.Monthly && "Monthly"}
                      {p.frequency === StPriceFrequency.Yearly && "Yearly"}
                    </span>

                    <header class="text-5xl text-gray-900 pb-4 mb-4 border-b border-gray-200 leading-none">
                      ${(p.usd / 100).toFixed(2)}
                    </header>
                    <p class="flex items-center text-gray-600 mb-2">
                      <span class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                        <FaCheckCircle />
                      </span>
                      Cancel anytime.
                    </p>

                    <Button loading={isLoading} onClick={() => joinChannel(p)}>
                      Join Now
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
      {sub && (
        <section class="text-gray-600 body-font">
          <Button
            loading={isLoading}
            variant="text"
            onClick={() => cancelMembership()}
          >
            Cancel membership
          </Button>
        </section>
      )}
    </div>
  );
}
