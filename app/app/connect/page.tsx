"use client";
import Loader from "@/app/components/Loader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_HOST}/api/stripe/connect`, {
      method: "POST",
      headers: {
        ContentType: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const { connectUrl } = data;
        router.push(connectUrl);
      });
  }, []);

  return (
    <div className="relative left-1/2 -translate-x-1/2 p-5 text-center">
      <Loader />;
    </div>
  );
}
