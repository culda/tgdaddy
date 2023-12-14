"use client";
import { useSession } from "next-auth/react";
import { StChannel, StPriceFrequency } from "../../../model/types";
import EditableInput from "../../../components/EditableInput";
import { TpUpdateUsername } from "@/functions/channelUsername/handler";
import { Fragment, useCallback, useRef, useState } from "react";
import PriceInput from "../../../components/PriceInput";
import { useRouter } from "next/navigation";
import AddImage from "@/app/components/AddImage";
import { TpSetChannelImageResponse } from "@/functions/setChannelImage/handler";
import { useSnackbar } from "@/app/components/SnackbarProvider";
import ChannelSection from "./ChannelSection";
import Button from "@/app/components/Button";
import { FaCheckCircle, FaCopy } from "react-icons/fa";
import { nanoid } from "nanoid";

type PpChannel = {
  channel?: Partial<StChannel>;
  newChannel?: boolean;
};

type TpImage = {
  fileBase64: string;
  fileType: string;
};

export default function Channel({ channel, newChannel = false }: PpChannel) {
  const snack = useSnackbar();
  const router = useRouter();
  const [ch, setCh] = useState(channel);
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const priceRef = useRef<HTMLFormElement>(null);
  const [image, setImage] = useState<TpImage | null>(null);

  const enablePayments = async () => {
    const currentUrl = window.location.href;
    router.push(`/app/connect?redirectUrl=${encodeURIComponent(currentUrl)}`);
  };

  const checkTelegram = async () => {
    setIsLoading(true);
    const channelRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/channels?id=${ch?.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
      }
    );

    const { channelId } = (await channelRes.json()).data as StChannel;

    setCh({ ...ch, channelId } as StChannel);
    setIsLoading(false);
  };

  const copyTelegramCode = () => {
    if (!ch?.telegramLinkCode) {
      return;
    }
    navigator.clipboard.writeText(ch.telegramLinkCode);
    snack({
      key: "code-copied",
      text: "Code copied",
      variant: "success",
    });
  };

  const setUsername = useCallback(
    async (username: string) => {
      setIsLoading(true);
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
      setIsLoading(false);
    },
    [session.data?.accessToken]
  );

  const setDescription = useCallback(
    async (description: string) => {
      setIsLoading(true);
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
      setIsLoading(false);
    },
    [session.data?.accessToken]
  );

  const setPrice = useCallback(
    async (price: string, frequency: StPriceFrequency) => {
      setIsLoading(true);
      const parsedPrice = parseFloat(price);
      const decimalCount = (price.split(".")[1] || "").length;

      if (isNaN(parsedPrice)) {
        throw new Error("Price must be a valid number");
      }

      if (decimalCount > 2) {
        throw new Error("Price can only have up to 2 decimal places");
      }

      const pricing = [
        {
          frequency,
          usd: parsedPrice * 100,
        },
      ];

      // const priceRes = await fetch("/api/stripe/price", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     channelUserId: ch?.userId,
      //     channelId: ch?.id,
      //     priceUsd: parsedPrice * 100,
      //     frequency,
      //     username: ch?.username,
      //   } as TpPriceRequest),
      // });

      // const { pricing, needsStripeConnect } =
      //   (await priceRes.json()) as TpPriceResponse;

      // if (needsStripeConnect) {
      //   snack({
      //     key: "stripe-connect",
      //     text: "You must connect to Stripe before setting a price",
      //     dismissable: false,
      //     variant: "error",
      //   });
      //   router.push("/app/plan");
      //   return;
      // }

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
      setIsLoading(false);
    },
    [session.data?.accessToken]
  );

  const setChannelImage = async (fileBase64: string, fileType: string) => {
    if (newChannel) {
      setImage({ fileBase64, fileType });
      return;
    }

    setIsLoading(true);

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
    setIsLoading(false);
  };

  const createChannel = async () => {
    if (session.status !== "authenticated") {
      snack({
        key: "not-authenticated",
        text: "You must be logged in to create a channel",
        variant: "error",
      });
      return;
    }
    const username = usernameRef.current?.value;
    const description = descriptionRef.current?.value;
    // @ts-expect-error
    const price = priceRef.current.input?.value;
    // @ts-expect-error
    const frequency = priceRef.current.select?.value;

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

    if (!/^[A-Za-z0-9\-\_]+$/.test(username)) {
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

    if (!image) {
      snack({
        key: "image-required",
        text: "Please choose an image",
        variant: "error",
      });
      return;
    }

    try {
      setIsLoading(true);

      const putRes = await fetch(
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
            pricing: [
              {
                id: nanoid(),
                frequency,
                usd: parsedPrice * 100,
              },
            ],
            fileBase64: image?.fileBase64,
            fileType: image?.fileType,
            telegramLinkCode: ch?.telegramLinkCode,
            description,
            username,
          } as StChannel),
        }
      );

      if (putRes.status === 200) {
        snack({
          key: "channel-create-success",
          text: "Channel created",
          variant: "success",
        });
        router.push(`/app/channels/${ch?.id}`);
      } else if (putRes.status === 409) {
        snack({
          key: "channel-create-failure",
          text: "Username already exists",
          variant: "error",
        });
      } else {
        snack({
          key: "channel-create-failure",
          text: "Something went wrong",
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-gray-600 body-font">
      <div className="container pt-5 mx-auto flex flex-wrap">
        <ChannelSection isFirstSection>
          <h2 className="font-bold title-font text-gray-900 mb-1 text-xl">
            Username
          </h2>
          <p className="leading-relaxed">
            This is the public address of your channel.
          </p>
          <div className="mt-6">
            <EditableInput
              ref={usernameRef}
              editMode={newChannel}
              defaultValue={ch?.username}
              onSave={newChannel ? undefined : setUsername}
              pretext="onlychannels.com/"
              onCopy={() =>
                snack({
                  key: "code-copied",
                  text: "URL copied",
                  variant: "success",
                })
              }
            />
          </div>
        </ChannelSection>
        <ChannelSection>
          <h2 className="font-medium title-font text-gray-900 mb-1 text-xl">
            Description
          </h2>
          <p className="leading-relaxed">
            Pitch your channel to your audience.
          </p>
          <div className="mt-6">
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
          <h2 className="font-bold title-font text-gray-900 mb-1 text-xl">
            Pricing
          </h2>
          <p className="leading-relaxed">
            You can update prices anytime. Current memberships are not affected
          </p>
          <div>
            {!ch?.pricing && (
              <div className="mt-6">
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
              <div key={p.id} className="mt-6">
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

        {!newChannel && (
          <ChannelSection>
            <div className="flex flex-col gap-2">
              {!ch?.channelId && (
                <h2 className="font-bold title-font text-gray-900 mb-1 text-xl">
                  Connect Telegram
                </h2>
              )}
              {ch?.channelId && (
                <h2 className="font-bold title-font text-gray-900 mb-1 text-xl flex flex-row gap-2 items-center">
                  Telegram Connected{" "}
                  <FaCheckCircle className="text-green-500" />
                </h2>
              )}
              {!ch?.channelId && (
                <Fragment>
                  {" "}
                  <p>
                    Add{" "}
                    <a href="https://t.me/tgdadybot" target="_blank">
                      process.env.NEXT_PUBLIC_BOT_USERNAME
                    </a>{" "}
                    as an admin to your channel.
                  </p>
                  <p> Copy and paste the code below in your channel </p>
                  <div className="relative text-black text-center text-sm whitespace-nowrap rounded-md justify-center items-center border border-zinc-300 bg-neutral-50 grow py-2.5 border-solid px-1 md:px-5">
                    {channel?.telegramLinkCode}
                    <div className="absolute right-4 inset-y-0 flex items-center">
                      <button onClick={copyTelegramCode}>
                        <FaCopy className="text-lg" />
                      </button>
                    </div>
                  </div>
                  <Button loading={isLoading} onClick={checkTelegram}>
                    Check
                  </Button>
                </Fragment>
              )}
            </div>
          </ChannelSection>
        )}

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
            <div className="h-12 flex justify-center mx-auto">
              <Button loading={isLoading} onClick={createChannel}>
                Create channel
              </Button>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
}
