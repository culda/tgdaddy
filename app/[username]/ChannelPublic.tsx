"use client";
import {
  TpSubscribeRequest,
  TpSubscribeResponse,
} from "../api/stripe/subscribe/route";
import {
  StChannel,
  StConsumerSubscription,
  StPriceFrequency,
} from "../model/types";
import Button from "../components/Button";
import { FaCheckCircle, FaLock, FaUnlock } from "react-icons/fa";
import {
  TpInviteLinkRequest,
  TpInviteLinkResponse,
} from "../api/channel/inviteLink/route";
import { useSnackbar } from "../components/SnackbarProvider";
import { useEffect } from "react";

type PpChannel = {
  channel?: StChannel;
  sub?: StConsumerSubscription;
  link?: string;
};

export default function Channel({ channel, sub, link }: PpChannel) {
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

  const joinChannel = async (priceId: string) => {
    const joinRes = await fetch("/api/stripe/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creatorUserId: channel?.userId,
        channelId: channel?.id,
        priceId,
        redirectUrl: window.location.href,
      } as TpSubscribeRequest),
    });

    const { paymentLink } = (await joinRes.json()) as TpSubscribeResponse;
    window.location.href = paymentLink;
  };

  console.log(sub);

  return (
    <div>
      <section class="text-gray-600 body-font">
        <div class="container mx-auto flex px-5 py-8 items-center justify-center flex-col">
          <img
            class="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded"
            alt="hero"
            src="https://dummyimage.com/720x600"
          />
          <div class="text-center lg:w-2/3 w-full">
            <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              {channel?.title}
            </h1>
            <p class="mb-8 leading-relaxed">{channel?.description}</p>
            <div class="flex justify-center">
              {!sub && (
                <Button
                  onClick={() =>
                    joinChannel(channel?.pricing?.[0].id as string)
                  }
                >
                  <div class="flex items-center gap-2">
                    Join {channel?.username}
                    <FaLock />
                  </div>
                </Button>
              )}
              {sub && link && (
                <Button href={link} target="_blank">
                  <div class="flex items-center gap-2">
                    Access {channel?.username}
                    <FaUnlock />
                  </div>
                </Button>
              )}
            </div>
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

                    <Button>Access Now</Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}