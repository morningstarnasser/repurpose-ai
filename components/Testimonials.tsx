import ScrollReveal from "./ScrollReveal";

const testimonials = [
  {
    name: "Sarah K.",
    role: "Content Creator",
    quote: "RepurposeAI saves me 3 hours every day. I paste one blog post and get content for all my social channels instantly.",
    color: "bg-primary",
    rotate: "rotate-[-1deg]",
  },
  {
    name: "Marcus T.",
    role: "Marketing Manager",
    quote: "The tone selector is a game-changer. I can switch between professional LinkedIn posts and casual Twitter threads in seconds.",
    color: "bg-accent",
    rotate: "rotate-[1deg]",
  },
  {
    name: "Elena R.",
    role: "Podcast Host",
    quote: "I upload my podcast episodes and get show notes, social posts, and newsletter content automatically. Absolute magic.",
    color: "bg-lavender",
    rotate: "rotate-[-0.5deg]",
  },
  {
    name: "David L.",
    role: "Startup Founder",
    quote: "We went from posting once a week to daily across 10 platforms. Our engagement tripled in the first month.",
    color: "bg-lime",
    rotate: "rotate-[0.5deg]",
  },
];

export default function Testimonials() {
  return (
    <section className="px-6 py-20 md:py-28 bg-white" id="testimonials">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-lime rotate-[1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase">
            Loved by <span className="text-secondary">Creators</span>
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i + 1}>
              <div className={`brutal-card p-6 md:p-8 ${t.rotate} hover:rotate-0 transition-transform h-full`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${t.color} brutal-border w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-xs text-dark/40 font-medium">{t.role}</div>
                  </div>
                </div>
                <p className="text-dark/70 font-medium leading-relaxed text-sm md:text-base">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
