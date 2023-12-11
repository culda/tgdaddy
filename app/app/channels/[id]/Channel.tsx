"use client";
import { useSession } from "next-auth/react";
import { StChannel, StPriceFrequency } from "../../../model/types";
import EditableInput from "../../../components/EditableInput";
import { TpUpdateUsername } from "@/functions/channelUsername/handler";
import { useCallback, useState } from "react";
import PriceInput from "../../../components/PriceInput";
import {
  TpPriceRequest,
  TpPriceResponse,
} from "../../../api/stripe/price/route";
import { FaMoneyBill, FaAddressBook, FaSmile, FaAtlas } from "react-icons/fa";
import AddImage from "@/app/components/AddImage";
import { TpSetChannelImageResponse } from "@/functions/setChannelImage/handler";
import { useSnackbar } from "@/app/components/SnackbarProvider";
import ChannelSection from "../ChannelSection";

type PpChannel = {
  channel?: StChannel;
};

export default function Channel({ channel }: PpChannel) {
  const snack = useSnackbar();
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

      snack({
        key: "username-updated",
        text: "Username updated",
        dismissable: false,
        variant: "success",
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

      snack({
        key: "description-updated",
        text: "Description updated",
        variant: "success",
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
        snack({
          key: "stripe-connect",
          text: "You must connect to Stripe before setting a price",
          dismissable: false,
          variant: "error",
        });
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

      snack({
        key: "pricing-updated",
        text: "Pricing updated",
        dismissable: false,
        variant: "success",
      });
      setCh({ ...ch, pricing } as StChannel);
    },
    [session.data?.accessToken]
  );

  const setChannelImage = async (fileBase64: string, fileType: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/setChannelImage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify({
          channelId: ch?.id,
          fileBase64,
          fileType,
        }),
      }
    );

    const { imagePath } = (await res.json()) as TpSetChannelImageResponse;

    setCh({ ...ch, imagePath } as StChannel);
  };

  return (
    <div class="text-gray-600 body-font">
      <div class="container pt-5 mx-auto flex flex-wrap">
        <ChannelSection isFirstSection>
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
        </ChannelSection>
        <ChannelSection>
          <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
            Description
          </h2>
          <p class="leading-relaxed">Pitch your channel to your audience.</p>
          <div class="mt-6">
            <EditableInput
              textarea
              defaultValue={ch?.description}
              onSave={(v) => setDescription(v)}
            />
          </div>
        </ChannelSection>

        <ChannelSection>
          <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
            Pricing
          </h2>
          <p class="leading-relaxed">
            You can update prices anytime. Current memberships are not affected
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
        </ChannelSection>

        <ChannelSection isLastSection>
          <h2 className="font-medium title-font text-gray-900 mb-1 text-xl">
            Profile
          </h2>
          <p className="leading-relaxed">
            Add an image to showcase your channel.
          </p>
          <div className="mt-6">
            <AddImage
              currentImagePath={ch?.imagePath}
              onSave={setChannelImage}
            />
          </div>
        </ChannelSection>
      </div>
    </div>
  );
}
