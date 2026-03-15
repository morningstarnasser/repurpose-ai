const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out RepurposeAI",
    color: "bg-white",
    buttonColor: "bg-dark text-white",
    features: [
      "5 repurposes per month",
      "3 output formats",
      "Basic AI generation",
      "Download as files",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For creators who mean business",
    color: "bg-primary",
    buttonColor: "bg-dark text-white",
    popular: true,
    features: [
      "Unlimited repurposes",
      "50+ output formats",
      "Advanced AI with custom tone",
      "Direct platform publishing",
      "Schedule & queue content",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Pro Trial",
  },
];

export default function Pricing() {
  return (
    <section className="px-6 py-24 bg-white" id="pricing">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-secondary text-white rotate-[1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              Pricing
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold uppercase">
            Simple Pricing.
            <br />
            <span className="text-secondary">No Surprises.</span>
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`brutal-card p-8 ${plan.color} relative ${
                plan.popular ? "md:-translate-y-4" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 -right-4 brutal-border bg-accent px-4 py-1 rotate-[3deg]">
                  <span className="text-sm font-bold uppercase">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold uppercase mb-2">
                {plan.name}
              </h3>
              <p className="text-dark/60 font-medium mb-4">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-lg font-medium text-dark/60">
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="brutal-border bg-lime w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      &#10003;
                    </span>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`brutal-btn w-full py-4 text-lg ${plan.buttonColor}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
