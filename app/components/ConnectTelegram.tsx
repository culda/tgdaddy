import LoginButton from "./telegramLogin/LoginButton";
import { TelegramAuthData } from "./telegramLogin/types";
import { signIn } from "next-auth/react";

export default function ConnectTelegram() {
  const handleAuthCallback = async (user: TelegramAuthData) => {
    console.log(user);

    const dataCheckString = Object.keys(user)
      .filter((key) => key !== "hash")
      .sort()
      .map((key) => `${key}=${user[key as keyof TelegramAuthData]}`)
      .join("\n");

    signIn("credentials", {
      hash: user.hash,
      userData: dataCheckString,
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
