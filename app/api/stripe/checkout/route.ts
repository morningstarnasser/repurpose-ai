import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrGetCustomer, createCheckoutSession } from "@/lib/stripe";
import { updateUserStripe } from "@/lib/repurpose";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const customerId = await createOrGetCustomer(session.user.email, session.user.name || undefined);
  await updateUserStripe(session.user.email, { stripe_customer_id: customerId });

  const origin = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://repurpose-ai-nine.vercel.app";
  const checkoutSession = await createCheckoutSession(
    customerId,
    priceId,
    `${origin}/dashboard?payment=success`,
    `${origin}/dashboard?payment=cancelled`,
  );

  return NextResponse.json({ url: checkoutSession.url });
}
