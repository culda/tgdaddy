"use client";
import { useSession } from "next-auth/react";
import { StChannel, StPriceFrequency } from "../../model/types";
import TextField from "../../components/TextField";
import { Fragment, useCallback, useRef, useState } from "react";
import PriceInput from "../../components/PriceInput";
import { useRouter } from "next/navigation";
import AddImage from "@/app/components/AddImage";
import { TpSetChannelImageResponse } from "@/functions/setChannelImage/handler";
import { useSnackbar } from "@/app/components/SnackbarProvider";
import ChannelSection from "./ChannelSection";
import Button from "@/app/components/Button";
import { FaCheckCircle, FaCopy } from "react-icons/fa";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { nanoid } from "nanoid";

type PpChannel = {
  channel: Partial<StChannel>;
  isNew?: boolean;
  edit?: boolean;
};

type TpImage = {
  fileBase64: string;
  fileType: string;
};

type TpValues = {
  username: string;
  title: string;
  description: string;
  price: number;
  frequency: string;
};

const schema = yup.object().shape({
  username: yup
    .string()
    .lowercase()
    .required("Username is required")
    .matches(
      /^[A-Za-z0-9\-\_]+$/,
      "Username can only contain letters, numbers, and the following characters: - _"
    ),
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  price: yup
    .number()
    .required("Price is required")
    .test(
      "maxDecimals",
      "Price can have a maximum of 2 decimal places",
      (value) => {
        if (value) {
          const decimalCount = value.toString().split(".")[1]?.length || 0;
          return decimalCount <= 2;
        }
        return true;
      }
    ),
  frequency: yup.string().required("Frequency is required"),
});

