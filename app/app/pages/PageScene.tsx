"use client";
import { useSession } from "next-auth/react";
import { StPage } from "../../model/types";
import TextField from "../../components/TextField";
import { Fragment, useState } from "react";
import PriceInput from "../../components/PriceInput";
import { useRouter } from "next/navigation";
import AddImage from "@/app/components/AddImage";
import { useSnackbar } from "@/app/components/SnackbarProvider";
import PageSection from "./PageSection";
import Button from "@/app/components/Button";
import { FaCheckCircle, FaCopy } from "react-icons/fa";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { nanoid } from "nanoid";

type PpPage = {
  page: Partial<StPage>;
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
    .typeError("Please enter a valid number")
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

export default function PageScene({
  page,
  isNew = false,
  edit = false,
}: PpPage) {
  const snack = useSnackbar();
  const router = useRouter();
  const [pg, setPg] = useState(page);
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<TpImage | null>(null);
  const { getValues, formState, register, handleSubmit } = useForm<TpValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: pg?.username,
      title: pg?.title,
      description: pg?.description,
      price: pg?.pricing?.[0] && pg.pricing[0].usd / 100,
      frequency: pg?.pricing?.[0] && pg.pricing[0].frequency,
    },
  });

  const checkTelegram = async () => {
    setIsLoading(true);
    const pageRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/pages?id=${pg?.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
      }
    );

    const { channelId } = (await pageRes.json()) as StPage;

    setPg({ ...pg, channelId } as StPage);
    setIsLoading(false);
  };

  const copyTelegramCode = () => {
    if (!pg?.telegramLinkCode) {
      return;
    }
    navigator.clipboard.writeText(pg.telegramLinkCode);
    snack({
      key: "code-copied",
      text: "Code copied",
      variant: "success",
    });
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
        text: "You must be logged in to create a page",
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

    try {
      setIsLoading(true);

      const putRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/pages`,
        {
          method: isNew ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.data?.accessToken}`,
          },
          body: JSON.stringify({
            id: pg?.id,
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
            telegramLinkCode: pg?.telegramLinkCode,
            description,
            title,
            username,
          } as StPage),
        }
      );

      if (putRes.status === 200) {
        snack({
          key: "page-success",
          text: "Success",
          variant: "success",
        });
        router.push(`/app/pages/${pg?.id}`);
      } else if (putRes.status === 409) {
        snack({
          key: "page-create-failure",
          text: "Username already exists",
          variant: "error",
        });
      } else {
        snack({
          key: "page-create-failure",
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
        <PageSection title="Username" isFirstSection>
          <p>This is the public URL of your page.</p>
          <div className="mt-4">
            <TextField
              registerProps={register("username")}
              errorMessage={formState.errors.username?.message}
              inputProps={{
                size: 1,
              }}
              editMode={edit}
              defaultValue={pg?.username}
              pretext="members.page/"
              onCopy={() => {
                navigator.clipboard.writeText(
                  `members.page/${getValues("username")}`
                );
                snack({
                  key: "code-copied",
                  text: "URL copied",
                  variant: "success",
                });
              }}
            />
          </div>
        </PageSection>
        <PageSection title="Title">
          <p>Sell your page with a catchy title</p>
          <div className="mt-4">
            <TextField
              errorMessage={formState.errors.title?.message}
              registerProps={register("title")}
              editMode={edit}
              defaultValue={pg?.title}
            />
          </div>
        </PageSection>
        <PageSection title="Description">
          <p className="leading-relaxed">
            Describe your page and what your audience can expect
          </p>
          <div className="mt-4">
            <TextField
              registerProps={register("description")}
              errorMessage={formState.errors.description?.message}
              editMode={edit}
              textarea
              defaultValue={pg?.description}
            />
          </div>
        </PageSection>

        <PageSection title="Pricing">
          <p className="leading-relaxed">
            You can update prices anytime. Current memberships are not affected
          </p>
          <div>
            <div className="mt-4">
              <PriceInput
                errorMessage={
                  formState.errors.price?.message ||
                  formState.errors.frequency?.message
                }
                priceRegisterProps={register("price")}
                frequencyRegisterProps={register("frequency")}
                editMode={edit}
              />
            </div>
          </div>
        </PageSection>

        {!edit && (
          <PageSection
            title={
              !pg?.channelId ? (
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
              {!pg?.channelId && (
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
                    {page?.telegramLinkCode}
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
          </PageSection>
        )}

        <PageSection title="Photo" isLastSection>
          <p className="leading-relaxed">
            Add a photo to showcase your channel.
          </p>
          <div className="mt-4">
            <AddImage
              currentImagePath={pg?.imagePath}
              onSave={setImage}
              saveOnChange={edit}
            />
          </div>
        </PageSection>

        {edit && (
          <div className="h-12 flex w-1/2 flex-row gap-2 justify-center mx-auto">
            <Button type="submit" loading={isLoading}>
              {isNew ? "Create" : "Save"}
            </Button>
            {edit && (
              <Button
                href={`/app/pages/${page.id}`}
                variant="text"
                type="button"
                loading={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
