export type PlanId = "free" | "starter" | "pro" | "business";

export interface PlanConfig {
  name: string;
  price: string;
  period: string;
  repurposeLimit: number;
  imageLimit: number;
  voiceSampleLimit: number;
  hasFileImport: boolean;
  hasPriority: boolean;
  hasPerPlatformRegen: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    repurposeLimit: 5,
    imageLimit: 3,
    voiceSampleLimit: 0,
    hasFileImport: false,
    hasPriority: false,
    hasPerPlatformRegen: false,
  },
  starter: {
    name: "Starter",
    price: "$9",
    period: "/month",
    repurposeLimit: 30,
    imageLimit: 15,
    voiceSampleLimit: 0,
    hasFileImport: false,
    hasPriority: false,
    hasPerPlatformRegen: true,
  },
  pro: {
    name: "Pro",
    price: "$19",
    period: "/month",
    repurposeLimit: Infinity,
    imageLimit: Infinity,
    voiceSampleLimit: 5,
    hasFileImport: true,
    hasPriority: true,
    hasPerPlatformRegen: true,
  },
  business: {
    name: "Business",
    price: "$49",
    period: "/month",
    repurposeLimit: Infinity,
    imageLimit: Infinity,
    voiceSampleLimit: 10,
    hasFileImport: true,
    hasPriority: true,
    hasPerPlatformRegen: true,
  },
};

export const PAID_PLANS: PlanId[] = ["starter", "pro", "business"];

/** Map env var price IDs to plan names */
export function getPlanFromPriceId(priceId: string): PlanId {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "starter";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return "business";
  return "free";
}

/** Get the Stripe price ID env var for a plan */
export function getPriceIdForPlan(plan: PlanId): string | undefined {
  switch (plan) {
    case "starter": return process.env.STRIPE_STARTER_PRICE_ID;
    case "pro": return process.env.STRIPE_PRO_PRICE_ID;
    case "business": return process.env.STRIPE_BUSINESS_PRICE_ID;
    default: return undefined;
  }
}

export function getPlanConfig(plan: string): PlanConfig {
  return PLANS[plan as PlanId] || PLANS.free;
}

export function isPaidPlan(plan: string): boolean {
  return PAID_PLANS.includes(plan as PlanId);
}
