import React, { useState } from "react";

export default function ConnectStripe() {
  const [loading, setLoading] = useState(false);

  const connectStripeAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch("/connect-stripe", { method: "POST" });
      const link = await res.json();
      if (!link.url) {
        throw new Error("Failed to create Stripe account link");
      }
      window.location.href = link.url;
    } catch (error) {
      console.error("Failed to connect to Stripe:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Connect Your Stripe Account</h1>
      <button onClick={connectStripeAccount} disabled={loading}>
        {loading ? "Loading..." : "Connect to Stripe"}
      </button>
    </div>
  );
}