export default function Channel({
  channel,
  isNew = false,
  edit = false,
}: PpChannel) {
  const snack = useSnackbar();
  const router = useRouter();
  const [ch, setCh] = useState(channel);
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<TpImage | null>(null);
  const { register, handleSubmit } = useForm<TpValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: ch?.username,
      title: ch?.title,
      description: ch?.description,
      price: ch?.pricing?.[0] && ch.pricing[0].usd / 100,
      frequency: ch?.pricing?.[0] && ch.pricing[0].frequency,
    },
  });

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

    const { channelId } = (await channelRes.json()) as StChannel;

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
        text: "Updated",
        dismissable: false,
        variant: "success",
      });
      setCh({ ...ch, pricing } as StChannel);
      setIsLoading(false);
    },
    [session.data?.accessToken]
  );

  const setChannelImage = async (fileBase64: string, fileType: string) => {
    if (edit) {
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

    snack({
      key: "image-updated",
      text: "Updated",
      variant: "success",
    });
    setCh({ ...ch, imagePath } as StChannel);
    setIsLoading(false);
  };

  const onSubmit = async ({
    description,
    title,
    username,
    price,
    frequency,
  }: TpValues) => {
    if (session.status !== "authenticated") {
      snack({
        key: "not-authenticated",
        text: "You must be logged in to create a channel",
        variant: "error",
      });
      return;
    }

    if (description.length > 500) {
      snack({
        key: "description-invalid",
        text: "Description cannot exceed 500 characters",
        variant: "error",
      });
      return;
    }

    // const parsedPrice = parseFloat(price);
    // const decimalCount = (price.split(".")[1] || "").length;

    // if (isNaN(parsedPrice)) {
    //   snack({
    //     key: "price-invalid",
    //     text: "Price must be a valid number",
    //     variant: "error",
    //   });
    //   return;
    // }

    // if (decimalCount > 2) {
    //   snack({
    //     key: "price-invalid",
    //     text: "Price can only have up to 2 decimal places",
    //     variant: "error",
    //   });
    //   return;
    // }

    // if (!frequency) {
    //   snack({
    //     key: "frequency-required",
    //     text: "Frequency is required",
    //     variant: "error",
    //   });
    //   return;
    // }

    // if (!image) {
    //   snack({
    //     key: "image-required",
    //     text: "Please choose an image",
    //     variant: "error",
    //   });
    //   return;
    // }

    try {
      setIsLoading(true);

      const putRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/channels`,
        {
          method: isNew ? "PUT" : "POST",
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
                usd: price * 100,
              },
            ],
            fileBase64: image?.fileBase64,
            fileType: image?.fileType,
            telegramLinkCode: ch?.telegramLinkCode,
            description,
            title,
            username,
          } as StChannel),
        }
      );

      if (putRes.status === 200) {
        snack({
          key: "channel-success",
          text: "Success",
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="container pt-5 mx-auto flex flex-wrap"
      >
        <ChannelSection title="Username" isFirstSection>
          <p>This is the public URL of your page.</p>
          <div className="mt-4">
            <TextField
              registerProps={register("username")}
              inputProps={{
                size: 1,
              }}
              editMode={edit}
              defaultValue={ch?.username}
              pretext="members.page/"
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
        <ChannelSection title="Title">
          <p>Sell your page with a catchy title</p>
          <div className="mt-4">
            <TextField
              registerProps={register("title")}
              editMode={edit}
              defaultValue={ch?.title}
            />
          </div>
        </ChannelSection>
        <ChannelSection title="Description">
          <p className="leading-relaxed">
            Describe your page and what your audience can expect
          </p>
          <div className="mt-4">
            <TextField
              registerProps={register("description")}
              editMode={edit}
              textarea
              defaultValue={ch?.description}
            />
          </div>
        </ChannelSection>

        <ChannelSection title="Pricing">
          <p className="leading-relaxed">
            You can update prices anytime. Current memberships are not affected
          </p>
          <div>
            <div className="mt-4">
              <PriceInput
                priceRegisterProps={register("price")}
                frequencyRegisterProps={register("frequency")}
                editMode={edit}
                // onSave={
                //   edit
                //     ? undefined
                //     : (price, frequency) => setPrice(price, frequency)
                // }
              />
            </div>
            {/* {ch?.pricing?.map((p) => (
              <div key={p.id} className="mt-4">
                <PriceInput
                  defaultPrice={(p.usd / 100).toFixed(2)}
                  defaultFrequency={p.frequency}
                  onSave={
                    edit
                      ? undefined
                      : (price, frequency) => setPrice(price, frequency)
                  }
                />
              </div>
            ))} */}
          </div>
        </ChannelSection>

        {!edit && (
          <ChannelSection
            title={
              !ch?.channelId ? (
                "Connect Telegram"
              ) : (
                <h2 className="font-bold title-font text-gray-900 mb-1 text-xl flex flex-row gap-2 items-center">
                  Telegram Connected{" "}
                  <FaCheckCircle className="text-green-500" />
                </h2>
              )
            }
          >
            <div className="flex flex-col gap-2">
              {!ch?.channelId && (
                <Fragment>
                  {" "}
                  <p>
                    Add{" "}
                    <a href="https://t.me/tgdadybot" target="_blank">
                      <b>{process.env.NEXT_PUBLIC_BOT_USERNAME}</b>
                    </a>{" "}
                    as an admin to your channel.
                  </p>
                  <p> Copy and paste the code below in your channel </p>
                  <div className="relative text-black text-center text-sm rounded-md justify-center items-center border border-zinc-300 bg-neutral-50 grow py-2.5 border-solid px-1 md:px-5">
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

        <ChannelSection title="Photo" isLastSection>
          <p className="leading-relaxed">
            Add a photo to showcase your channel.
          </p>
          <div className="mt-4">
            <AddImage
              currentImagePath={ch?.imagePath}
              onSave={setChannelImage}
              saveOnChange={edit}
            />
          </div>
        </ChannelSection>

        {edit && (
          <div className="h-12 flex w-1/2 justify-center mx-auto">
            <Button type="submit" loading={isLoading}>
              {isNew ? "Create" : "Save"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
