type PpPageLayout = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function PageLayout({
  subtitle,
  title,
  children,
}: PpPageLayout) {
  return (
    <div className="flex flex-col py-12 max-w-md">
      {title ? (
        <header className="lg:w-1/2 w-full lg:pr-10 lg:py-6 mb-6 lg:mb-0">
          <h2 class="text-sm title-font text-gray-500 tracking-widest">
            {subtitle}
          </h2>
          <h1 class="text-gray-900 text-3xl title-font font-medium mb-4">
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
