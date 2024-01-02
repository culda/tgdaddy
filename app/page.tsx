'use client';
import { useRouter } from 'next/navigation';
import { ChangeEventHandler, Fragment, useState } from 'react';
import { FaLightbulb, FaMoneyBill, FaRocket } from 'react-icons/fa';
import Button from './components/Button';

export default function Home() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const getStarted = () => {
    let path = '/app/pages/add?platformLogin=true';

    if (username) {
      path += `&username=${username}`;
    }
    router.push(path);
  };

  const handleUsernameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value.trim();
    const sanitizedValue = value.replace(/\s/g, '');
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
        {/* Enter page name */}
        <section className="text-gray-600 body-font flex items-center justify-center">
          <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
            <div className=" md:pl-24 md:pl-16 flex flex-col sm:items-start sm:text-left items-center text-center">
              <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
                Monetize your Telegram audience in under 2 minutes
              </h1>
              <p className="mb-8 leading-relaxed">Get your free landing page</p>
              <div className="flex w-full sm:justify-start justify-center items-end">
                <div className="hidden sm:flex relative mr-4 rounded-md border border-indigo-500 ">
                  <span className="flex items-center pl-3 text-gray-700 font-bold rounded-md">
                    members.page/
                  </span>
                  <form>
                    <input
                      type="text"
                      data-lpignore="true"
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
                <p>Channels</p>
              </div>
              <div className="p-4 w-1/3">
                <h2 className="title-font font-medium sm:text-4xl text-xl text-gray-900">
                  852
                </h2>
                <p>Subscribers</p>
              </div>
              <div className="p-4 w-1/3">
                <h2 className="title-font font-medium sm:text-4xl text-xl text-gray-900">
                  $4822
                </h2>
                <p>Earned</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-gray-600 body-font">
          <div className="container px-5 py-24 mx-auto flex flex-wrap">
            <div className="w-full md:w-1/2 mb-10 md:mb-0 pb-[120%] md:pb-[60%] rounded-lg overflow-hidden relative">
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
                src="https://www.tella.tv/video/clqw82nup00e60gi6hav9gq8b/embed?b=0&title=0&a=1&loop=0&autoPlay=true&t=0&muted=1"
                allowFullScreen
                allowTransparency
              ></iframe>
            </div>
            <div className="flex flex-col flex-wrap md:py-6 -mb-10 md:w-1/2 md:pl-12 md:text-left text-center">
              <div className="flex flex-col mb-10 md:items-start items-center">
                <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-5">
                  <FaRocket className="text-xl" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-3">
                    Quick setup
                  </h2>
                  <p className="leading-relaxed text-base">
                    Create your customized landing page in seconds and start
                    accepting subscribers straight away.
                  </p>
                </div>
              </div>
              <div className="flex flex-col mb-10 md:items-start items-center">
                <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-5">
                  <FaLightbulb className="text-xl" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-3">
                    Track conversions and optimise
                  </h2>
                  <p className="leading-relaxed text-base">
                    Connect your pixel of choice and identity where the traffic
                    and conversions are coming from.
                  </p>
                </div>
              </div>
              <div className="flex flex-col mb-10 md:items-start items-center">
                <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-5">
                  <FaMoneyBill className="text-xl" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-3">
                    Sell adspace (coming soon)
                  </h2>
                  <p className="leading-relaxed text-base">
                    Allow other creators to post ads on your page and earn
                    commission
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="text-gray-600 body-font overflow-hidden">
          <div className="container px-5 py-24 mx-auto">
            <div className="flex flex-col text-center w-full mb-20">
              <h1 className="sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900">
                Pricing
              </h1>
              <p className="md:w-2/3 mx-auto leading-relaxed text-base text-gray-500">
                The best pricing for you depends on the number of monthly
                subscribers your page has. Don't worry, you can change it later.
              </p>
            </div>
            <div className="flex flex-wrap -m-4">
              <div className="p-4 xl:w-1/4 md:w-1/2 w-full">
                <div className="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden">
                  <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                    Starter
                  </h2>
                  <h1 className="text-5xl text-gray-900 pb-4 mb-4 border-b border-gray-200 leading-none">
                    Free
                  </h1>
                  <p className="flex items-center text-gray-600 mb-2">
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    18% transaction fee
                  </p>

                  <Button className="flex-grow-0" onClick={getStarted}>
                    Get started
                    <svg
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      className="w-4 h-4 ml-auto"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </Button>
                  <p className="text-xs text-gray-500 mt-3"></p>
                </div>
              </div>
              <div className="p-4 xl:w-1/4 md:w-1/2 w-full">
                <div className="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden">
                  <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                    Growth
                  </h2>
                  <h1 className="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                    <span>$49</span>
                    <span className="text-lg ml-1 font-normal text-gray-500">
                      /mo
                    </span>
                  </h1>
                  <p className="flex items-center text-gray-600 mb-2">
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    8% transaction fee
                  </p>

                  <p className="flex items-center text-gray-600 mb-2">
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    Best for $500+/mo pages
                  </p>
                  <Button className="flex-grow-0" onClick={getStarted}>
                    Get started
                    <svg
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      className="w-4 h-4 ml-auto"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </Button>
                  <p className="text-xs text-gray-500 mt-3"></p>
                </div>
              </div>
              <div className="p-4 xl:w-1/4 md:w-1/2 w-full">
                <div className="h-full p-6 rounded-lg border-2 border-indigo-500 flex flex-col relative overflow-hidden">
                  <span className="bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl">
                    POPULAR
                  </span>
                  <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                    Pro
                  </h2>
                  <h1 className="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                    <span>$99</span>
                    <span className="text-lg ml-1 font-normal text-gray-500">
                      /mo
                    </span>
                  </h1>
                  <p className="flex items-center text-gray-600 mb-2">
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    5% transaction fee
                  </p>
                  <p className="flex items-center text-gray-600 mb-2">
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    Best for $1000+/mo pages
                  </p>
                  <Button className="flex-grow-0" onClick={getStarted}>
                    Get started
                    <svg
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      className="w-4 h-4 ml-auto"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </Button>
                  <p className="text-xs text-gray-500 mt-3"></p>
                </div>
              </div>
              <div className="p-4 xl:w-1/4 md:w-1/2 w-full">
                <div className="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden">
                  <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                    Business
                  </h2>
                  <h1 className="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                    <span>$199</span>
                    <span className="text-lg ml-1 font-normal text-gray-500">
                      /mo
                    </span>
                  </h1>
                  <p className="flex items-center text-gray-600 mb-2">
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    1% transaction fee
                  </p>

                  <p className="flex items-center text-gray-600 mb-2">
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    Best for $2000+/mo pages
                  </p>

                  <Button className="flex-grow-0" onClick={getStarted}>
                    Get started
                    <svg
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      className="w-4 h-4 ml-auto"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </Button>
                  <p className="text-xs text-gray-500 mt-3"></p>
                </div>
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
              <nav className="list-none mb-10 flex flex-col md:items-start items-center gap-2">
                <li>
                  <a
                    href="/app/pages/add"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Add page
                  </a>
                </li>
                <li>
                  <a href="/app" className="text-gray-600 hover:text-gray-800">
                    View pages
                  </a>
                </li>
              </nav>
            </div>
            <div className="lg:w-1/4 md:w-1/2 w-full px-4">
              <h2 className="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">
                Support
              </h2>
              <nav className="list-none mb-10 flex flex-col md:items-start items-center gap-2">
                <li>
                  <a
                    href="https://t.me/+I0aDf8KIG9g3N2Q0"
                    target="_blank"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <div className="flex flex-row gap-2">
                      <img
                        className="text-sm w-6 h-6"
                        src="/images/telegram-logo.svg"
                      ></img>
                      Creators
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/+R0W1d5xweVQzOWQ0"
                    target="_blank"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <div className="flex flex-row gap-2">
                      <img
                        className="text-sm w-6 h-6"
                        src="/images/telegram-logo.svg"
                      ></img>
                      Subscribers
                    </div>
                  </a>
                </li>
              </nav>
            </div>
            <div className="lg:w-1/4 md:w-1/2 w-full px-4">
              <h2 className="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">
                Company
              </h2>
              <nav className="list-none mb-10 flex flex-col md:items-start items-center gap-2">
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
