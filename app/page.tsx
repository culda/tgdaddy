"use client";
import { ChangeEventHandler, Fragment, useState } from "react";
import Button from "./components/Button";
import ConnectTelegram from "./components/ConnectTelegram";
import AppButton from "./components/AppButton";

export default function Home() {
  const [username, setUsername] = useState("");

  const getStarted = () => {
    window.location.href = `/app/channels/add`;
    return;
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value.trim(); // Remove leading and trailing spaces
    const sanitizedValue = value.replace(/\s/g, ""); // Remove all remaining spaces

    setUsername(sanitizedValue);
  };

  return (
    <Fragment>
      <header class="text-gray-900 bg-white body-font">
        <div class="container mx-auto justify-between flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a class="flex title-font font-medium items-center mb-4 md:mb-0">
            <img
              loading="lazy"
              className="aspect-[2.22] object-contain object-center w-[102px] overflow-hidden"
              alt="logo"
              src="/logo.webp"
            />
            <span class="ml-3 text-xl">OnlyChannels</span>
          </a>

          <div class="flex gap-2">
            <AppButton />
            <ConnectTelegram platformLogin callbackUrl="/app" />
          </div>
        </div>
      </header>
      <main>
        {/* Enter channel name */}

        <section class="text-gray-600 body-font flex items-center justify-center">
          <div class="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
            <div class=" lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
              <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
                Monetize your Telegram audience in under 5 minutes
              </h1>
              <p class="mb-8 leading-relaxed">Get your free landing page</p>
              <div class="flex w-full md:justify-start justify-center items-end">
                <div class="hidden sm:flex relative mr-4 rounded-md border border-indigo-500 ">
                  <span class="flex items-center pl-3 text-gray-700 font-bold rounded-md">
                    onlychannels.com/
                  </span>
                  <input
                    type="text"
                    id="hero-field"
                    value={username}
                    onChange={onChange}
                    name="hero-field"
                    class="w-full  text-base outline-none rounded-md text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    placeholder="username"
                  />
                </div>
                <Button onClick={getStarted}>Get Started</Button>
              </div>

              <p class="hidden sm:flex text-sm mt-2 text-gray-500 mb-8 w-full">
                Don't worry, you can change it later.
              </p>
            </div>
          </div>
        </section>

        {/* // Stats */}

        <section class="text-gray-600 body-font">
          <div class="container px-5 py-24 mx-auto">
            <div class="flex flex-wrap -m-4 text-center">
              <div class="p-4 w-1/3">
                <h2 class="title-font font-medium sm:text-4xl text-xl text-gray-900">
                  25
                </h2>
                <p class="leading-relaxed">Channels</p>
              </div>
              <div class="p-4 w-1/3">
                <h2 class="title-font font-medium sm:text-4xl text-xl text-gray-900">
                  852
                </h2>
                <p class="leading-relaxed">Subscribers</p>
              </div>
              <div class="p-4 w-1/3">
                <h2 class="title-font font-medium sm:text-4xl text-xl text-gray-900">
                  $4822
                </h2>
                <p class="leading-relaxed">Earned</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Fragment>
  );
}
