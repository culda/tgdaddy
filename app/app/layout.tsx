"use client";
import React, { useState } from "react";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    // <html lang="en">
    <body className={inter.className}>
      <div className="relative flex flex-col md:flex-row md:items-stretch max-md:px-5 min-h-screen">
        {/* Hamburger Icon */}
        <button
          className="md:hidden absolute bottom-5 right-5 z-50"
          onClick={toggleMenu}
        >
          <span>☰</span>
        </button>

        {/* Menu */}
        <nav
          className={`fixed inset-0 z-40 flex text-center items-center justify-center ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 md:w-1/3 lg:w-[35%]`}
        >
          <ul className="list-none p-0 m-0">
            <li className="mb-4">
              <Link href={"/"}>
                <img
                  loading="lazy"
                  className="aspect-[2.22] object-contain object-center w-[102px] overflow-hidden"
                  alt="Channel Logo"
                />
              </Link>
            </li>
            <li className="mb-4">
              <Link
                href="/app/channels"
                className="text-black text-xl font-semibold whitespace-nowrap"
              >
                Channels
              </Link>
            </li>
            <li>
              <Link
                href="/app/plan"
                className="text-black text-xl font-semibold whitespace-nowrap"
              >
                Plan
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col items-stretch w-full md:w-[65%]">
          <div className="flex grow flex-col">
            <SessionProvider>{children}</SessionProvider>
          </div>
        </div>
      </div>
    </body>
    // </html>
  );
}
