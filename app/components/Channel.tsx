"use client";
import { useSession } from "next-auth/react";
import { StChannel, StPriceFrequency } from "../model/types";
import EditableInput from "./EditableInput";
import { TpUpdateUsername } from "@/functions/channelUsername/handler";
import { useCallback, useState } from "react";
import PriceInput from "./PriceInput";
import { TpPriceRequest, TpPriceResponse } from "../api/stripe/price/route";

type PpChannel = {
  channel?: StChannel;
};

export default function Channel({ channel }: PpChannel) {
  const [ch, setCh] = useState(channel);
  const session = useSession();
  const setUsername = useCallback(
    async (username: string) => {
      const pattern = /^[A-Za-z0-9\-\_]+$/;

      if (!pattern.test(username)) {
        throw new Error(
          "Username can only contain letters, numbers, and the following characters: - _"
        );
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/channelUsername`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify({
          id: ch?.id,
          oldUsername: ch?.username,
          newUsername: username,
        } as TpUpdateUsername),
      });

      setCh({ ...ch, username: username } as StChannel);
    },
    [session.data?.accessToken]
  );

  const setDescription = useCallback(
    async (description: string) => {
      if (description.length > 255) {
        throw new Error("Description cannot exceed 255 characters");
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify({
          id: ch?.id,
          description: description,
        }),
      });

      setCh({ ...ch, description: description } as StChannel);
    },
    [session.data?.accessToken]
  );

  const setPrice = useCallback(
    async (price: string, frequency: StPriceFrequency) => {
      const parsedPrice = parseFloat(price);
      const decimalCount = (price.split(".")[1] || "").length;

      if (isNaN(parsedPrice)) {
        throw new Error("Price must be a valid number");
      }

      if (decimalCount > 2) {
        throw new Error("Price can only have up to 2 decimal places");
      }

      const priceRes = await fetch("/api/stripe/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelUserId: ch?.userId,
          channelId: ch?.id,
          priceUsd: parsedPrice * 100,
          frequency,
          username: ch?.username,
        } as TpPriceRequest),
      });

      const { pricing, needsStripeConnect } =
        (await priceRes.json()) as TpPriceResponse;

      if (needsStripeConnect) {
        window.location.href = "/app/plan";
        return;
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify({
          id: ch?.id,
          pricing,
        }),
      });

      setCh({ ...ch, pricing } as StChannel);
    },
    [session.data?.accessToken]
  );

  return (
    <section class="text-gray-600 body-font">
      <div class="container py-24 mx-auto flex flex-wrap">
        <div class="flex flex-grow relative pb-20 sm:items-center">
          <div class="h-full w-20 absolute inset-0 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-200 pointer-events-none"></div>
            <div class="flex-shrink-0 w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center absolute -translate-y-2/4">
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-grow pl-24 flex sm:items-center items-start flex-col sm:flex-row">
            <div class="flex-grow sm:pl-6 mt-6 sm:mt-0 gap-2">
              <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
                Username
              </h2>
              <p class="leading-relaxed">
                This is the public address of your channel.
              </p>
              <div class="mt-6">
                <EditableInput
                  defaultValue={ch?.username}
                  onSave={(v) => setUsername(v)}
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-grow relative pb-20 sm:items-center">
          <div class="h-full w-20 absolute inset-0 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-200 pointer-events-none"></div>
            <div class="flex-shrink-0 w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center absolute -translate-y-2/4">
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-grow pl-24 flex sm:items-center items-start flex-col sm:flex-row">
            <div class="flex-grow sm:pl-6 mt-6 sm:mt-0 gap-2">
              <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
                Description
              </h2>
              <p class="leading-relaxed">
                Pitch your channel to your audience.
              </p>
              <div class="mt-6">
                <EditableInput
                  textarea
                  defaultValue={ch?.description}
                  onSave={(v) => setDescription(v)}
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-grow relative pb-20 sm:items-center">
          <div class="h-full w-20 absolute inset-0 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-200 pointer-events-none"></div>
            <div class="flex-shrink-0 w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center absolute -translate-y-2/4">
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-grow pl-24 flex sm:items-center items-start flex-col sm:flex-row">
            <div class="flex-grow sm:pl-6 mt-6 sm:mt-0 gap-2">
              <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
                Pricing
              </h2>
              <p class="leading-relaxed">
                You can update prices anytime. Current memberships are not
                affected
              </p>
              <div>
                {!ch?.pricing && (
                  <div class="mt-6">
                    <PriceInput
                      editMode
                      defaultFrequency={StPriceFrequency.Monthly}
                      defaultPrice=""
                      onSave={(price, frequency) => setPrice(price, frequency)}
                    />
                  </div>
                )}
                {ch?.pricing?.map((p) => (
                  <div class="mt-6">
                    <PriceInput
                      defaultPrice={(p.usd / 100).toFixed(2)}
                      defaultFrequency={p.frequency}
                      onSave={(price, frequency) => setPrice(price, frequency)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
