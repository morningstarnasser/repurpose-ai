import ScrollReveal from "./ScrollReveal";

const useCases = [
  {
    role: "Content Creator",
    workflow: "Blog Post → 10 Social Posts",
    description:
      "Write one blog post and instantly get a Twitter thread, LinkedIn article, Instagram caption, TikTok script, and 6 more platform-ready versions.",
    icon: "✍️",
    color: "bg-primary",
    rotate: "rotate-[-1deg]",
  },
  {
    role: "Podcast Host",
    workflow: "Episode → Show Notes & Clips",
    description:
      "Upload your episode, get an automatic transcription, then generate show notes, social clips, a newsletter snippet, and a blog post from one recording.",
    icon: "🎙️",
    color: "bg-accent",
    rotate: "rotate-[1deg]",
  },
  {
    role: "Marketing Team",
    workflow: "Campaign → Multi-Platform Content",
    description:
      "Turn one campaign brief into coordinated content across all 10 platforms. Choose a professional tone for LinkedIn, casual for Twitter, and funny for TikTok.",
    icon: "📊",
    color: "bg-lavender",
    rotate: "rotate-[-0.5deg]",
  },
  {
    role: "Startup Founder",
    workflow: "Product Update → Everywhere",
    description:
      "Paste your product changelog or launch announcement and distribute it as a Reddit post, email newsletter, Twitter thread, and carousel — all at once.",
    icon: "🚀",
    color: "bg-lime",
    rotate: "rotate-[0.5deg]",
  },
];

export default function Testimonials() {
  return (
    <section className="px-6 py-20 md:py-28 bg-[#FAFAFA]" id="use-cases">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-lime rotate-[1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              Use Cases
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase">
            Built for <span className="text-secondary">Every Creator</span>
          </h2>
          <p className="text-dark/60 font-medium mt-4 max-w-2xl mx-auto text-base md:text-lg">
            No matter your role, RepurposeAI saves you hours every week.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
          {useCases.map((uc, i) => (
            <ScrollReveal key={uc.role} delay={Math.min(i, 3)}>
              <div
                className={`brutal-card p-6 md:p-8 ${uc.rotate} hover:rotate-0 transition-transform h-full bg-white`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`${uc.color} brutal-border w-12 h-12 flex items-center justify-center text-2xl`}
                  >
                    {uc.icon}
                  </div>
                  <div>
                    <div className="font-bold text-base md:text-lg">{uc.role}</div>
                    <div className="text-xs text-dark/40 font-bold uppercase tracking-wider">
                      {uc.workflow}
                    </div>
                  </div>
                </div>
                <p className="text-dark/70 font-medium leading-relaxed text-sm md:text-base">
                  {uc.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
