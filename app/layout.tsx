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
        <title>Memberspage - Monetize your Audience</title>
        <meta
          name="description"
          content="Subscription management platform for digital content creators"
        />
        <meta
          property="og:title"
          content="Memberspage - Monetize your Audience"
        />
        <meta
          property="og:description"
          content="Subscription management platform for digital content creators"
        />
        <meta property="og:url" content="https://members.page" />
        <meta property="og:image" content="https://members.page/logo.webp" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-C4D1L2WWV5"
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
