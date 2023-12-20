type PpContentLayout = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function ContentLayout({
  subtitle,
  title,
  children,
}: PpContentLayout) {
  return (
    <div className="flex flex-col py-6 max-w-md">
      {title ? (
        <header className="w-full mb-6">
          <h2 className="text-sm title-font text-gray-500 tracking-widest">
            {subtitle}
          </h2>
          <h1 className="text-gray-900 text-3xl title-font font-bold mb-4">
            {title}
          </h1>
        </header>
      ) : (
        // Skeleton text block
        <div className="animate-pulse ml-9 mt-4 self-start max-md:ml-2.5 w-full">
          <div className="h-10 bg-gray-100 rounded-md w-1/4"></div>{" "}
          {/* Adjust width as needed */}
        </div>
      )}
      {children}
    </div>
  );
}
