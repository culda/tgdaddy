import { TelegramAuthData } from "@/app/components/telegramLogin/types";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const data = (await request.json()) as TelegramAuthData;
  const dataCheckString = Object.keys(data)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${data[key as keyof TelegramAuthData]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(process.env.BOT_TOKEN as string)
    .digest();

  // Calculate HMAC-SHA-256 signature
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (hmac !== data.hash) {
    alert("Data is not from Telegram");
    return;
  }

  return NextResponse.json({
    ...data,
  });
}
