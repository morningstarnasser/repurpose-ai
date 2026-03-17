"use client";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-20 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-block brutal-card px-4 py-2 mb-8 bg-primary rotate-[-2deg] hover:rotate-0">
          <span className="text-sm font-bold uppercase tracking-wider">
            AI-Powered Content Engine
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.95] tracking-tight mb-6">
          Repurpose
          <span className="block text-secondary">Your Content</span>
          <span className="block">
            With{" "}
            <span className="bg-accent px-3 md:px-4 brutal-border inline-block rotate-[1deg] hover:rotate-[-1deg] transition-transform">
              AI
            </span>
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-10 font-medium text-dark/70">
          Turn one piece of content into dozens. Podcasts to tweets, blogs to
          carousels, videos to threads &mdash; all in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#pricing" className="brutal-btn px-8 py-4 text-lg bg-primary">
            Start Free &rarr;
          </a>
          <a href="#how-it-works" className="brutal-btn px-8 py-4 text-lg bg-white">
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-6">
          {[
            { number: "10", label: "Platforms" },
            { number: "5", label: "AI Tones" },
            { number: "5+", label: "Input Formats" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="brutal-card px-5 sm:px-6 py-3 sm:py-4 bg-white hover:bg-lime"
            >
              <div className="text-xl sm:text-2xl font-bold">{stat.number}</div>
              <div className="text-xs sm:text-sm uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
