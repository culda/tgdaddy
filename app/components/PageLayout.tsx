type PpPageLayout = {
  title: string;
  children: React.ReactNode;
};

export default function PageLayout({ title, children }: PpPageLayout) {
  return (
    <div className="bg-white flex flex-col py-12 max-w-md">
      <header className="text-black text-4xl font-extrabold whitespace-nowrap ml-9 mt-4 self-start max-md:ml-2.5">
        {title}
      </header>
      <hr className="bg-neutral-200 self-stretch min-h-[1px] w-full mt-6" />
      {children}
    </div>
  );
}
