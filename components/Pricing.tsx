import ScrollReveal from "./ScrollReveal";

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
      "6 platform outputs",
      "AI-powered generation",
      "URL import & file upload",
      "Copy & download outputs",
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
      "6 platform outputs",
      "Advanced AI with custom tone",
      "URL, audio, video & PDF import",
      "Audio/video transcription",
      "Priority AI processing",
      "Pay with card or crypto",
    ],
    cta: "Start Pro Trial",
  },
];

export default function Pricing() {
  return (
    <section className="px-6 py-20 md:py-28 bg-white" id="pricing">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-secondary text-white rotate-[1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase">
            Simple Pricing.
            <br />
            <span className="text-secondary">No Surprises.</span>
          </h2>
        </ScrollReveal>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i + 1}>
              <div
                className={`brutal-card p-6 md:p-8 ${plan.color} relative h-full flex flex-col ${
                  plan.popular ? "md:-translate-y-4" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 -right-3 md:-right-4 brutal-border bg-accent px-3 md:px-4 py-1 rotate-[3deg]">
                    <span className="text-xs md:text-sm font-bold uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl md:text-2xl font-bold uppercase mb-2">
                  {plan.name}
                </h3>
                <p className="text-dark/60 font-medium mb-4 text-sm md:text-base">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6 md:mb-8">
                  <span className="text-4xl md:text-5xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-base md:text-lg font-medium text-dark/60">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="brutal-border bg-lime w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold shrink-0 mt-0.5">
                        &#10003;
                      </span>
                      <span className="font-medium text-sm md:text-base">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`brutal-btn w-full py-3 md:py-4 text-base md:text-lg ${plan.buttonColor}`}
                >
                  {plan.cta}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
