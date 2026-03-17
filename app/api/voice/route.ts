import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVoiceSamples, addVoiceSample, deleteVoiceSample } from "@/lib/repurpose";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const samples = await getVoiceSamples(session.user.email);
  return NextResponse.json(samples);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, label } = await req.json();
  if (!content || content.trim().length < 20) {
    return NextResponse.json({ error: "Content must be at least 20 characters" }, { status: 400 });
  }

  try {
    const result = await addVoiceSample(session.user.email, content.slice(0, 2000), label);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save voice sample";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const deleted = await deleteVoiceSample(session.user.email, id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
