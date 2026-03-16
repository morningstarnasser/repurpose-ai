import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getUserByStripeCustomerId, updateUserStripe } from "@/lib/repurpose";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.customer && session.subscription) {
      const user = await getUserByStripeCustomerId(session.customer as string);
      if (user) {
        await updateUserStripe(user.email, {
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
          plan: "pro",
        });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const user = await getUserByStripeCustomerId(sub.customer as string);
    if (user) {
      await updateUserStripe(user.email, {
        subscription_status: "cancelled",
        plan: "free",
        stripe_subscription_id: "",
      });
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const user = await getUserByStripeCustomerId(sub.customer as string);
    if (user) {
      await updateUserStripe(user.email, {
        subscription_status: sub.status,
        plan: sub.status === "active" ? "pro" : "free",
      });
    }
  }

  return NextResponse.json({ received: true });
}
