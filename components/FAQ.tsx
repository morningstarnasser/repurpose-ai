"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const faqs = [
  { q: "How does RepurposeAI work?", a: "Paste your content, import a URL (including YouTube videos), or upload a file. Our AI analyzes it and generates optimized versions for up to 10 different platforms in seconds." },
  { q: "What platforms do you support?", a: "Twitter/X, LinkedIn, Instagram, TikTok, Email newsletters, YouTube Shorts, Reddit, Threads, Blog Posts, and Carousel Slides." },
  { q: "Can I import YouTube videos?", a: "Yes! Paste any YouTube URL and we automatically extract the transcript and video info. The AI then repurposes the video content for all 10 platforms." },
  { q: "What is Voice Learning?", a: "Save up to 5 writing samples in your profile. When enabled, the AI matches your unique writing style, vocabulary, and personality across all generated content." },
  { q: "Can I generate images for my posts?", a: "Yes! Each output has an AI Image button that generates platform-optimized images. Instagram gets square images, YouTube gets 16:9 thumbnails, TikTok gets vertical -- all automatic. Free includes 3 images/month, Starter 15, and Pro/Business are unlimited." },
  { q: "How does sharing work?", a: "Each output has a share button. For Twitter/X, LinkedIn, Reddit, and Threads you share directly. For Instagram, TikTok, and YouTube the content is copied and the platform opens. Email outputs open your mail client. You can also download everything at once." },
  { q: "How much does it cost?", a: "We have 4 plans: Free (5 repurposes/month), Starter at $9/month (30 repurposes), Pro at $19/month (unlimited + voice learning), and Business at $49/month (everything + team features). All paid plans can be cancelled anytime." },
  { q: "Can I edit the generated content?", a: "Yes! You can edit any output inline, regenerate individual platforms with different tones, and copy or download everything." },
  { q: "What file formats can I upload?", a: "You can upload audio files (MP3, WAV, M4A), video files (MP4, MOV, WebM), and PDFs. We automatically transcribe audio/video content. You can also paste YouTube URLs for automatic transcript extraction." },
  { q: "Is my content private?", a: "Absolutely. Your content is processed securely and never shared. Only you can access your repurposed content and voice samples." },
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
