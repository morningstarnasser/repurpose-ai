import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserPlan, incrementImageCount } from "@/lib/repurpose";
import { getPlanConfig } from "@/lib/plans";

const PLATFORM_SIZES: Record<string, { width: number; height: number }> = {
  Instagram: { width: 1024, height: 1024 },
  "Twitter/X": { width: 1024, height: 576 },
  LinkedIn: { width: 1024, height: 576 },
  YouTube: { width: 1024, height: 576 },
  TikTok: { width: 576, height: 1024 },
  Reddit: { width: 1024, height: 576 },
  Threads: { width: 1024, height: 1024 },
  Email: { width: 1024, height: 576 },
  "Blog Post": { width: 1024, height: 576 },
  Carousel: { width: 1024, height: 1024 },
};

const PLATFORM_STYLES: Record<string, string> = {
  Instagram: "vibrant, eye-catching, modern social media aesthetic, bold colors",
  "Twitter/X": "clean, professional, engaging banner style, bold typography",
  LinkedIn: "corporate, professional, clean, business-oriented, subtle elegance",
  YouTube: "cinematic, bold thumbnail style, high contrast, attention-grabbing",
  TikTok: "trendy, Gen-Z aesthetic, bold neon colors, dynamic energy, vertical",
  Reddit: "informative, meme-friendly, internet culture, straightforward",
  Threads: "minimal, modern, clean aesthetic, Instagram-adjacent style",
  Email: "professional header image, clean, branded feel",
  "Blog Post": "editorial, high-quality stock photo style, clean composition",
  Carousel: "clean infographic style, modern design, bold sections",
};

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check image limit based on plan
  const { plan, image_count } = await getUserPlan(session.user.email);
  const config = getPlanConfig(plan);
  if (config.imageLimit !== Infinity && image_count >= config.imageLimit) {
    return NextResponse.json(
      { error: `${config.name} plan image limit reached (${image_count}/${config.imageLimit}/month). Upgrade for more AI images.` },
      { status: 403 }
    );
  }

  const { content, platform } = await req.json();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const size = PLATFORM_SIZES[platform] || { width: 1024, height: 1024 };
  const style = PLATFORM_STYLES[platform] || "professional, modern, clean";

  // Build prompt from content
  const promptText = `Create a visually striking image for a ${platform} post. Style: ${style}. Content theme: ${content.slice(0, 200)}. No text or words in the image.`;

  try {
    // Try NVIDIA NIM Stable Diffusion XL first
    const imageUrl = await generateWithNvidia(promptText, size);
    await incrementImageCount(session.user.email);
    return NextResponse.json({ imageUrl });
  } catch {
    try {
      // Fallback: Gemini Imagen
      const imageUrl = await generateWithGemini(promptText, size);
      await incrementImageCount(session.user.email);
      return NextResponse.json({ imageUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image generation failed";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }
}

async function generateWithNvidia(prompt: string, size: { width: number; height: number }): Promise<string> {
  const res = await fetch("https://integrate.api.nvidia.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
    },
    body: JSON.stringify({
      model: "stabilityai/stable-diffusion-xl",
      prompt,
      width: size.width,
      height: size.height,
      steps: 25,
      cfg_scale: 7,
      n: 1,
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) throw new Error(`NVIDIA Image API ${res.status}`);

  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data from NVIDIA");

  return `data:image/png;base64,${b64}`;
}

async function generateWithGemini(prompt: string, size: { width: number; height: number }): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an image: ${prompt}. Target dimensions: ${size.width}x${size.height}px.` }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
      signal: AbortSignal.timeout(45000),
    }
  );

  if (!res.ok) throw new Error(`Gemini API ${res.status}`);

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No content from Gemini");

  const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith("image/"));
  if (!imagePart?.inlineData) throw new Error("No image from Gemini");

  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}
