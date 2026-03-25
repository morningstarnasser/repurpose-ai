import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/email";
import { sql } from "@/lib/db";

function htmlPage(title: string, message: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{margin:0;padding:0;font-family:'Space Grotesk',system-ui,sans-serif;background:#FAFAFA;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{max-width:480px;border:3px solid #000;box-shadow:6px 6px 0 #000;background:#fff;padding:40px;text-align:center}
h1{font-size:24px;font-weight:800;text-transform:uppercase;margin:0 0 16px}
p{font-size:14px;color:#333;line-height:1.6;margin:0}</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
}

async function unsubscribe(email: string, token: string): Promise<boolean> {
  if (!email || !token) return false;
  if (!verifyUnsubscribeToken(email, token)) return false;

  await sql`
    UPDATE users
    SET preferences = COALESCE(preferences, '{}'::jsonb) || '{"notifyBlog": false}'::jsonb
    WHERE email = ${email}
  `;
  return true;
}

// GET: User clicks unsubscribe link in email
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  const token = req.nextUrl.searchParams.get("token") || "";

  const ok = await unsubscribe(email, token);

  if (!ok) {
    return new NextResponse(
      htmlPage("Invalid Link", "This unsubscribe link is invalid or has expired."),
      { status: 400, headers: { "Content-Type": "text/html" } },
    );
  }

  return new NextResponse(
    htmlPage("Unsubscribed", "You have been unsubscribed from RepurposeAI blog notifications. You can re-enable them anytime in your profile settings."),
    { headers: { "Content-Type": "text/html" } },
  );
}

// POST: RFC 8058 One-Click Unsubscribe (email clients send this automatically)
export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  const token = req.nextUrl.searchParams.get("token") || "";

  const ok = await unsubscribe(email, token);

  if (!ok) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
