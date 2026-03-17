import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Rate limit: max 3 codes per email in 10 minutes
    const recent = await sql`
      SELECT COUNT(*) as cnt FROM verification_codes
      WHERE email = ${trimmed} AND created_at > NOW() - INTERVAL '10 minutes'
    `;
    if (Number(recent[0].cnt) >= 3) {
      return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Store in DB (expires in 10 minutes)
    await sql`
      INSERT INTO verification_codes (email, code, expires_at)
      VALUES (${trimmed}, ${code}, NOW() + INTERVAL '10 minutes')
    `;

    // Send email
    await sendVerificationCode(trimmed, code);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send code error:", err);
    return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
  }
}
