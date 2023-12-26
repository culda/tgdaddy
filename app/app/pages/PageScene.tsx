"use client";
import AddImage from "@/app/components/AddImage";
import Button from "@/app/components/Button";
import PriceInputs from "@/app/components/PriceInputs";
import { useSnackbar } from "@/app/components/SnackbarProvider";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import TextField from "../../components/TextField";
import { StPage, StPagePrice } from "../../model/types";
import PageSection from "./PageSection";
import { getChangedProps } from "./getChangedProps";

type PpPage = {
  page: StPage;
  isNew?: boolean;
  edit?: boolean;
};

type TpImage = {
  fileBase64: string;
  fileType: string;
};

export type TpPageValues = {
  username: string;
  title: string;
  description: string;
  prices: StPagePrice[];
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
  prices: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      usd: yup.number().required()
      .typeError("Please enter a valid number")
      .min(0)
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
    }))
    .required()
    .test("uniqueFrequencies", "Frequencies must be unique", (values) => {
      const frequencies = values?.map((item) => item.frequency);
      const uniqueFrequencies = [...new Set(frequencies)]; // Remove duplicates
      return uniqueFrequencies.length === frequencies?.length;
    })
});

const PageScene = ({
  page,
  isNew = false,
  edit = false,
}: PpPage) => {
  const snack = useSnackbar();
  const router = useRouter();
  const [pg, setPg] = useState(page);
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<TpImage | null>(null);
  const { getValues, watch, setValue, formState, register, handleSubmit } = useForm<TpPageValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      username: pg?.username,
      title: pg?.title,
      description: pg?.description,
      prices: pg.pricing?.map((p) => ({
        id: p.id,
        usd: p.usd / 100,
        frequency: p.frequency,
      })),
    },
  });

  const prices = watch("prices");


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

    const { products } = (await pageRes.json()) as StPage;

    setPg({ ...pg, products } as StPage);
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
    prices,
  }: TpPageValues) => {
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
      
      const newPage: Partial<StPage> = {
        id: pg?.id,
        pricing: prices,
        // products: [],
        description,
        title,
        username,
      }

      const newProps = await getChangedProps(pg, newPage)

      if (image) {
        Object.assign(newProps, {
          fileBase64: image?.fileBase64,
          fileType: image?.fileType
        })
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/pages`,
        {
          method: isNew ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.data?.accessToken}`,
          },
          body: JSON.stringify({
            id: pg?.id,
            ...newProps
          } as StPage),
        }
      );
      

      if (res.status === 200) {
        snack({
          key: "page-success",
          text: "Success",
          variant: "success",
        });
        router.push(`/app/pages/${pg?.id}`);
      } else if (res.status === 409) {
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
                  `https://members.page/${getValues("username")}`
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
            <PriceInputs
              edit={edit}
              register={register}
              setValue={setValue}
              prices={prices}
              errorMessage={formState.errors.prices}
             />
        </PageSection>

        <PageSection title="Photo" isLastSection>
          <p className="leading-relaxed">
            Add a photo to showcase your page.
          </p>
          <div className="mt-4">
            <AddImage
              currentImagePath={pg?.imagePath}
              onSave={setImage}
              editMode={edit}
            />
          </div>
        </PageSection>

        {/* {!edit && (
          <PageSection title="Products">
            {pg.products?.map(pr => 
              <div>
                {pr.title}
              </div>
            )}
          </PageSection>
        )} */}

        {/* {!edit && (
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
                    Make{" "}
                    <a href="https://t.me/tgdadybot" target="_blank">
                      <b>{process.env.NEXT_PUBLIC_BOT_USERNAME}</b>
                    </a>{" "}
                    an admin to your channel.
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
        )} */}



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

export default PageScene;