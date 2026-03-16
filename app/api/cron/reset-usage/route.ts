import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reset usage count for free users on the 1st of each month
  const result = await sql`UPDATE users SET repurpose_count = 0 WHERE plan = 'free'`;
  return NextResponse.json({ success: true, reset: result.length ?? 0 });
}
