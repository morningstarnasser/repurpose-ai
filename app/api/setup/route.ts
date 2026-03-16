import { NextRequest, NextResponse } from "next/server";
import { initDB } from "@/lib/db";
import { savePost } from "@/lib/blog";

const SEED_POSTS = [
  {
    slug: "how-to-repurpose-podcast-into-social-media",
    title: "How to Repurpose a Podcast into 10+ Social Media Posts",
    excerpt: "Learn the exact process to turn a single podcast episode into tweets, LinkedIn posts, Instagram carousels, audiograms, and more — saving hours of content creation time.",
    author: "RepurposeAI",
    date: "2026-03-15",
    tags: ["podcasting", "social-media", "content-repurposing"],
    readTime: "4 min read",
  },
  {
    slug: "ai-content-strategy-2026",
    title: "The Ultimate AI Content Strategy for 2026",
    excerpt: "AI has fundamentally changed how creators produce content. Here's the complete strategy for using AI tools to multiply your content output without sacrificing quality.",
    author: "RepurposeAI",
    date: "2026-03-14",
    tags: ["ai", "content-strategy", "marketing"],
    readTime: "5 min read",
  },
  {
    slug: "blog-to-video-guide",
    title: "Blog to Video: Transform Written Content for TikTok and Reels",
    excerpt: "Your best blog posts are goldmines for short-form video content. Learn how to convert written articles into engaging TikToks, Reels, and YouTube Shorts that actually perform.",
    author: "RepurposeAI",
    date: "2026-03-13",
    tags: ["video-content", "tiktok", "content-repurposing"],
    readTime: "4 min read",
  },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-secret");
  if (secret !== process.env.BLOG_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDB();

  // Seed blog posts if requested
  const url = new URL(req.url);
  if (url.searchParams.get("seed") === "true") {
    for (const post of SEED_POSTS) {
      const content = await getPostContent(post.slug);
      await savePost({ ...post, content });
    }
    return NextResponse.json({ success: true, message: "Tables created + blog seeded" });
  }

  return NextResponse.json({ success: true, message: "Tables created" });
}

async function getPostContent(slug: string): Promise<string> {
  const contents: Record<string, string> = {
    "how-to-repurpose-podcast-into-social-media": `## Why Repurpose Your Podcast?\n\nYou spent hours recording, editing, and publishing a podcast episode. But if you're only publishing it as audio, you're leaving **90% of its value on the table**.\n\nThe average podcast episode contains enough material for 10-15 pieces of social media content. Here's how to extract every drop of value.\n\n## The 10-Piece Framework\n\n### 1. Pull Key Quotes (3-5 Posts)\n\nEvery episode has quotable moments. Identify the most impactful 1-2 sentence quotes and turn them into:\n- **Twitter/X posts** with the quote + episode link\n- **Instagram quote cards** with branded design\n- **LinkedIn text posts** with context around the quote\n\n### 2. Create Audiograms (2-3 Posts)\n\nShort 30-60 second audio clips with waveform visuals perform incredibly well:\n- Pick the most engaging segments\n- Add captions (85% of social video is watched muted)\n- Optimize dimensions for each platform\n\n### 3. Write a Thread (1 Post)\n\nSummarize your episode's key takeaways in a Twitter/X thread:\n- Start with a hook that makes people stop scrolling\n- One takeaway per tweet\n- End with a CTA to listen to the full episode\n\n### 4. Blog Post Summary (1 Post)\n\nTranscribe and edit into a blog post:\n- Great for SEO\n- Reaches people who prefer reading\n- Can be further repurposed into newsletters\n\n### 5. Short-Form Video (2-3 Posts)\n\nExtract the best moments and create:\n- **TikTok clips** (30-60 seconds)\n- **YouTube Shorts** (vertical, punchy)\n- **Instagram Reels** (with trending audio overlay)\n\n## The Time-Saving Secret\n\nDoing this manually takes 4-6 hours per episode. With **RepurposeAI**, you upload your podcast and get all 10+ pieces generated in minutes. The AI understands context, identifies the best moments, and formats everything for each platform.\n\n## Start Repurposing Today\n\nStop creating content from scratch every day. Let your best ideas work harder for you. Try RepurposeAI free and turn your next podcast episode into a week's worth of social media content.`,
    "ai-content-strategy-2026": `## The Content Creation Paradigm Shift\n\nIn 2026, the creators who thrive aren't the ones producing the most original content. They're the ones who **create once and distribute everywhere** — using AI to adapt their best ideas for every platform and format.\n\n## The 1-to-Many Content Model\n\nThe old model: Create 7 pieces of content per week from scratch.\nThe new model: Create 1 piece of deep content, then repurpose it into 15+ platform-specific pieces.\n\n### Step 1: Create Your Pillar Content\n\nStart with one substantial piece:\n- A 30-minute podcast episode\n- A 2,000-word blog post\n- A 10-minute YouTube video\n- A live webinar or workshop\n\nThis is your **pillar content** — the foundation everything else builds on.\n\n### Step 2: AI-Powered Extraction\n\nUse AI to extract different content types:\n- **Key insights** become tweet threads\n- **Data points** become infographics\n- **Stories and examples** become short-form video scripts\n- **How-to sections** become carousel posts\n- **Controversial takes** become engagement posts\n\n### Step 3: Platform Optimization\n\nEach platform has its own language:\n- **LinkedIn**: Professional tone, paragraph-based, tag relevant people\n- **Twitter/X**: Punchy, conversational, thread format\n- **Instagram**: Visual-first, use carousels, strong CTAs in bio\n- **TikTok**: Hook in first 2 seconds, trending sounds, raw authenticity\n- **YouTube Shorts**: Value-packed, fast-paced editing\n\n### Step 4: Schedule and Distribute\n\nBatch your content and schedule it:\n- Monday: Publish pillar content\n- Tue-Fri: Release repurposed pieces across platforms\n- Weekend: Engage with comments and community\n\n## Real Numbers from Real Creators\n\nCreators using the 1-to-many model report:\n- **3x more engagement** across platforms\n- **60% less time** spent on content creation\n- **2x follower growth** compared to single-platform creators\n\n## How RepurposeAI Fits In\n\nRepurposeAI automates Steps 2 and 3 entirely. Upload your pillar content, and the AI generates platform-optimized versions for every channel you publish on. No prompting, no manual editing — just content that's ready to post.\n\n## Start Building Your Content Engine\n\nThe best time to start repurposing was yesterday. The second best time is now. Sign up for RepurposeAI and transform your content strategy today.`,
    "blog-to-video-guide": `## Your Blog Posts Are Video Scripts in Disguise\n\nEvery blog post you've written contains multiple video ideas. A 1,500-word article typically yields **5-8 short-form videos**. The content is already there — you just need to reformat it.\n\n## The Blog-to-Video Process\n\n### 1. Identify Video-Worthy Sections\n\nNot every paragraph makes a good video. Look for:\n- **How-to steps** ("Here's how to do X in 3 steps")\n- **Statistics or data** ("Did you know that 80% of...")\n- **Hot takes** ("Stop doing X, do Y instead")\n- **Lists** ("5 tools every creator needs")\n- **Before/after** ("I changed X and here's what happened")\n\n### 2. Write the Hook\n\nYou have **2 seconds** to stop the scroll. Transform your blog intro into:\n- A bold statement: "This one change doubled my engagement"\n- A question: "Why are you still creating content from scratch?"\n- A pattern interrupt: "POV: You just saved 10 hours this week"\n\n### 3. Structure for Video\n\nBlog structure vs. video structure:\n- **Blog**: Intro → Context → Details → Conclusion\n- **Video**: Hook → Value → Proof → CTA\n\nKeep it under 60 seconds. One idea per video.\n\n### 4. Choose Your Format\n\n- **Talking head**: You on camera explaining the concept\n- **Screen recording**: Showing a process or tool\n- **Text overlay**: Key points with music and visuals\n- **AI-generated**: Animated summaries with narration\n\n### 5. Platform Optimization\n\n**TikTok**:\n- Use trending sounds\n- Raw, authentic feel\n- Strong hook in first frame\n- Hashtags in description\n\n**Instagram Reels**:\n- More polished editing\n- Brand-consistent colors\n- CTA to check bio link\n- Save-worthy content\n\n**YouTube Shorts**:\n- Educational content performs best\n- Include subscribe CTA\n- Can link to full YouTube video\n\n## The ROI of Blog-to-Video\n\nOne creator reported:\n- Blog post: 500 views in a month\n- TikTok from the same content: 50,000 views in 48 hours\n- Combined: 3x more email signups than the blog alone\n\nThe content was identical — only the format changed.\n\n## Automate with RepurposeAI\n\nRepurposeAI reads your blog post and automatically generates video scripts, hooks, and platform-specific adaptations. It even suggests which sections will perform best as videos based on engagement patterns.\n\n## Stop Leaving Views on the Table\n\nYour blog archive is a content goldmine. Start converting your best posts into videos today and reach audiences you've never reached before.`,
  };
  return contents[slug] || "";
}
