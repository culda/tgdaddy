import { StChannel } from "../model/types";

type PpChannel = {
  channel?: StChannel;
};

export default function Channel({ channel }: PpChannel) {
  console.log(channel);
  return (
    <div className="bg-white flex flex-col items-stretch px-14 py-12 max-md:px-5 h-screen">
      <div className="flex flex-col relative shrink-0 box-border min-h-[100px] pb-5 px-5">
        <section className="flex flex-col relative shrink-0 box-border min-h-[100px] w-full self-stretch grow max-w-[1200px] items-stretch mx-auto pb-5 px-5">
          <div
            className="text-black text-xl text-center whitespace-nowrap justify-center items-center px-16 py-3.5 max-md:mt-10 max-md:px-5 bg-gradient-to-b from-cyan-500 to-transparent"
            aria-label="Channel Name"
          >
            {channel?.title}
          </div>
          <div className="justify-between items-stretch flex gap-5 mt-3 py-2.5">
            <div className="text-black text-xl" aria-label="Users">
              Users
            </div>
            <div
              className="text-black text-center text-xl"
              aria-label="User Count"
            >
              1234
            </div>
          </div>
          <div className="justify-between items-stretch flex gap-5 mt-4 py-2.5">
            <div
              className="text-black text-xl whitespace-nowrap"
              aria-label="Sub Revenue"
            >
              Sub revenue
            </div>
            <div
              className="text-black text-center text-xl"
              aria-label="Revenue Amount"
            >
              $222
            </div>
          </div>
        </section>
      </div>
      <div className="flex flex-col relative shrink-0 box-border min-h-[100px] p-5">
        <section className="flex flex-col relative shrink-0 box-border min-h-[100px] w-full self-stretch grow max-w-[1200px] items-stretch mx-auto p-5">
          <div
            className="text-black text-xl text-center whitespace-nowrap justify-center items-center px-16 py-3.5 max-md:mt-10 max-md:px-5 bg-gradient-to-b from-cyan-500 to-transparen0"
            aria-label="Username"
          >
            Username
          </div>
          <a
            className="text-black text-center text-xl whitespace-nowrap justify-center items-stretch bg-orange-200 mt-7 mb-52 px-14 py-2.5 max-md:mb-10 max-md:px-5"
            href="#"
            aria-label="Get landing page"
          >
            Get landing page
          </a>
        </section>
      </div>
    </div>
  );
}
