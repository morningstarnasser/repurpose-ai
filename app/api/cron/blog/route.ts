import { NextRequest, NextResponse } from "next/server";
import { savePost, deleteOldPosts } from "@/lib/blog";
import { sql } from "@/lib/db";
import { sendBlogNewsletter } from "@/lib/email";

export const maxDuration = 60;

const TOPICS = [
  "How to repurpose a podcast into 10 social media posts",
  "The ultimate guide to content repurposing in {year}",
  "Why every creator needs an AI content strategy",
  "Blog to video: transforming written content for TikTok and Reels",
  "Content multiplication: work less, publish more",
  "How AI is changing content creation for small businesses",
  "5 ways to turn one webinar into a month of content",
  "The ROI of content repurposing: real numbers from real creators",
  "LinkedIn content strategy: repurpose your best ideas",
  "From long-form to short-form: the art of content adaptation",
  "How to build a content flywheel with AI",
  "Twitter threads from blog posts: a step-by-step guide",
  "Video content repurposing: YouTube to Instagram in minutes",
  "Email newsletters from podcast episodes: automate your workflow",
  "The future of AI-powered content marketing",
  "How to create a week of content from one blog post",
  "Instagram carousel ideas: repurpose your top-performing content",
  "Why repurposing beats creating from scratch every time",
  "Content repurposing for e-commerce: drive sales on every platform",
  "The creator's guide to cross-platform content strategy",
  "How to use AI to write better social media captions",
  "Repurposing webinar content: from live to evergreen",
  "Reddit marketing: how to repurpose content for communities",
  "Threads vs Twitter: adapting your content for both platforms",
  "How to turn customer testimonials into viral content",
  "SEO meets social: repurposing blog content for maximum reach",
  "The psychology of content that gets shared across platforms",
  "How solopreneurs save 10+ hours weekly with content repurposing",
  "AI tools for content creators: what actually works in {year}",
  "Building a personal brand through consistent content repurposing",
];

async function generatePost(topic: string): Promise<string> {
  // Primary: NVIDIA NIM (Kimi K2)
  const nvidiaKey = process.env.NVIDIA_NIM_API_KEY;
  if (nvidiaKey) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${nvidiaKey}` },
        body: JSON.stringify({
          model: "moonshotai/kimi-k2-instruct-0905",
          messages: [
            { role: "system", content: "You are an expert content marketing writer for RepurposeAI, a SaaS tool that helps creators repurpose content across 10 platforms. Write engaging, informative blog posts in markdown format. Include practical tips, examples, and actionable advice. Use headers (##), bullet points, and bold text for readability. Write 800-1200 words. Do NOT start with a # title heading." },
            { role: "user", content: `Write a blog post about: "${topic}". Include an engaging introduction, 3-5 main sections with ## headers, and a conclusion with a call-to-action mentioning RepurposeAI.` },
          ],
          max_tokens: 2000,
          temperature: 0.8,
        }),
        signal: AbortSignal.timeout(45000),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
    } catch { /* fallback */ }
  }

  // Fallback: DeepSeek
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an expert content marketing writer for RepurposeAI, a SaaS tool that helps creators repurpose content across 10 platforms. Write engaging, informative blog posts in markdown format. Include practical tips, examples, and actionable advice. Use headers (##), bullet points, and bold text for readability. Write 800-1200 words. Do NOT start with a # title heading." },
        { role: "user", content: `Write a blog post about: "${topic}". Include an engaging introduction, 3-5 main sections with ## headers, and a conclusion with a call-to-action mentioning RepurposeAI.` },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) throw new Error(`DeepSeek API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron sends CRON_SECRET automatically
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Delete posts older than 30 days
    const deleted = await deleteOldPosts(30);

    // 2. Pick a random topic with current year
    const year = new Date().getFullYear().toString();
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)].replace("{year}", year);

    // 3. Generate blog post
    const content = await generatePost(topic);

    // 4. Extract title and save
    const firstLine = content.split("\n")[0].replace(/^#\s*/, "").trim();
    const title = firstLine || topic;
    const cleanContent = content.replace(/^#\s*.+\n/, "").trim();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const wordCount = cleanContent.split(/\s+/).length;

    const post = {
      slug: `${slug}-${Date.now()}`,
      title,
      excerpt: cleanContent.replace(/[#*_]/g, "").slice(0, 160) + "...",
      content: cleanContent,
      author: "RepurposeAI",
      date: new Date().toISOString().split("T")[0],
      tags: ["content-marketing", "ai", "repurposing"],
      readTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
    };

    await savePost(post);

    // Send newsletter to opted-in users
    let newsletterSent = 0;
    try {
      const subscribers = await sql`
        SELECT email FROM users WHERE preferences->>'notifyBlog' = 'true'
      `;
      for (const row of subscribers) {
        try {
          await sendBlogNewsletter(row.email as string, post);
          newsletterSent++;
          // 200ms SMTP courtesy delay
          if (newsletterSent < subscribers.length) {
            await new Promise((r) => setTimeout(r, 200));
          }
        } catch {
          // Skip individual failures
        }
      }
    } catch {
      // Non-blocking: newsletter failure doesn't affect blog generation
    }

    return NextResponse.json({ success: true, slug: post.slug, title: post.title, deleted, newsletterSent });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Blog generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
