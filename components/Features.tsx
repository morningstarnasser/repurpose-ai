import ScrollReveal from "./ScrollReveal";

const features = [
  {
    title: "Any Input Format",
    description:
      "Paste text, import a URL, upload audio/video files, drop a PDF, or paste a YouTube link. We extract and transcribe everything automatically.",
    tags: ["Text", "URL", "YouTube", "MP3", "MP4", "PDF"],
    icon: "I",
    color: "bg-primary",
    rotate: "rotate-[-1deg]",
  },
  {
    title: "10 Platforms, 1 Click",
    description:
      "AI generates optimized content for Twitter/X, LinkedIn, Instagram, TikTok, Email, YouTube, Reddit, Threads, Blog Posts, and Carousel Slides.",
    icon: "!",
    color: "bg-secondary",
    rotate: "rotate-[1deg]",
  },
  {
    title: "Keep Your Voice",
    description:
      "Save writing samples and let the AI learn your unique style. Every output matches your personality, vocabulary, and tone across all platforms.",
    tags: ["Style Learning", "Up to 5 Samples"],
    icon: "V",
    color: "bg-lavender",
    rotate: "rotate-[-0.5deg]",
  },
  {
    title: "YouTube Integration",
    description:
      "Paste any YouTube URL and we automatically extract the transcript. Repurpose video content into posts for every platform instantly.",
    tags: ["Transcript", "Thumbnail", "Auto-detect"],
    icon: "Y",
    color: "bg-lime",
    rotate: "rotate-[0.5deg]",
  },
  {
    title: "AI Image Generation",
    description:
      "Generate platform-optimized images for every output. Instagram squares, YouTube thumbnails, TikTok verticals -- all with one click.",
    tags: ["SDXL", "Per-Platform Sizes"],
    icon: "*",
    color: "bg-accent",
    rotate: "rotate-[1deg]",
  },
  {
    title: "One-Click Sharing",
    description:
      "Share directly to Twitter/X, LinkedIn, Reddit, Threads, or email. Copy & Open for Instagram, TikTok, and YouTube. Download everything at once.",
    icon: ">",
    color: "bg-primary",
    rotate: "rotate-[-0.5deg]",
  },
];

export default function Features() {
  return (
    <section className="px-6 py-20 md:py-28 bg-[#FAFAFA]" id="features">
      <div className="max-w-6xl mx-auto">
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
          <p className="text-dark/60 font-medium mt-4 max-w-2xl mx-auto text-base md:text-lg">
            Everything you need to turn one piece of content into a full multi-platform strategy.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={Math.min(i, 3)}>
              <div
                className={`brutal-card p-6 md:p-8 h-full ${feature.rotate} hover:rotate-0 transition-transform bg-white`}
              >
                <div
                  className={`${feature.color} brutal-border w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-bold mb-5 md:mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold uppercase mb-3">
                  {feature.title}
                </h3>
                <p className="text-dark/70 font-medium leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
                {feature.tags && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="brutal-border bg-[#FAFAFA] px-2 py-0.5 text-xs font-bold uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
