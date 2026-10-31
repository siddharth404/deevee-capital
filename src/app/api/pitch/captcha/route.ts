import { NextResponse } from "next/server";
import { generateCaptchaChallenge } from "@/lib/captcha";

export const runtime = "nodejs";

export async function GET() {
  const challenge = generateCaptchaChallenge();
  return NextResponse.json(
    {
      ok: true,
      token: challenge.token,
      svg: challenge.svg,
      prompt: challenge.prompt,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
