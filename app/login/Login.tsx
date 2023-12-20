"use client";
import ConnectTelegram from "../components/ConnectTelegram";
import Button from "../components/Button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSnackbar } from "../components/SnackbarProvider";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { createHash } from "crypto";
import { PpParams } from "./page";

type TpFormValues = {
  email: string;
  password: string;
};

const schema = yup
  .object()
  .shape({
    email: yup.string().required("Enter your email").email(),
    password: yup
      .string()
      .required("Enter your password")
      .min(8, "Password must be at least 8 characters"),
  })
  .required();

export default function Page({
  platformLogin = "true",
  callbackUrl,
}: PpParams["searchParams"]) {
  const snack = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const { getValues, formState, register, handleSubmit } =
    useForm<TpFormValues>({
      resolver: yupResolver(schema),
    });

  const onSubmit: SubmitHandler<TpFormValues> = async (values) => {
    setIsLoading(true);
    const hashedPassword = createHash("sha256")
      .update(values.password)
      .digest("hex");
    const result = await signIn("email", {
      redirect: false,
      email: values.email,
      password: hashedPassword,
      platformLogin: platformLogin,
      callbackUrl: callbackUrl,
    });

    if (result?.ok) {
      window.location.href =
        callbackUrl ?? `${process.env.NEXT_PUBLIC_HOST}/app`;
    } else {
      snack({
        key: "login-error",
        text: result?.error ?? "Something went wrong",
        variant: "error",
      });
    }
    setIsLoading(false);
  };

  const handleForgetPassowrd = async () => {
    const email = getValues("email");
    try {
      await yup.string().required().email().validate(email);
      await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/forgotPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: getValues("email"),
          platformLogin: platformLogin,
          callbackUrl: callbackUrl,
        }),
      });
      snack({
        key: "forgot-password-success",
        text: "Check your email for a reset code",
        variant: "success",
      });
    } catch (err) {
      snack({
        key: "forgot-password-error",
        text: "Please enter a valid email",
        variant: "error",
      });
    }
  };

  return (
    <div
      className="fixed top-1/2 left-1/2 md:w-md -translate-x-1/2 -translate-y-1/2 
             p-5 text-center"
    >
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              {...register("email")}
              className={`shadow appearance-none border ${
                formState.errors.email ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              id="email"
              type="email"
              placeholder="Email"
            />
            {formState.errors.email && (
              <p className="text-red-500 text-xs italic">
                {formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              {...register("password")}
              className={`shadow appearance-none border ${
                formState.errors.password ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
              id="password"
              type="password"
              placeholder="****"
            />
            {formState.errors.password && (
              <p className="text-red-500 text-xs italic">
                {formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="flex text-gray-600 text-sm">
            <button
              type="button"
              className="hover:underline"
              onClick={handleForgetPassowrd}
            >
              Forgot password?
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <Button loading={isLoading} type="submit">
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-8 flex justify-center">
          <ConnectTelegram
            platformLogin={Boolean(platformLogin)}
            callbackUrl={callbackUrl}
          />
        </div>
      </div>
    </div>
  );
}
