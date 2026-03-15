import ScrollReveal from "./ScrollReveal";

export default function CTA() {
  return (
    <section className="px-6 py-20 md:py-28 bg-dark">
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative badge */}
          <div className="inline-block brutal-border px-4 py-2 mb-8 bg-primary rotate-[-2deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              Ready to Start?
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-white leading-tight mb-6">
            Stop Creating Once.
            <br />
            <span className="text-primary">Start Multiplying.</span>
          </h2>

          <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto mb-10">
            Join 10,000+ creators who save hours every week by repurposing their
            content with AI. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#pricing"
              className="brutal-btn px-8 py-4 text-lg bg-primary"
            >
              Start Free Today &rarr;
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/40 text-sm font-medium">
            <span>No credit card</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>5 free repurposes/month</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
