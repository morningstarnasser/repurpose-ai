import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/lib/repurpose";
import { createPortalSession } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.email);
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  const origin = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://repurpose-ai-nine.vercel.app";
  const portalSession = await createPortalSession(
    profile.stripe_customer_id as string,
    `${origin}/dashboard/profile`,
  );

  return NextResponse.json({ url: portalSession.url });
}
