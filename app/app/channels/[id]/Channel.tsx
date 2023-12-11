"use client";
import { useSession } from "next-auth/react";
import { StChannel, StPriceFrequency } from "../../../model/types";
import EditableInput from "../../../components/EditableInput";
import { TpUpdateUsername } from "@/functions/channelUsername/handler";
import { Fragment, useCallback, useRef, useState } from "react";
import PriceInput from "../../../components/PriceInput";
import {
  TpPriceRequest,
  TpPriceResponse,
} from "../../../api/stripe/price/route";
import {
  FaMoneyBill,
  FaAddressBook,
  FaSmile,
  FaAtlas,
  FaCopy,
} from "react-icons/fa";
import AddImage from "@/app/components/AddImage";
import { TpSetChannelImageResponse } from "@/functions/setChannelImage/handler";
import { useSnackbar } from "@/app/components/SnackbarProvider";
import ChannelSection from "../ChannelSection";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Button from "@/app/components/Button";

type PpChannel = {
  channel?: StChannel;
  newChannel?: boolean;
};

type TpImage = {
  fileBase64: string;
  fileType: string;
};

export default function Channel({ channel, newChannel }: PpChannel) {
  const snack = useSnackbar();
  const [ch, setCh] = useState(channel);
  const session = useSession();

  console.log(ch);

  const usernameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const priceRef = useRef<HTMLFormElement>(null);

  const [image, setImage] = useState<TpImage | null>(null);

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
    if (newChannel) {
      setImage({ fileBase64, fileType });
      return;
    }

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

  const createChannel = async () => {
    const username = usernameRef.current?.value;
    const description = descriptionRef.current?.value;
    // @ts-expect-error
    const price = priceRef.current.input?.value;
    // @ts-expect-error
    const frequency = priceRef.current.select?.value;
    // const image = imageRef.current?.files?.[0];
    console.log(image);

    if (!username) {
      snack({
        key: "username-required",
        text: "Username is required",
        variant: "error",
      });
      return;
    }

    if (!description) {
      snack({
        key: "description-required",
        text: "Description is required",
        variant: "error",
      });
      return;
    }

    if (!price) {
      snack({
        key: "price-required",
        text: "Price is required",
        variant: "error",
      });
      return;
    }

    const pattern = /^[A-Za-z0-9\-\_]+$/;

    if (!pattern.test(username)) {
      snack({
        key: "username-invalid",
        text: "Username can only contain letters, numbers, and the following characters: - _",
        variant: "error",
      });
      return;
    }

    if (description.length > 255) {
      snack({
        key: "description-invalid",
        text: "Description cannot exceed 255 characters",
        variant: "error",
      });
      return;
    }

    const parsedPrice = parseFloat(price);
    const decimalCount = (price.split(".")[1] || "").length;

    if (isNaN(parsedPrice)) {
      snack({
        key: "price-invalid",
        text: "Price must be a valid number for the price",
        variant: "error",
      });
      return;
    }

    if (decimalCount > 2) {
      snack({
        key: "price-invalid",
        text: "Price can only have up to 2 decimal places",
        variant: "error",
      });
      return;
    }

    if (!frequency) {
      snack({
        key: "frequency-required",
        text: "Frequency is required",
        variant: "error",
      });
      return;
    }

    // if (!image) {
    //   snack({
    //     key: "image-required",
    //     text: "Please choose an image",
    //     variant: "error",
    //   });
    //   return;
    // }

    const newChannelRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/channels`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify({
          id: ch?.id,
          userId: session.data?.user?.id,
          priceUsd: parsedPrice * 100,
          frequency,
          description,
          username,
        } as StChannel),
      }
    );

    console.log(newChannelRes);
  };

  // const copyCode = () => {
  //   if (!channel?.telegramLinkCode) {
  //     return;
  //   }
  //   navigator.clipboard.writeText(channel?.telegramLinkCode);
  //   snack({
  //     key: "code-copied",
  //     text: "Code copied",
  //     variant: "success",
  //   });
  // };

  return (
    <div class="text-gray-600 body-font">
      <div class="container pt-5 mx-auto flex flex-wrap">
        <ChannelSection isFirstSection>
          <h2 class="font-bold title-font text-gray-900 mb-1 text-xl">
            Username
          </h2>
          <p class="leading-relaxed">
            This is the public address of your channel.
          </p>
          <div class="mt-6">
            <EditableInput
              ref={usernameRef}
              editMode={newChannel}
              defaultValue={ch?.username}
              onSave={newChannel ? undefined : setUsername}
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
              ref={descriptionRef}
              editMode={newChannel}
              textarea
              defaultValue={ch?.description}
              onSave={newChannel ? undefined : setDescription}
            />
          </div>
        </ChannelSection>

        <ChannelSection>
          <h2 class="font-bold title-font text-gray-900 mb-1 text-xl">
            Pricing
          </h2>
          <p class="leading-relaxed">
            You can update prices anytime. Current memberships are not affected
          </p>
          <div>
            {!ch?.pricing && (
              <div class="mt-6">
                <PriceInput
                  ref={priceRef}
                  editMode={newChannel}
                  defaultFrequency={StPriceFrequency.Monthly}
                  defaultPrice=""
                  onSave={
                    newChannel
                      ? undefined
                      : (price, frequency) => setPrice(price, frequency)
                  }
                />
              </div>
            )}
            {ch?.pricing?.map((p) => (
              <div class="mt-6">
                <PriceInput
                  ref={priceRef}
                  defaultPrice={(p.usd / 100).toFixed(2)}
                  defaultFrequency={p.frequency}
                  onSave={
                    newChannel
                      ? undefined
                      : (price, frequency) => setPrice(price, frequency)
                  }
                />
              </div>
            ))}
          </div>
        </ChannelSection>

        <ChannelSection isLastSection>
          <h2 className="font-bold title-font text-gray-900 mb-1 text-xl">
            Profile
          </h2>
          <p className="leading-relaxed">
            Add an image to showcase your channel.
          </p>
          <div className="mt-6">
            <AddImage
              currentImagePath={ch?.imagePath}
              onSave={setChannelImage}
              saveOnChange={newChannel}
            />
          </div>
        </ChannelSection>

        {newChannel && (
          <Fragment>
            {/* <ChannelSection>
              <div class="flex flex-col gap-2">
                <h2 class="font-bold title-font text-gray-900 mb-1 text-xl">
                  Telegram
                </h2>
                <p>
                  Add <b>tgdaddybot</b> as an admin to your channel. Create a
                  new channel if you don't have one
                </p>
                <p className="text-black text-base text-left flex-1">
                  <b>Note:</b> You only need to enable <i>Add Members</i>
                </p>
              </div>
            </ChannelSection>

            <ChannelSection isLastSection>
              <h2 class="font-bold title-font text-gray-900 mb-1 text-xl">
                Connection
              </h2>
              <p> Copy and paste the below code in your channel </p>
              <div className="text-black text-base text-left flex-1">
                <div className="relative text-black text-center text-sm whitespace-nowrap rounded-md justify-center items-center border border-zinc-300 bg-neutral-50 grow py-2.5 border-solid px-1 md:px-5">
                  {channel?.telegramLinkCode}
                  <div className="absolute right-4 inset-y-0 flex items-center">
                    <button onClick={copyCode}>
                      <FaCopy className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            </ChannelSection> */}
            <Button onClick={createChannel}>Submit</Button>
          </Fragment>
        )}
      </div>
    </div>
  );
}
