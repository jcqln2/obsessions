import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
  tooManyRequestsResponse,
} from "@/lib/security/rate-limit";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/security/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = await rateLimit(`waitlist:${ip}`, "waitlist", 5, "1 h");
  if (!limit.success) {
    return tooManyRequestsResponse(limit);
  }

  let body: { email?: string; website?: string; turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  if (isTurnstileConfigured()) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const valid = await verifyTurnstileToken(token, ip);
    if (!valid) {
      return NextResponse.json({ error: "Captcha verification failed. Try again." }, { status: 400 });
    }
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({ email, status: "pending" });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: true, message: "You're already on the waitlist." },
        { status: 200 }
      );
    }
    console.error("[POST /api/waitlist]", error.message);
    return NextResponse.json({ error: "Could not join waitlist. Try again later." }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      message: "You're on the list — we'll email you when it's your turn.",
    },
    { headers: rateLimitHeaders(limit) }
  );
}
