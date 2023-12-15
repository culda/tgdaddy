"use client";

import React, { useEffect, useRef, useState } from "react";
import { LoginButtonProps, TTelegramAuthLogin } from "./types";
import { createScript } from "./createScript";
import { useSession } from "next-auth/react";

/**
 * It takes an object with a bunch of properties and assigns it to the global variable
 * `TelegramAuthLogin`
 *
 * @param {TTelegramAuthLogin} options - The options to set on the global variable.
 */
function initTelegramAuthLogin(options: TTelegramAuthLogin) {
  window.TelegramAuthLogin = options;
}

/**
 * A React component that renders a Telegram login button.
 *
 * @see https://core.telegram.org/widgets/login
 *
 * @param {LoginButtonProps} props The props to pass to the component.
 * @returns A React component that renders the Telegram login button.
 */
export default function LoginButton(props: LoginButtonProps) {
  const { status } = useSession();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const hiddenDivRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement>();

  useEffect(() => {
    if (status === "unauthenticated") {
      // destry the existing script element
      scriptRef.current?.remove();

      // init the global variable
      initTelegramAuthLogin({ onAuthCallback: props.onAuthCallback });

      // create a new script element and save it
      scriptRef.current = createScript(props);

      // add the script element to the DOM
      hiddenDivRef.current?.after(scriptRef.current);

      const handleIframeLoad = () => {
        console.log("message");
        setIframeLoaded(true);
      };

      window.addEventListener("message", handleIframeLoad);
      return () => {
        window.removeEventListener("message", handleIframeLoad);
      };
    } else {
      // If the condition is false, remove the script element from the DOM
      scriptRef.current?.remove();
    }
  }, [props, status]);

  return (
    <div className="relative">
      {!iframeLoaded && status !== "authenticated" && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse" />
      )}
      <div ref={hiddenDivRef} className={`${iframeLoaded ? "hidden" : "w-48"}`}>
        &nbsp;
      </div>
    </div>
  );
}
