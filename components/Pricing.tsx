"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out RepurposeAI",
    color: "bg-white",
    buttonColor: "bg-dark text-white",
    features: [
      "5 repurposes per month",
      "3 AI images per month",
      "10 platform outputs",
      "YouTube transcript extraction",
      "Copy & download outputs",
    ],
    cta: "Get Started",
    stripeplan: null,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "For hobby creators getting started",
    color: "bg-lime/30",
    buttonColor: "bg-dark text-white",
    features: [
      "30 repurposes per month",
      "15 AI images per month",
      "All 10 platforms",
      "URL import + YouTube extraction",
      "5 AI tones + regeneration",
      "One-click sharing & export",
    ],
    cta: "Start Creating",
    stripeplan: "starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For creators who mean business",
    color: "bg-primary",
    buttonColor: "bg-dark text-white",
    popular: true,
    features: [
      "Unlimited repurposes",
      "Unlimited AI images",
      "Voice Learning (keep your style)",
      "Audio, video & PDF import",
      "Per-platform regeneration",
      "Priority AI processing",
    ],
    cta: "Go Pro",
    stripeplan: "pro",
  },
  {
    id: "business",
    name: "Business",
    price: "$49",
    period: "/month",
    description: "For teams and agencies",
    color: "bg-accent/30",
    buttonColor: "bg-dark text-white",
    features: [
      "Everything in Pro",
      "10 voice samples (Pro: 5)",
      "Team sharing (coming soon)",
      "API access (coming soon)",
      "Priority support",
      "Webhook integrations",
    ],
    cta: "Go Business",
    stripeplan: "business",
  },
];

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePaidClick(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        router.push("/login");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="px-6 py-20 md:py-28 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-secondary text-white rotate-[1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-dark">
            Simple Pricing.
            <br />
            <span className="text-dark">No Surprises.</span>
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.id} delay={i + 1}>
              <div
                className={`brutal-card p-5 md:p-6 ${plan.color} relative h-full flex flex-col ${
                  plan.popular ? "lg:-translate-y-4" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 -right-3 brutal-border bg-accent px-3 py-1 rotate-[3deg]">
                    <span className="text-xs font-bold uppercase">Most Popular</span>
                  </div>
                )}

                <h3 className="text-lg md:text-xl font-bold uppercase mb-1">{plan.name}</h3>
                <p className="text-dark/60 font-medium mb-3 text-xs md:text-sm">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-5 md:mb-6">
                  <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm md:text-base font-medium text-dark/60">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="brutal-border bg-lime w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        &#10003;
                      </span>
                      <span className="font-medium text-xs md:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.stripeplan ? (
                  <button
                    onClick={() => handlePaidClick(plan.stripeplan!)}
                    disabled={loading !== null}
                    className={`brutal-btn w-full py-3 text-sm md:text-base ${plan.buttonColor} ${loading === plan.stripeplan ? "opacity-60" : ""}`}
                  >
                    {loading === plan.stripeplan ? "Loading..." : plan.cta}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/login")}
                    className={`brutal-btn w-full py-3 text-sm md:text-base ${plan.buttonColor}`}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
