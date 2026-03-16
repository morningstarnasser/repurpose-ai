"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const faqs = [
  { q: "How does RepurposeAI work?", a: "Paste your content, import a URL, or upload a file. Our AI analyzes it and generates optimized versions for up to 10 different platforms in seconds." },
  { q: "What platforms do you support?", a: "Twitter/X, LinkedIn, Instagram, TikTok, Email newsletters, YouTube Shorts, Reddit, Threads, Blog Posts, and Carousel Slides." },
  { q: "How much does it cost?", a: "Free plan includes 5 repurposes per month. Pro plan is $19/month for unlimited repurposes with advanced features like custom tone and priority processing." },
  { q: "Can I edit the generated content?", a: "Yes! You can edit any output inline, regenerate individual platforms with different tones, and copy or download everything." },
  { q: "What file formats can I upload?", a: "You can upload audio files (MP3, WAV, M4A), video files (MP4, MOV, WebM), and PDFs. We automatically transcribe audio/video content." },
  { q: "Is my content private?", a: "Absolutely. Your content is processed securely and never shared. Only you can access your repurposed content." },
  { q: "Can I choose a specific tone?", a: "Yes! Choose from Professional, Casual, Funny, Inspirational, or Technical tones. You can even regenerate individual outputs with different tones." },
  { q: "Do you offer a free trial?", a: "The free plan is available forever with 5 repurposes per month. No credit card required to get started." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-6 py-20 md:py-28 bg-[#FAFAFA]" id="faq">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-accent rotate-[-1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase">
            Got <span className="text-secondary">Questions?</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={Math.min(i, 3)}>
              <div className="brutal-card bg-white overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-bold text-sm md:text-base pr-4">{faq.q}</span>
                  <span className="brutal-border w-8 h-8 flex items-center justify-center text-lg font-bold bg-primary shrink-0">
                    {open === i ? "-" : "+"}
                  </span>
                </button>
                {open === i && (
                  <div className="px-5 pb-5 text-sm text-dark/70 font-medium leading-relaxed border-t-2 border-black/10 pt-3">
                    {faq.a}
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
