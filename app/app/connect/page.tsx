import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { TpConnectStripeResponse } from "@/functions/connectStripe/handler";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  const connectRes = await fetch(`${process.env.API_ENDPOINT}/connectStripe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      ContentType: "application/json",
    },
  });

  const { connectUrl } = (await connectRes.json()) as TpConnectStripeResponse;

  return redirect(connectUrl);
}
