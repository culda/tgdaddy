type PpChannelSection = {
  title: string;
  children: React.ReactNode;
};

export default function ChannelSection({
  title,
  children,
}: PpChannelSection): React.ReactElement {
  return (
    <div className="self-stretch flex w-full flex-col mt-6 px-9 items-start max-md:px-5">
      <h2 className="text-black text-center text-xl font-semibold whitespace-nowrap ml-3 max-md:ml-2.5">
        {title}
      </h2>
      {children}
    </div>
  );
}
