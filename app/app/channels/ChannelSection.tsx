export default function ChannelSection({
  children,
  isLastSection = false,
  isFirstSection = false,
}: {
  children: React.ReactNode;
  isFirstSection?: boolean;
  isLastSection?: boolean;
}) {
  return (
    <section className="flex flex-grow relative pb-10 sm:items-center">
      <div className="w-14 absolute inset-0 flex items-center justify-center">
        <div
          className={`w-1 bg-gray-200 pointer-events-none ${
            isLastSection ? "h-1/2 -translate-y-1/2" : "h-full"
          } ${isFirstSection ? "h-1/2 translate-y-1/2" : "h-full"}`}
        ></div>
        <div className="flex-shrink-0 w-14 h-14 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center absolute -translate-y-2/4"></div>
      </div>
      <div className="flex-grow pl-20 flex sm:items-center items-start flex-col sm:flex-row">
        <div className="flex-grow sm:pl-6 mt-6 sm:mt-0 gap-2">{children}</div>
      </div>
    </section>
  );
}
