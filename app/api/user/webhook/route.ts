import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWebhook, updateUserWebhook, getUserPlan } from "@/lib/repurpose";
import { getPlanConfig } from "@/lib/plans";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await getUserPlan(session.user.email);
  const config = getPlanConfig(plan);
  if (plan !== "business") {
    return NextResponse.json({ error: `Webhooks require a Business plan (current: ${config.name})` }, { status: 403 });
  }

  const webhookUrl = await getUserWebhook(session.user.email);
  return NextResponse.json({ webhook_url: webhookUrl });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await getUserPlan(session.user.email);
  if (plan !== "business") {
    return NextResponse.json({ error: "Webhooks require a Business plan" }, { status: 403 });
  }

  const { webhook_url } = await req.json();

  // Validate URL if provided
  if (webhook_url) {
    try {
      const parsed = new URL(webhook_url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "Webhook URL must use HTTP or HTTPS" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }
  }

  await updateUserWebhook(session.user.email, webhook_url || null);
  return NextResponse.json({ webhook_url: webhook_url || null });
}
