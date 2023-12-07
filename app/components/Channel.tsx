"use client";
import { StChannel } from "../model/types";
import ChannelSection from "./ChannelSection";
import EditableForm from "./ChannelInfoForm";
import PageLayout from "./PageLayout";

type PpChannel = {
  channel?: StChannel;
};

export default function Channel({ channel }: PpChannel) {
  return (
    <PageLayout title={channel?.title}>
      <div className="bg-white flex flex-col pt-6 pb-12">
        <header className="self-center flex items-stretch justify-between gap-5">
          <img
            loading="lazy"
            srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/803aeb8decd74c2e4b6dc61e4602a13f213351414725b438d5d9051f247d831d?apiKey=1ce0a2f518a7411992f1f40d8ab03118&"
            className="aspect-square object-contain object-center w-[120px] overflow-hidden shrink-0 max-w-full"
          />
          <div className="self-center flex grow basis-[0%] flex-col items-center my-auto px-5">
            <h1 className="text-black text-xl font-black whitespace-nowrap">
              {channel?.title}
            </h1>
            <a
              href="#"
              className="text-black text-center text-sm whitespace-nowrap justify-center items-stretch bg-orange-200 self-stretch mt-6 px-5 py-2.5"
            >
              Create username
            </a>
          </div>
        </header>
        <div className="justify-between items-stretch self-center flex w-full max-w-[322px] gap-5 mt-12 px-5 py-3.5 max-md:mt-10">
          <div className="text-black text-base flex-1">New users today</div>
          <div className="text-black text-right text-base flex-1">1234</div>
        </div>
        <div className="justify-between items-stretch self-center flex w-full max-w-[322px] gap-5 mt-4 px-5 py-3.5">
          <div className="text-black text-base flex-1">Total Revenue</div>
          <div className="text-black text-right text-base flex-1">$222</div>
        </div>
        <div className="bg-zinc-300 self-stretch min-h-[1px] w-full mt-7" />
        <ChannelSection title="Access fee">
          <EditableForm onSave={(v) => console.log(v)} />
        </ChannelSection>
        <div className="bg-zinc-300 self-stretch min-h-[1px] w-full mt-6" />
        <ChannelSection title="Username">
          <EditableForm onSave={(v) => console.log(v)} />
        </ChannelSection>
        <div className="bg-zinc-300 self-stretch min-h-[1px] w-full mt-6" />
        <ChannelSection title="Description">
          <p className="text-black text-sm self-stretch max-w-[322px] mt-8 max-md:mr-1">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book
          </p>
          <a
            href="#"
            className="text-black text-center text-sm whitespace-nowrap justify-center items-stretch bg-orange-200 mt-8 px-12 py-2.5 max-md:px-5"
          >
            Edit
          </a>
        </ChannelSection>
        <div className="bg-zinc-300 self-stretch min-h-[1px] w-full mt-7 mb-8" />
      </div>
    </PageLayout>
  );
}
