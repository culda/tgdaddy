"use client";
import React, { useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative bg-white flex flex-col md:flex-row md:items-stretch max-md:px-5 min-h-screen">
          {/* Hamburger Icon */}
          <button
            className="md:hidden absolute bottom-5 right-5 z-50"
            onClick={toggleMenu}
          >
            <span>☰</span>
          </button>

          {/* Menu */}
          <nav
            className={`fixed inset-0 z-40 bg-white flex text-center items-center justify-center ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            } md:relative md:translate-x-0 md:w-1/3 lg:w-[35%]`}
          >
            <ul className="list-none p-0 m-0">
              <li className="mb-4">
                <img
                  loading="lazy"
                  className="aspect-[2.22] object-contain object-center w-[102px] overflow-hidden"
                  alt="Channel Logo"
                />
              </li>
              <li className="mb-4">
                <a
                  href="/channels"
                  className="text-black text-xl font-semibold whitespace-nowrap"
                >
                  Channels
                </a>
              </li>
              <li>
                <a
                  href="/plan"
                  className="text-black text-xl font-semibold whitespace-nowrap"
                >
                  Plan
                </a>
              </li>
            </ul>
          </nav>

          {/* Main Content */}
          <div className="flex flex-col items-stretch w-full md:w-[65%]">
            <div className="flex grow flex-col">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
