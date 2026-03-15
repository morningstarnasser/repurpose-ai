import { NextRequest, NextResponse } from "next/server";
import { savePost } from "@/lib/blog";

const TOPICS = [
  "How to repurpose a podcast into 10 social media posts",
  "The ultimate guide to content repurposing in 2026",
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
];

async function generateWithNvidia(topic: string): Promise<string> {
  const res = await fetch(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2-instruct-0905",
        messages: [
          {
            role: "system",
            content:
              "You are an expert content marketing writer for RepurposeAI, a SaaS tool that helps creators repurpose content. Write engaging, informative blog posts in markdown format. Include practical tips, examples, and actionable advice. Use headers (##), bullet points, and bold text for readability. Write 800-1200 words.",
          },
          {
            role: "user",
            content: `Write a blog post about: "${topic}". Include an engaging introduction, 3-5 main sections with headers, and a conclusion with a call-to-action mentioning RepurposeAI.`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    }
  );

  if (!res.ok) throw new Error(`NVIDIA API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function generateWithDeepSeek(topic: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content marketing writer for RepurposeAI, a SaaS tool that helps creators repurpose content. Write engaging, informative blog posts in markdown format. Include practical tips, examples, and actionable advice. Use headers (##), bullet points, and bold text for readability. Write 800-1200 words.",
        },
        {
          role: "user",
          content: `Write a blog post about: "${topic}". Include an engaging introduction, 3-5 main sections with headers, and a conclusion with a call-to-action mentioning RepurposeAI.`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`DeepSeek API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// POST - Auto-generate blog post (called by n8n daily)
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-secret");
  if (secret !== process.env.BLOG_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const topic = body.topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const provider = body.provider || "nvidia";

  let content: string;
  try {
    content =
      provider === "deepseek"
        ? await generateWithDeepSeek(topic)
        : await generateWithNvidia(topic);
  } catch (err) {
    // Fallback to other provider
    try {
      content =
        provider === "deepseek"
          ? await generateWithNvidia(topic)
          : await generateWithDeepSeek(topic);
    } catch {
      return NextResponse.json(
        { error: `Both AI providers failed: ${err}` },
        { status: 500 }
      );
    }
  }

  // Extract title from first line or use topic
  const firstLine = content.split("\n")[0].replace(/^#\s*/, "").trim();
  const title = firstLine || topic;
  const cleanContent = content.replace(/^#\s*.+\n/, "").trim();

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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

  return NextResponse.json(
    { success: true, slug: post.slug, title: post.title },
    { status: 201 }
  );
}
