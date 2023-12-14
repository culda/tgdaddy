"use client";
import { SessionProvider } from "next-auth/react";
import SnackbarProvider from "../components/SnackbarProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider>
      <SessionProvider>{children}</SessionProvider>
    </SnackbarProvider>
  );
}
