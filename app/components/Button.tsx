import Link, { LinkProps } from "next/link";

const className =
  "flex mx-auto h-11 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg relative";

const LoadingSpinner = () => (
  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function Button({
  children,
  href,
  loading,
  onClick,
  ...props
}: Omit<LinkProps, "href"> & {
  href?: string;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const content = loading ? <LoadingSpinner /> : children;

  if (href) {
    return (
      <Link className={className} href={href} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}
