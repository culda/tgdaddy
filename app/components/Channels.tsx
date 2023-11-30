"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";

console.log(process.env.NEXT_PUBLIC_API_ENDPOINT);

const Channels = () => {
  const session = useSession();
  console.log("sss", session.data);

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = session.data?.accessToken;
    if (!token) {
      return;
    }
    const fetchChannels = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/channels?id=${session.data?.user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch channels");
        }
        const data = await response.json();
        setChannels(data); // Adjust this to match the structure of your data
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [session.data?.accessToken]);

  if (loading) {
    return <p>Loading channels...</p>;
  }

  return (
    <div>
      <h1>Your Channels</h1>
      <ul>
        {/* {channels.map((channel) => (
          <li key={channel.id}>{channel.title}</li> // Adjust according to your data structure
        ))} */}
      </ul>
    </div>
  );
};

export default Channels;
