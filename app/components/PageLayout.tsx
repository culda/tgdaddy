type PpPageLayout = {
  title?: string;
  children: React.ReactNode;
};

export default function PageLayout({ title, children }: PpPageLayout) {
  return (
    <div className="bg-white flex flex-col py-12 max-w-md">
      {title ? (
        <header className="text-black text-4xl font-extrabold whitespace-nowrap ml-9 mt-4 self-start max-md:ml-2.5">
          {title}
        </header>
      ) : (
        // Skeleton text block
        <div className="animate-pulse ml-9 mt-4 self-start max-md:ml-2.5 w-full">
          <div className="h-10 bg-gray-100 rounded-md w-1/4"></div>{" "}
          {/* Adjust width as needed */}
        </div>
      )}
      <hr className="bg-neutral-200 self-stretch min-h-[1px] w-full mt-6" />
      {children}
    </div>
  );
}
