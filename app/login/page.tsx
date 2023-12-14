import ConnectTelegram from "../components/ConnectTelegram";

export default function Page() {
  return (
    <div
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            border-2 border-indigo-500 p-5 text-center"
    >
      <ConnectTelegram />
    </div>
  );
}
