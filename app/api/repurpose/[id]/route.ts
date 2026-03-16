import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRepurpose, updateRepurposeOutput, toggleFavorite } from "@/lib/repurpose";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const item = await getRepurpose(id);
  if (!item || item.user_email !== session.user.email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { platform, content } = await req.json();
  if (!platform || !content) return NextResponse.json({ error: "Platform and content required" }, { status: 400 });

  const outputs = await updateRepurposeOutput(id, session.user.email, platform, content);
  if (!outputs) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ outputs });
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await toggleFavorite(id, session.user.email);
  return NextResponse.json({ success: true });
}
