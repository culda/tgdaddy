"use client";

import { signIn } from "next-auth/react";
import LoginButton from "./telegramLogin/LoginButton";
import { TelegramAuthData } from "./telegramLogin/types";

export default function ConnectTelegram() {
  const handleAuthCallback = async (user: TelegramAuthData) => {
    signIn("credentials", {
      ...user,
      callbackUrl: "/app",
    });
  };
  return (
    <LoginButton
      botUsername="tgdaddybot"
      onAuthCallback={handleAuthCallback}
      buttonSize="large"
      cornerRadius={5}
      showAvatar={true}
      lang="en"
    />
  );
}
