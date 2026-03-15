import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    step: "01",
    title: "Upload",
    description:
      "Drop in your podcast, blog post, video, or any content. We support all major formats — MP3, MP4, PDF, Markdown, and more.",
    color: "bg-primary",
    icon: "📤",
  },
  {
    step: "02",
    title: "AI Transform",
    description:
      "Our AI analyzes your content, extracts key insights, and generates optimized versions for every platform automatically.",
    color: "bg-secondary",
    icon: "⚡",
  },
  {
    step: "03",
    title: "Export",
    description:
      "Download everything or publish directly. Each piece is tailored to its platform with proper dimensions and formatting.",
    color: "bg-accent",
    icon: "🎯",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-20 md:py-28 bg-[#FAFAFA]" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-lime rotate-[-1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              How It Works
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase">
            Three Steps.
            <br />
            <span className="text-accent">That&apos;s It.</span>
          </h2>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[20%] right-[20%] h-[3px] bg-black" />

          {steps.map((item, i) => (
            <ScrollReveal key={item.step} delay={i + 1}>
              <div className="brutal-card p-6 md:p-8 relative z-10 bg-white h-full">
                {/* Step number + icon */}
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                  <div
                    className={`${item.color} brutal-border w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg md:text-xl font-bold shrink-0`}
                  >
                    {item.step}
                  </div>
                  <span className="text-2xl">{item.icon}</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold uppercase mb-3">
                  {item.title}
                </h3>
                <p className="text-dark/70 font-medium leading-relaxed text-sm md:text-base">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
