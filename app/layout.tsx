'use client';
import React from 'react';
import { Alatsi } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';
import SnackbarProvider from './components/SnackbarProvider';

const alatsi = Alatsi({
  weight: '400',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-C4D1L2WWV5"
        ></Script>
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() {
                window.dataLayer.push(arguments);
              }
              gtag("js", new Date());
              gtag("config", "G-C4D1L2WWV5");
            `,
          }}
        ></Script>
      </head>
      <body className={alatsi.className}>
        <SnackbarProvider>
          <SessionProvider>{children}</SessionProvider>
        </SnackbarProvider>
      </body>
    </html>
  );
}
