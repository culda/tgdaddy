import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";

const variantStyles = {
  primary: "text-white bg-indigo-500 hover:bg-indigo-600 border-0",
  secondary: "text-white bg-orange-300 hover:bg-orange-400 border-0",
  text: "bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300",
};

const LoadingSpinner = ({ variant }: { variant: Variant }) => (
  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div
      className={`w-4 h-4 border-2 ${
        variant === "text" ? "border-black" : "border-white"
      } border-t-transparent rounded-full animate-spin`}
    ></div>
  </div>
);

type Variant = "primary" | "secondary" | "text";

export default function Button({
  children,
  href,
  loading,
  onClick,
  variant = "primary",
  ...props
}: {
  href?: string;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: Variant;
} & Omit<LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const content = loading ? <LoadingSpinner variant={variant} /> : children;
  const variantClassName = variantStyles[variant];
  const buttonClassName = `flex mx-auto h-11 py-2 px-8 focus:outline-none rounded text-lg relative ${variantClassName}`;

  if (href) {
    return (
      <Link className={buttonClassName} href={href} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}
