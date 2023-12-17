import Link from "next/link";
import React, { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const variantStyles = {
  primary: "text-white bg-indigo-500 hover:bg-indigo-600 border-0",
  secondary: "text-black bg-orange-300 hover:bg-orange-400 border-0",
  text: "bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300",
};

type Size = "sm" | "md" | "lg";

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

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  loading?: boolean;
  size?: Size;
  active?: boolean;
  variant?: Variant;
  onClick?: () => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

export default function Button({
  children,
  href,
  loading,
  onClick,
  active,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const content = loading ? <LoadingSpinner variant={variant} /> : children;
  const variantClassName = variantStyles[variant];
  const padding = size === "sm" ? "p-2" : size === "md" ? "p-2" : "p-2";
  const buttonClassName = `flex items-center justify-center h-10 ${padding} disabled:bg-gray-400 focus:outline-none rounded text-${size} relative ${variantClassName} ${
    active ? "border-2 border-indigo-800 " : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={buttonClassName} passHref {...props}>
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
