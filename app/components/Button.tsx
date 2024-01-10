import Link from 'next/link';
import React, { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

const variantStyles = {
  primary: 'text-white bg-blue-800 hover:bg-blue-900 border-0',
  secondary: 'text-black bg-orange-300 hover:bg-orange-400 border-0',
  text: 'bg-transparent hover:bg-gray-100 hover:border-gray-300',
};

type Size = 'sm' | 'md' | 'lg';

const LoadingSpinner = ({ variant }: { variant: Variant }) => (
  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div
      className={`w-4 h-4 border-2 ${
        variant === 'text' ? 'border-black' : 'border-white'
      } border-t-transparent rounded-full animate-spin`}
    ></div>
  </div>
);

type Variant = 'primary' | 'secondary' | 'text';

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  loading?: boolean;
  size?: Size;
  active?: boolean;
  variant?: Variant;
  onClick?: () => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export default function Button({
  children,
  href,
  loading,
  onClick,
  active,
  size = 'md',
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const content = loading ? <LoadingSpinner variant={variant} /> : children;
  const variantClassName = variantStyles[variant];
  const buttonClassName = `flex items-center justify-center py-2 px-4 h-10 text-gray-700 disabled:bg-gray-400 focus:outline-none rounded text-${size} relative ${variantClassName} ${
    active ? 'border-2 border-blue-800 ' : ''
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
      className={[buttonClassName, className || ''].join(' ')}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}
