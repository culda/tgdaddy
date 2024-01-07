'use client';
import { useRouter } from 'next/navigation';
import { ChangeEventHandler, Fragment, useState } from 'react';
import { FaLightbulb, FaMoneyBill, FaRocket } from 'react-icons/fa';
import Button from './components/Button';
import FAQSection from './components/FaqSection';
import PricingSection from './components/PricingSection';

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
    <div className="gradient-bg">
      <header className=" text-gray-800 body-font px-8">
        <div className="mx-auto justify-between flex flex-wrap p-5 items-center">
          <a className="flex title-font font-medium items-center md:mb-0">
            <img
              loading="lazy"
              className="aspect-[1.22] object-contain object-center w-[64px] overflow-hidden"
              alt="logo"
              src="/logo-b.webp"
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
        <section className="bg-blue-500 text-white body-font shadow-2xl">
          <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
            <h1 className="title-font sm:text-5xl text-4xl mb-4 font-medium">
              Get a <span className="thick-underline">paid</span> Telegram
              channel in 60 seconds
            </h1>
            <p className="mb-8 leading-relaxed">
              Paywall your digital content with a landing page that is ready to
              convert straight away. Your content, your prices.
            </p>
            <div className="flex w-full justify-center items-end">
              <div className="hidden sm:flex relative mr-4 rounded-md border border-gray-200 bg-blue-800 focus-within:ring-2 focus-within:ring-white focus-within:border-transparent shadow-xl">
                <span className="flex items-center pl-3 text-white font-bold rounded-lg">
                  members.page/
                </span>

                <input
                  type="text"
                  id="username"
                  name="username"
                  data-lpignore="true"
                  value={username}
                  onChange={handleUsernameChange}
                  className=" rounded-lg flex-1 appearance-none bg-transparent w-full py-2 px-2 text-white-700 placeholder-gray-300 shadow-sm text-base focus:outline-none "
                  placeholder="username"
                />
              </div>
              <Button className="shadow-xl">Get Started</Button>
            </div>
            <p className="text-blue-200 mt-2 text-sm">
              No credit card required. It's completely free to get started.
            </p>
          </div>
        </section>

        {/* // Stats */}

        <section className=" text-gray-800 body-font">
          <div className="container px-5 py-24 mx-auto">
            <div className="flex flex-wrap -m-4 text-center">
              <div className="p-4 w-1/3">
                <h2 className="title-font font-medium sm:text-4xl text-xl ">
                  32
                </h2>
                <p>Channels</p>
              </div>
              <div className="p-4 w-1/3">
                <h2 className="title-font font-medium sm:text-4xl text-xl ">
                  1082
                </h2>
                <p>Subscribers</p>
              </div>
              <div className="p-4 w-1/3">
                <h2 className="title-font font-medium sm:text-4xl text-xl ">
                  $6822
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
                src="https://www.tella.tv/video/clr1znisg006t0fl2bkca79uw/embed?b=0&title=0&a=1&loop=1&autoPlay=true&t=0&muted=1"
                allowFullScreen
                allowTransparency
              ></iframe>
            </div>
            <div className="flex flex-col flex-wrap md:py-6 -mb-10 md:w-1/2 md:pl-12 md:text-left text-center">
              <div className="flex flex-col mb-10 md:items-start items-center">
                <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-5">
                  <FaRocket className="text-xl" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-3">
                    Paid Telegram channel in under 1 minute
                  </h2>
                  <p className="leading-relaxed text-base">
                    Create your custom landing page in seconds and start
                    accepting subscribers straight away.
                  </p>
                </div>
              </div>
              <div className="flex flex-col mb-10 md:items-start items-center">
                <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-5">
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
                <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-5">
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
        <PricingSection getStarted={getStarted} />

        {/* FAQ */}

        <FAQSection />
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
              © 2024 Memberspage
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
