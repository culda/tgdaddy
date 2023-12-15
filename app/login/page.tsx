import { redirect } from "next/navigation";
import { auth } from "../api/auth/[...nextauth]/auth";
import ConnectTelegram from "../components/ConnectTelegram";

type PpParams = {
  searchParams: {
    platformLogin?: boolean;
    callbackUrl?: string;
  };
};

export default async function Page({ searchParams }: PpParams) {
  // const session = await auth();
  // console.log("sess", session);
  // if (session) {
  //   console.log("redirecting to", searchParams.callbackUrl ?? "/app");
  //   return redirect(searchParams.callbackUrl ?? "/app");
  // }
  return (
    <div
      className="fixed top-1/2 left-1/2 md:w-md -translate-x-1/2 -translate-y-1/2 
            border-2 border-indigo-500 p-5 text-center"
    >
      <ConnectTelegram
        platformLogin={Boolean(searchParams.platformLogin)}
        callbackUrl={searchParams.callbackUrl}
      />
    </div>
  );
}
