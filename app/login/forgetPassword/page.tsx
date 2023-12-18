"use client";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useSnackbar } from "@/app/components/SnackbarProvider";
import Button from "@/app/components/Button";

type PpParams = {
  searchParams: {
    email: string;
    code: string;
    callbackUrl?: string;
    platformLogin?: string;
  };
};

type TpFormValues = {
  newPassword: string;
  confirmPassword: string;
};

const schema = yup
  .object()
  .shape({
    newPassword: yup
      .string()
      .required("Enter your password")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .min(8, "Password must be at least 8 characters")
      .test("passwords-match", "Passwords must match", function (value) {
        return this.parent.newPassword === value;
      }),
  })
  .required();

export default function Page({ searchParams }: PpParams) {
  const snack = useSnackbar();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { formState, register, handleSubmit } = useForm<TpFormValues>({
    resolver: yupResolver(schema),
  });

  console.log(searchParams);

  const onSubmit: SubmitHandler<TpFormValues> = async (values) => {
    setIsLoading(true);
    const result = await signIn("email", {
      redirect: false,
      email: searchParams.email,
      password: values.newPassword,
      resetCode: searchParams.code,
      platformLogin: searchParams.platformLogin,
    });

    if (result?.ok) {
      router.push(searchParams.callbackUrl ?? "/app");
    } else {
      snack({
        key: "login-error",
        text: result?.error ?? "Something went wrong",
        variant: "error",
      });
    }
    setIsLoading(false);
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
              htmlFor="password"
            >
              New Password
            </label>
            <input
              {...register("newPassword")}
              className={`shadow appearance-none border ${
                formState.errors.newPassword ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
              id="password"
              type="password"
              placeholder="****"
            />
            {formState.errors.newPassword && (
              <p className="text-red-500 text-xs italic">
                {formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Confirm
            </label>
            <input
              {...register("confirmPassword")}
              className={`shadow appearance-none border ${
                formState.errors.confirmPassword ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
              id="password"
              type="password"
              placeholder="****"
            />
            {formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs italic">
                {formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center">
            <Button loading={isLoading} type="submit">
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
