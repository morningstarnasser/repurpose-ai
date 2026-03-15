const steps = [
  {
    step: "01",
    title: "Upload",
    description:
      "Drop in your podcast, blog post, video, or any content. We support all major formats.",
    color: "bg-primary",
  },
  {
    step: "02",
    title: "AI Transform",
    description:
      "Our AI analyzes your content and generates optimized versions for every platform.",
    color: "bg-secondary",
  },
  {
    step: "03",
    title: "Export",
    description:
      "Download everything or publish directly. Each piece is tailored to its platform.",
    color: "bg-accent",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-24 bg-[#FAFAFA]" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-lime rotate-[-1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              How It Works
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold uppercase">
            Three Steps.
            <br />
            <span className="text-accent">That&apos;s It.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-[3px] bg-black z-0 -translate-x-1/2" />
              )}

              <div className="brutal-card p-8 relative z-10 bg-white">
                {/* Step number */}
                <div
                  className={`${item.color} brutal-border w-14 h-14 flex items-center justify-center text-xl font-bold mb-6`}
                >
                  {item.step}
                </div>

                <h3 className="text-3xl font-bold uppercase mb-3">
                  {item.title}
                </h3>
                <p className="text-dark/70 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
