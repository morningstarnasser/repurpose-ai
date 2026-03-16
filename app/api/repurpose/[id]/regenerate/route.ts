import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRepurpose, regenerateSingleOutput, updateRepurposeOutput } from "@/lib/repurpose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getRepurpose(id);
  if (!item || item.user_email !== session.user.email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { platform, tone } = await req.json();
  if (!platform) return NextResponse.json({ error: "Platform required" }, { status: 400 });

  const output = item.outputs.find((o) => o.platform === platform);
  if (!output) return NextResponse.json({ error: "Platform not found" }, { status: 404 });

  const newContent = await regenerateSingleOutput(item.original_content, platform, output.format, tone || "professional");
  const outputs = await updateRepurposeOutput(id, session.user.email, platform, newContent);

  return NextResponse.json({ outputs });
}
