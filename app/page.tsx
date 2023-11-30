import ConnectTelegram from "./components/ConnectTelegram";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="App">
        <ConnectTelegram />
        {/* <ConnectStripe /> */}
      </div>
    </main>
  );
}
