"use client";
import { ChangeEventHandler, Fragment, useState } from "react";
import Button from "./components/Button";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const getStarted = () => {
    let path = "/app/channels/add?platformLogin=true";

    if (username) {
      path += `&username=${username}`;
    }
    router.push(path);
  };

  const handleUsernameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value.trim();
    const sanitizedValue = value.replace(/\s/g, "");
    setUsername(sanitizedValue);
  };

  return (
    <Fragment>
      <header className="text-gray-900 bg-white body-font">
        <div className="mx-auto justify-between flex flex-wrap p-5 items-center">
          <a className="flex title-font font-medium items-center md:mb-0">
            <img
              loading="lazy"
              className="aspect-[1.22] object-contain object-center w-[64px] overflow-hidden"
              alt="logo"
              src="/logo.webp"
            />
            <span className="ml-3 text-xl">
              <b>Members</b>Page
            </span>
          </a>

          <div>
            <Button href="/app">Login</Button>
          </div>
        </div>
      </header>
      <main>
        {/* Enter channel name */}
        <section className="text-gray-600 body-font flex items-center justify-center">
          <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
            <div className=" lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
              <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
                Monetize your Telegram audience in under 5 minutes
              </h1>
              <p className="mb-8 leading-relaxed">Get your free landing page</p>
              <div className="flex w-full md:justify-start justify-center items-end">
                <div className="hidden sm:flex relative mr-4 rounded-md border border-indigo-500 ">
                  <span className="flex items-center pl-3 text-gray-700 font-bold rounded-md">
                    members.page/
                  </span>
                  <form>
                    <input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      className="w-full text-base outline-none focus:outline-none rounded-md text-gray-700 py-1 pl-1 pr-2 leading-8 transition-colors duration-200 ease-in-out"
                      placeholder="username"
                    />
                  </form>
                </div>
                <div>
                  <Button onClick={() => getStarted()}>Get Started</Button>
                </div>
              </div>

              <p className="hidden sm:flex text-sm mt-2 text-gray-500 mb-8 w-full">
                Don't worry, you can change it later.
              </p>
            </div>
          </div>
        </section>

        {/* // Stats */}

        <section className="text-gray-600 body-font">
          <div className="container px-5 py-24 mx-auto">
            <div className="flex flex-wrap -m-4 text-center">
              <div className="p-4 w-1/3">
                <h2 className="title-font font-medium sm:text-4xl text-xl text-gray-900">
                  25
                </h2>
                <p className="leading-relaxed">Channels</p>
              </div>
              <div className="p-4 w-1/3">
                <h2 className="title-font font-medium sm:text-4xl text-xl text-gray-900">
                  852
                </h2>
                <p className="leading-relaxed">Subscribers</p>
              </div>
              <div className="p-4 w-1/3">
                <h2 className="title-font font-medium sm:text-4xl text-xl text-gray-900">
                  $4822
                </h2>
                <p className="leading-relaxed">Earned</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="text-gray-600 body-font">
        <div className="container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <a className="flex title-font font-medium items-center md:mb-0">
              <img
                loading="lazy"
                className="aspect-[1.22] object-contain object-center w-[64px] overflow-hidden"
                alt="logo"
                src="/logo.webp"
              />
              <span className="ml-3 text-xl">
                <b>Members</b>Page
              </span>
            </a>
            <p className="mt-2 text-sm text-gray-500">
              Memberspage helps you monetize your audience
            </p>
          </div>
          <div className="flex-grow flex flex-wrap md:pl-20 -mb-10 md:mt-0 mt-10 md:text-left text-center">
            <div className="lg:w-1/4 md:w-1/2 w-full px-4">
              <h2 className="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">
                Site map
              </h2>
              <nav className="list-none mb-10">
                <li>
                  <a
                    href="/app/channels/add"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Add channel
                  </a>
                </li>
                <li>
                  <a href="/app" className="text-gray-600 hover:text-gray-800">
                    View channels
                  </a>
                </li>
              </nav>
            </div>
            <div className="lg:w-1/4 md:w-1/2 w-full px-4">
              <h2 className="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">
                Company
              </h2>
              <nav className="list-none mb-10">
                <li>
                  <a
                    href="/privacyPolicy"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Privacy policy
                  </a>
                </li>
              </nav>
            </div>
          </div>
        </div>
        <div className="bg-gray-100">
          <div className="container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © 2023 Memberspage
            </p>
          </div>
        </div>
      </footer>
    </Fragment>
  );
}
