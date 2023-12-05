import Link, { LinkProps } from "next/link";

const className =
  "flex mx-auto mt-16 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg";

export default function Button({
  children,
  href,
  onClick,
  ...props
}: Omit<LinkProps, "href"> & {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (href) {
    return (
      <Link className={className} href={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
