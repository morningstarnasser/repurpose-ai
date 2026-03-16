import { NextRequest, NextResponse } from "next/server";
import { initDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-secret");
  if (secret !== process.env.BLOG_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await initDB();
  return NextResponse.json({ success: true, message: "Tables created" });
}
