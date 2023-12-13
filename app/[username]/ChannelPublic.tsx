"use client";
import {
  StChannel,
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
  TpJoinChannelRequest,
  TpJoinChannelResponse,
} from "@/functions/joinChannel/handler";
import { TpUnjoinChannelRequest } from "@/functions/unjoinChannel/handler";

type PpChannel = {
  channel?: StChannel;
  sub?: StConsumerSubscription;
  link?: string;
};

export default function Channel({ channel, sub, link }: PpChannel) {
  const session = useSession();
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

  const joinChannel = async (priceId: string) => {
    setIsLoading(true);
    const joinRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/joinChannel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify({
          channelId: channel?.id,
          priceId,
          redirectUrl: window.location.href,
        } as TpJoinChannelRequest),
      }
    );

    console.log("res", joinRes);

    const { paymentLink } = (await joinRes.json()) as TpJoinChannelResponse;

    setIsLoading(false);
    router.push(paymentLink);
  };

  const cancelMembership = async () => {
    setIsLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/unjoinChannel`,
      {
        method: "POST",
        body: JSON.stringify({
          channelId: channel?.id,
        } as TpUnjoinChannelRequest),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.data?.accessToken}`,
        },
      }
    );

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

                    <Button
                      loading={isLoading}
                      onClick={() => joinChannel(p.id)}
                    >
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
