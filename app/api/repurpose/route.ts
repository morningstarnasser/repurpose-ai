import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveRepurpose, getUserRepurposes, getUserPlan, getUserProfile, getVoiceSamples, generateOutputs } from "@/lib/repurpose";

const FREE_LIMIT = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await getUserRepurposes(session.user.email);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check usage limits
  const { plan, repurpose_count } = await getUserPlan(session.user.email);
  if (plan === "free" && repurpose_count >= FREE_LIMIT) {
    return NextResponse.json({ error: `Free plan limit reached (${FREE_LIMIT}/month). Upgrade to Pro for unlimited repurposes.` }, { status: 403 });
  }

  const { content, contentType, title, tone, platforms } = await req.json();
  if (!content || content.trim().length < 20) {
    return NextResponse.json({ error: "Content must be at least 20 characters" }, { status: 400 });
  }

  // Check voice learning preference
  let voiceSamples: string[] | undefined;
  const profile = await getUserProfile(session.user.email);
  const prefs = profile?.preferences || {};
  if (prefs.voiceLearning) {
    const samples = await getVoiceSamples(session.user.email);
    if (samples.length > 0) {
      voiceSamples = samples.map((s) => s.content);
    }
  }

  const outputs = await generateOutputs(content, contentType || "text", tone || "professional", platforms, voiceSamples);
  const id = `rp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const result = {
    id,
    user_email: session.user.email,
    title: title || content.slice(0, 60) + "...",
    original_content: content,
    content_type: contentType || "text",
    outputs,
    created_at: new Date().toISOString(),
  };

  await saveRepurpose(result);
  return NextResponse.json(result, { status: 201 });
}
