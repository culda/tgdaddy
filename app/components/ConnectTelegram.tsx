"use client";

import LoginButton from "./telegramLogin/LoginButton";
import { TelegramAuthData } from "./telegramLogin/types";
import { signIn } from "next-auth/react";
import crypto from "crypto";

export default function ConnectTelegram() {
  const handleAuthCallback = async (user: TelegramAuthData) => {
    console.log(user);

    const dataCheckString = Object.keys(user)
      .filter((key) => key !== "hash")
      .sort()
      .map((key) => `${key}=${user[key as keyof TelegramAuthData]}`)
      .join("\n");

    const secretKey = crypto
      .createHash("sha256")
      .update("6595076636:AAGua37f0xbobgkwyiszo5vOoc8c6r1nvk4" as string)
      .digest();

    // Calculate HMAC-SHA-256 signature
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (hmac !== user.hash) {
      alert("Data is not from Telegram");
      return;
    }

    signIn("credentials", {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      callbackUrl: "/dashboard",
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
