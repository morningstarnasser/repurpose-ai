import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrGetCustomer, createCheckoutSession } from "@/lib/stripe";
import { updateUserStripe } from "@/lib/repurpose";
import { getPriceIdForPlan, PAID_PLANS, type PlanId } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json().catch(() => ({ plan: "pro" }));
  if (!PAID_PLANS.includes(plan as PlanId)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceIdForPlan(plan as PlanId);
  if (!priceId) return NextResponse.json({ error: "Stripe not configured for this plan" }, { status: 500 });

  const customerId = await createOrGetCustomer(session.user.email, session.user.name || undefined);
  await updateUserStripe(session.user.email, { stripe_customer_id: customerId });

  const origin = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://repurpose-ai-nine.vercel.app";
  const checkoutSession = await createCheckoutSession(
    customerId,
    priceId,
    `${origin}/dashboard?payment=success`,
    `${origin}/dashboard?payment=cancelled`,
    { plan },
  );

  return NextResponse.json({ url: checkoutSession.url });
}
