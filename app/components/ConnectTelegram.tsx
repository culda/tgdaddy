"use client";

import { signIn } from "next-auth/react";
import LoginButton from "./telegramLogin/LoginButton";
import { TelegramAuthData } from "./telegramLogin/types";

export default function ConnectTelegram() {
  const handleAuthCallback = async (user: TelegramAuthData) => {
    const res = await fetch("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify(user),
    });
    const data = await res.json();
    signIn("credentials", {
      id: data.id,
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      callbackUrl: "/channels",
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
