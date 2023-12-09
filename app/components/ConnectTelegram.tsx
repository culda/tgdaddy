"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import LoginButton from "./telegramLogin/LoginButton";
import { TelegramAuthData } from "./telegramLogin/types";
import Button from "./Button";
import { Fragment, useState } from "react";

type PpConnectTelegram = {
  callbackUrl?: string;
};

export default function ConnectTelegram({ callbackUrl }: PpConnectTelegram) {
  const { data, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleAuthCallback = async (user: TelegramAuthData) => {
    signIn("credentials", {
      ...user,
      callbackUrl,
    });
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
  };

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
        <Fragment>
          <Button loading={loggingOut} onClick={handleSignOut}>
            Logout
          </Button>
          <div className="ml-2 w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={data.user.photoUrl}
              alt="User Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </Fragment>
      )}
    </div>
  );
}
