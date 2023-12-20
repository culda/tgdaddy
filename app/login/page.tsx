import { redirect } from "next/navigation";
import Login from "./Login";
import { auth } from "../api/auth/[...nextauth]/auth";

export type PpParams = {
  searchParams: {
    platformLogin?: string;
    callbackUrl: string;
  };
};

export default async function Page({ searchParams }: PpParams) {
  const session = await auth();
  // const router = useRouter();
  console.log("session", session);
  if (session?.accessToken) {
    console.log("redirecting", searchParams.callbackUrl);
    return redirect(searchParams.callbackUrl ?? "/app");
  }
  return <Login {...searchParams} />;
}
