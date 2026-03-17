"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const inputText = `"The number one productivity hack isn't a tool or an app — it's learning to say no. Every yes is a no to something else. Protect your time like it's your most valuable asset, because it is."`;

const outputs = [
  {
    platform: "Twitter / X",
    icon: "𝕏",
    color: "bg-white",
    content: `🧵 The #1 productivity hack no one talks about:

It's not a tool.
It's not an app.
It's not a morning routine.

It's learning to say NO.

Here's why this changes everything ↓

(1/5)`,
  },
  {
    platform: "LinkedIn",
    icon: "in",
    color: "bg-[#0A66C2]",
    textColor: "text-white",
    content: `After 10 years in business, here's the productivity advice I wish I heard on day one:

Stop saying yes to everything.

Every "yes" is a silent "no" to something that might matter more — your health, your family, your best work.

The most productive people aren't the busiest. They're the most intentional.

What did you say "no" to this week? 👇`,
  },
  {
    platform: "TikTok",
    icon: "♪",
    color: "bg-black",
    textColor: "text-white",
    content: `[HOOK - 0:00]
"Stop downloading productivity apps. The real hack is one word."

[BODY - 0:05]
"The #1 productivity hack is learning to say NO. Every time you say yes to something, you're saying no to something else. Your time is your most valuable asset — start treating it that way."

[CTA - 0:50]
"What's one thing you need to say no to? Comment below."`,
  },
  {
    platform: "Email",
    icon: "✉",
    color: "bg-primary",
    content: `Subject: The one-word productivity hack

Hey [First Name],

I used to think productivity meant doing more. More apps, more systems, more hustle.

But the real game-changer? One word: No.

Every yes is a trade-off. Protect your time like the asset it is.

This week, try saying no to one thing that doesn't align with your goals. You'll be surprised how freeing it feels.

— RepurposeAI Team`,
  },
];

export default function Demo() {
  const [active, setActive] = useState(0);

  return (
    <section className="px-6 py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-accent rotate-[1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              See It In Action
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase">
            One Input.
            <br />
            <span className="text-accent">Four Outputs.</span>
          </h2>
          <p className="text-dark/60 font-medium mt-4 max-w-2xl mx-auto text-base md:text-lg">
            Paste a quote, and see how AI transforms it for every platform.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Input Side */}
          <ScrollReveal>
            <div className="brutal-card p-6 md:p-8 bg-lime/30 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="brutal-border bg-primary w-10 h-10 flex items-center justify-center text-lg font-bold">
                  📥
                </div>
                <h3 className="font-bold uppercase text-lg">Your Input</h3>
              </div>
              <div className="brutal-border bg-white p-4 md:p-5">
                <p className="text-dark/80 font-medium leading-relaxed text-sm md:text-base italic">
                  {inputText}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-dark/50 text-xs font-medium">
                <span className="brutal-border bg-white px-2 py-0.5 text-xs font-bold">TEXT</span>
                <span>Pasted content</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Output Side */}
          <ScrollReveal delay={1}>
            <div className="brutal-card p-6 md:p-8 bg-white h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="brutal-border bg-secondary w-10 h-10 flex items-center justify-center text-lg font-bold text-white">
                  ⚡
                </div>
                <h3 className="font-bold uppercase text-lg">AI Output</h3>
              </div>

              {/* Platform Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {outputs.map((o, i) => (
                  <button
                    key={o.platform}
                    onClick={() => setActive(i)}
                    className={`brutal-border px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                      active === i
                        ? "bg-dark text-white translate-x-[2px] translate-y-[2px] shadow-none"
                        : "bg-white hover:bg-lime/30"
                    }`}
                  >
                    {o.platform}
                  </button>
                ))}
              </div>

              {/* Output Content */}
              <div className="brutal-border bg-[#FAFAFA] p-4 md:p-5 flex-1 min-h-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`${outputs[active].color} ${outputs[active].textColor || ""} brutal-border w-8 h-8 flex items-center justify-center text-sm font-bold`}
                  >
                    {outputs[active].icon}
                  </div>
                  <span className="font-bold text-sm">{outputs[active].platform}</span>
                </div>
                <pre className="text-dark/80 font-medium leading-relaxed text-xs md:text-sm whitespace-pre-wrap font-[inherit]">
                  {outputs[active].content}
                </pre>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
