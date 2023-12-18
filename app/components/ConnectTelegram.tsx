"use client";

import { signIn } from "next-auth/react";
import LoginButton from "./telegramLogin/LoginButton";
import { TelegramAuthData } from "./telegramLogin/types";
import { usePathname } from "next/navigation";

type PpConnectTelegram = {
  platformLogin?: boolean;
  callbackUrl?: string;
};

export default function ConnectTelegram({
  platformLogin,
  callbackUrl,
}: PpConnectTelegram) {
  const pathname = usePathname();

  const handleAuthCallback = async (user: TelegramAuthData) => {
    signIn("telegram", {
      ...user,
      callbackUrl: callbackUrl ?? pathname,
      platformLogin,
    });
  };

  return (
    <div className="flex items-center">
      <LoginButton
        botUsername={process.env.NEXT_PUBLIC_BOT_USERNAME as string}
        onAuthCallback={handleAuthCallback}
        buttonSize="large"
        cornerRadius={5}
        showAvatar={true}
        lang="en"
      />
    </div>
  );
}
