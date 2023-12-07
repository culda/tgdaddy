"use client";
import { useSession } from "next-auth/react";
import { StChannel } from "../model/types";
import EditableForm from "./EditableInput";
import { TpUpdateUsername } from "@/functions/channelUsername/handler";

type PpChannel = {
  channel?: StChannel;
};

export default function Channel({ channel }: PpChannel) {
  const session = useSession();
  const setUsername = async (username: string) => {
    const pattern = /^[A-Za-z0-9\-\_]+$/;

    if (!pattern.test(username)) {
      throw new Error(
        "Username can only contain letters, numbers, and the following characters: - _"
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/channelUsername`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify({
          id: channel?.id,
          oldUsername: channel?.username,
          newUsername: username,
        } as TpUpdateUsername),
      }
    );

    console.log(res);
  };
  return (
    <section class="text-gray-600 body-font">
      <div class="container  py-24 mx-auto flex flex-wrap">
        <div class="flex relative pb-20 sm:items-center mx-auto">
          <div class="h-full w-6 absolute inset-0 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-200 pointer-events-none"></div>
          </div>
          <div class="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-indigo-500 text-white relative z-10 title-font font-medium text-sm">
            1
          </div>
          <div class="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
            <div class="flex-shrink-0 w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div class="flex-grow sm:pl-6 mt-6 sm:mt-0">
              <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
                Username
              </h2>
              <p class="leading-relaxed">
                This is the public address of your channel.
              </p>
              <EditableForm
                defaultValue={channel?.username}
                onSave={(v) => setUsername(v)}
              />
            </div>
          </div>
        </div>
        <div class="flex relative pb-20 sm:items-center mx-auto">
          <div class="h-full w-6 absolute inset-0 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-200 pointer-events-none"></div>
          </div>
          <div class="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-indigo-500 text-white relative z-10 title-font font-medium text-sm">
            2
          </div>
          <div class="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
            <div class="flex-shrink-0 w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div class="flex-grow sm:pl-6 mt-6 sm:mt-0">
              <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
                The Catalyzer
              </h2>
              <p class="leading-relaxed">
                VHS cornhole pop-up, try-hard 8-bit iceland helvetica. Kinfolk
                bespoke try-hard cliche palo santo offal.
              </p>
            </div>
          </div>
        </div>
        <div class="flex relative pb-20 sm:items-center mx-auto">
          <div class="h-full w-6 absolute inset-0 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-200 pointer-events-none"></div>
          </div>
          <div class="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-indigo-500 text-white relative z-10 title-font font-medium text-sm">
            3
          </div>
          <div class="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
            <div class="flex-shrink-0 w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="5" r="3"></circle>
                <path d="M12 22V8M5 12H2a10 10 0 0020 0h-3"></path>
              </svg>
            </div>
            <div class="flex-grow sm:pl-6 mt-6 sm:mt-0">
              <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
                The 400 Blows
              </h2>
              <p class="leading-relaxed">
                VHS cornhole pop-up, try-hard 8-bit iceland helvetica. Kinfolk
                bespoke try-hard cliche palo santo offal.
              </p>
            </div>
          </div>
        </div>
        <div class="flex relative pb-10 sm:items-center mx-auto">
          <div class="h-full w-6 absolute inset-0 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-200 pointer-events-none"></div>
          </div>
          <div class="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-indigo-500 text-white relative z-10 title-font font-medium text-sm">
            4
          </div>
          <div class="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
            <div class="flex-shrink-0 w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="flex-grow sm:pl-6 mt-6 sm:mt-0">
              <h2 class="font-medium title-font text-gray-900 mb-1 text-xl">
                Neptune
              </h2>
              <p class="leading-relaxed">
                VHS cornhole pop-up, try-hard 8-bit iceland helvetica. Kinfolk
                bespoke try-hard cliche palo santo offal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    // <div className="bg-white flex flex-col pt-6 pb-12">
    //   <header className="self-center flex items-stretch justify-between gap-5">
    //     <img
    //       loading="lazy"
    //       srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&"
    //       className="aspect-square object-contain object-center w-[120px] overflow-hidden shrink-0 max-w-full"
    //     />
    //     <div className="self-center flex grow basis-[0%] flex-col items-center my-auto px-5">
    //       <h1 className="text-black text-xl font-black whitespace-nowrap">
    //         {channel?.title}
    //       </h1>
    //       <a
    //         href="#"
    //         className="text-black text-center text-sm whitespace-nowrap justify-center items-stretch bg-orange-200 self-stretch mt-6 px-5 py-2.5"
    //       >
    //         Create username
    //       </a>
    //     </div>
    //   </header>
    //   <div className="justify-between items-stretch self-center flex w-full max-w-[322px] gap-5 mt-12 px-5 py-3.5 max-md:mt-10">
    //     <div className="text-black text-base flex-1">New users today</div>
    //     <div className="text-black text-right text-base flex-1">1234</div>
    //   </div>
    //   <div className="justify-between items-stretch self-center flex w-full max-w-[322px] gap-5 mt-4 px-5 py-3.5">
    //     <div className="text-black text-base flex-1">Total Revenue</div>
    //     <div className="text-black text-right text-base flex-1">$222</div>
    //   </div>
    //   <div className="bg-zinc-300 self-stretch min-h-[1px] w-full mt-7" />
    //   <ChannelSection title="Subscription fee">
    // <EditableForm onSave={(v) => console.log(v)} />
    //   </ChannelSection>
    //   <div className="bg-zinc-300 self-stretch min-h-[1px] w-full mt-6" />
    //   <ChannelSection title="Username">
    //     <EditableForm onSave={(v) => console.log(v)} />
    //   </ChannelSection>
    //   <div className="bg-zinc-300 self-stretch min-h-[1px] w-full mt-6" />
    //   <ChannelSection title="Description">
    //     <p className="text-black text-sm self-stretch max-w-[322px] mt-8 max-md:mr-1">
    //       Lorem Ipsum is simply dummy text of the printing and typesetting
    //       industry. Lorem Ipsum has been the industry's standard dummy text ever
    //       since the 1500s, when an unknown printer took a galley of type and
    //       scrambled it to make a type specimen book
    //     </p>
    //     <a
    //       href="#"
    //       className="text-black text-center text-sm whitespace-nowrap justify-center items-stretch bg-orange-200 mt-8 px-12 py-2.5 max-md:px-5"
    //     >
    //       Edit
    //     </a>
    //   </ChannelSection>
    //   <div className="bg-zinc-300 self-stretch min-h-[1px] w-full mt-7 mb-8" />
    // </div>
  );
}
