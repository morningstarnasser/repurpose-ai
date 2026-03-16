import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveRepurpose, getUserRepurposes, generateOutputs } from "@/lib/repurpose";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await getUserRepurposes(session.user.email);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, contentType, title } = await req.json();
  if (!content || content.trim().length < 20) {
    return NextResponse.json({ error: "Content must be at least 20 characters" }, { status: 400 });
  }

  const outputs = await generateOutputs(content, contentType || "text");
  const id = `rp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const result = {
    id,
    userId: session.user.email,
    userEmail: session.user.email,
    title: title || content.slice(0, 60) + "...",
    originalContent: content,
    contentType: contentType || "text",
    outputs,
    createdAt: new Date().toISOString(),
  };

  await saveRepurpose(result);
  return NextResponse.json(result, { status: 201 });
}
