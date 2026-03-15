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
    <section className="px-6 py-24 bg-white" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-lavender rotate-[1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              Features
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold uppercase">
            One Input,
            <br />
            <span className="text-secondary">Endless Outputs</span>
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`brutal-card p-8 ${feature.rotate} hover:rotate-0 transition-transform`}
            >
              <div
                className={`${feature.color} brutal-border w-16 h-16 flex items-center justify-center text-3xl mb-6`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold uppercase mb-3">
                {feature.title}
              </h3>
              <p className="text-dark/70 font-medium leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
