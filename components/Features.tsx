import ScrollReveal from "./ScrollReveal";

const features = [
  {
    title: "Podcast → Social",
    description:
      "Upload your podcast and get tweet threads, LinkedIn posts, Instagram captions, and audiograms — automatically.",
    icon: "🎙️",
    color: "bg-primary",
    rotate: "rotate-[-1deg]",
  },
  {
    title: "Blog → Video",
    description:
      "Transform blog posts into short-form videos, TikToks, YouTube Shorts, and animated summaries with AI narration.",
    icon: "📝",
    color: "bg-secondary",
    rotate: "rotate-[1deg]",
  },
  {
    title: "One-Click Export",
    description:
      "Export to every platform at once. Optimized dimensions, hashtags, and captions included. Schedule or post instantly.",
    icon: "🚀",
    color: "bg-accent",
    rotate: "rotate-[-0.5deg]",
  },
];

export default function Features() {
  return (
    <section className="px-6 py-20 md:py-28 bg-white" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-lavender rotate-[1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase">
            One Input,
            <br />
            <span className="text-secondary">Endless Outputs</span>
          </h2>
        </ScrollReveal>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i + 1}>
              <div
                className={`brutal-card p-6 md:p-8 h-full ${feature.rotate} hover:rotate-0 transition-transform`}
              >
                <div
                  className={`${feature.color} brutal-border w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-3xl mb-5 md:mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold uppercase mb-3">
                  {feature.title}
                </h3>
                <p className="text-dark/70 font-medium leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
