import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <PageLayout title="Add Channel">
      {/* Step 1 */}
      <section className="flex flex-col items-center mt-20 px-5 max-md:mt-10">
        <div className="flex flex-row items-center justify-start w-full gap-4 mb-2">
          <div className="text-black text-xl font-semibold rounded-full border-[5px] border-solid border-black flex justify-center items-center w-10 h-10">
            1
          </div>
          <div className="text-black text-base text-left">
            Launch <b>tgdaddybot</b>
          </div>
        </div>
        <a
          href="https://t.me/tgdaddybot"
          target="_blank"
          className="w-full bg-orange-200 text-black text-center text-sm mt-3 px-7 py-2.5 max-md:px-5"
        >
          Open in Telegram
        </a>
      </section>

      {/* Step 2 */}
      <section className="flex flex-col items-center mt-20 px-5 max-md:mt-10">
        <div className="flex flex-row items-start justify-start w-full gap-4 mb-2">
          <div className="text-black text-xl font-semibold rounded-full border-[5px] border-solid border-black flex justify-center items-center w-10 h-10">
            2
          </div>
          <div className="text-black text-base text-left flex-1">
            Press <b>Link Channel</b> and forward a message from your channel to
            the bot
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="flex flex-col items-center mt-20 px-5 max-md:mt-10">
        <div className="flex flex-row items-center justify-start w-full gap-4 mb-2">
          <div className="text-black text-xl font-semibold rounded-full border-[5px] border-solid border-black flex justify-center items-center w-10 h-10">
            3
          </div>
          <div className="text-black text-base text-left">You’re done!</div>
        </div>
        <Link
          href="/app/channels"
          className="w-full bg-orange-200 text-black text-center text-sm mt-3 mb-40 px-10 py-2.5 max-md:mb-10 max-md:px-5"
        >
          View Channels
        </Link>
      </section>
    </PageLayout>
  );
}
