import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRepurpose, regenerateSingleOutput, updateRepurposeOutput, getUserProfile, getVoiceSamples, getUserPlan } from "@/lib/repurpose";
import { getPlanConfig } from "@/lib/plans";

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

  // Check voice learning preference
  let voiceSamplesContent: string[] | undefined;
  const profile = await getUserProfile(session.user.email);
  const prefs = profile?.preferences || {};
  if (prefs.voiceLearning) {
    const samples = await getVoiceSamples(session.user.email);
    if (samples.length > 0) {
      voiceSamplesContent = samples.map((s) => s.content);
    }
  }

  const { plan } = await getUserPlan(session.user.email);
  const config = getPlanConfig(plan);

  const lang = (prefs.language as string) || "en";
  const newContent = await regenerateSingleOutput(item.original_content, platform, output.format, tone || "professional", voiceSamplesContent, config.hasPriority, lang);
  const outputs = await updateRepurposeOutput(id, session.user.email, platform, newContent);

  return NextResponse.json({ outputs });
}
