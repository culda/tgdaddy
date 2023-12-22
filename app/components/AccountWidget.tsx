"use client";
import { signOut, useSession } from "next-auth/react";
import AppButton from "./AppButton";
import Button from "./Button";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaPowerOff, FaUser } from "react-icons/fa";

type PpAccountWidget = {
  platformLogin?: boolean;
  callbackUrl?: string;
};

export default function AccountWidget({
  platformLogin,
  callbackUrl,
}: PpAccountWidget) {
  const { data, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const redirect = callbackUrl ?? pathname;

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut({
      callbackUrl: "/",
    });
    setLoggingOut(false);
  };

  return (
    <div className="flex gap-2">
      {status === "unauthenticated" && (
        <Button
          href={`/login?platformLogin=${Boolean(
            platformLogin
          )}&callbackUrl=${encodeURIComponent(redirect)}`}
        >
          Login
        </Button>
      )}
      {status === "authenticated" && (
        <div className="flex flex-row gap-2">
          <Button variant={"text"} loading={loggingOut} onClick={handleSignOut}>
            <FaPowerOff />
          </Button>
          <div className="ml-2 w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
            {data.user.photoUrl ? (
              <img
                src={data.user.photoUrl}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex justify-center items-center text-2xl w-full h-full bg-gray-300">
                <FaUser />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
