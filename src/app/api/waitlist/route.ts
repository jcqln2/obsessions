import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: string; website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (body.website) {
    return NextResponse.json({ ok: true });
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

  return NextResponse.json({
    ok: true,
    message: "You're on the list — we'll email you when it's your turn.",
  });
}
