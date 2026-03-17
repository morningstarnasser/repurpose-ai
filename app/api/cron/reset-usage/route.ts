import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || !safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reset usage count for plans with monthly limits (free + starter)
  const result = await sql`UPDATE users SET repurpose_count = 0, image_count = 0 WHERE plan IN ('free', 'starter')`;
  return NextResponse.json({ success: true, reset: result.length ?? 0 });
}
