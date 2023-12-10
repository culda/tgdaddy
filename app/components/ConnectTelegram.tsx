"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import LoginButton from "./telegramLogin/LoginButton";
import { TelegramAuthData } from "./telegramLogin/types";
import Button from "./Button";
import { useState } from "react";
import { FaPowerOff } from "react-icons/fa";

type PpConnectTelegram = {
  callbackUrl?: string;
  platformLogin?: boolean;
};

export default function ConnectTelegram({
  callbackUrl,
  platformLogin,
}: PpConnectTelegram) {
  const { data, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleAuthCallback = async (user: TelegramAuthData) => {
    signIn("credentials", {
      ...user,
      callbackUrl,
      platformLogin,
    });
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    window.location.reload();
    setLoggingOut(false);
  };

  const isPlatformUser = data?.user?.platformLogin;

  return (
    <div className="flex items-center">
      <LoginButton
        botUsername="tgdaddybot"
        onAuthCallback={handleAuthCallback}
        buttonSize="large"
        cornerRadius={5}
        showAvatar={true}
        lang="en"
      />
      {/* Conditionally display the user's profile image if authenticated */}
      {status === "authenticated" && data.user.photoUrl && (
        <div class="flex flex-row gap-2">
          {isPlatformUser && <Button href="/app">App</Button>}
          <Button variant={"text"} loading={loggingOut} onClick={handleSignOut}>
            <FaPowerOff />
          </Button>
          <div className="ml-2 w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={data.user.photoUrl}
              alt="User Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
