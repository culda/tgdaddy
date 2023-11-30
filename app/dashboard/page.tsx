"use client";
import { useSession } from "next-auth/react";
import Channels from "../components/Channels";
import jwt from "next-auth/jwt";

export default function Dashboard() {
  return (
    <div>
      <h1>Welcome</h1>
      <Channels />
    </div>
  );
}
