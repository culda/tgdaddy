"use client";

import React from "react";

export default function ConnectStripe() {
  const connectStripeAccount = async () => {
    try {
      const res = await fetch("/connect-stripe", { method: "POST" });
      const link = await res.json();
      if (!link.url) {
        throw new Error("Failed to create Stripe account link");
      }
      window.location.href = link.url;
    } catch (error) {
      console.error("Failed to connect to Stripe:", error);
    }
  };

  return (
    <div>
      <h1>Connect Your Stripe Account</h1>
      <button onClick={connectStripeAccount}>"Connect to Stripe"</button>
    </div>
  );
}
