"use client";
import ConnectStripe from "./components/ConnectStripe";
import ConnectTelegram from "./components/ConnectTelegram";
import { SessionProvider, useSession } from "next-auth/react";

function Home() {
  const session = useSession();
  console.log("sess", session);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="App">
        <ConnectTelegram />
        <ConnectStripe />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Home />
    </SessionProvider>
  );
}
