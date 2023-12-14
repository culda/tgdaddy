"use client";
import Loader from "@/app/components/Loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PpParams = {
  searchParams: { redirectUrl: string };
};

export default function Page({ searchParams }: PpParams) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_HOST}/api/stripe/connect`, {
      method: "POST",
      headers: {
        ContentType: "application/json",
      },
      // body: JSON.stringify({
      //   userId: session?.data?.user.id,
      //   redirectUrl: `${process.env.NEXT_PUBLIC_HOST}${searchParams.redirectUrl}`,
      // }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const { connectUrl } = data;
        router.push(connectUrl);
      });
  }, []);

  return <Loader />;
}
