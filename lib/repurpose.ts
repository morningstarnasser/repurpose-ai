import fs from "fs/promises";
import path from "path";

export interface RepurposeResult {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  originalContent: string;
  contentType: "blog" | "podcast" | "video" | "text";
  outputs: OutputItem[];
  createdAt: string;
}

export interface OutputItem {
  platform: string;
  format: string;
  content: string;
  charCount: number;
}

const DIR = path.join(process.cwd(), "content/repurposes");

export async function saveRepurpose(data: RepurposeResult) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, `${data.id}.json`), JSON.stringify(data, null, 2));
}

export async function getRepurpose(id: string): Promise<RepurposeResult | null> {
  try {
    const raw = await fs.readFile(path.join(DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw);
  } catch { return null; }
}

export async function getUserRepurposes(email: string): Promise<RepurposeResult[]> {
  try {
    await fs.mkdir(DIR, { recursive: true });
    const files = await fs.readdir(DIR);
    const results: RepurposeResult[] = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const raw = await fs.readFile(path.join(DIR, f), "utf-8");
      const data = JSON.parse(raw);
      if (data.userEmail === email) results.push(data);
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch { return []; }
}

export async function generateOutputs(content: string, contentType: string): Promise<OutputItem[]> {
  const prompt = `You are a content repurposing expert. Given the following ${contentType} content, generate repurposed versions for different platforms. Return ONLY valid JSON (no markdown, no code blocks) as an array of objects with fields: platform, format, content.

Generate these exact 6 outputs:
1. platform: "Twitter/X", format: "Thread" - A 5-tweet thread with hooks
2. platform: "LinkedIn", format: "Post" - Professional LinkedIn post (1500 chars max)
3. platform: "Instagram", format: "Caption" - Engaging caption with hashtags and emojis
4. platform: "TikTok", format: "Video Script" - 60-second video script with hook
5. platform: "Email", format: "Newsletter" - Email newsletter snippet
6. platform: "YouTube", format: "Short Script" - 60-second YouTube Short script

Original content:
${content.slice(0, 3000)}`;

  let raw: string;
  try {
    raw = await callNvidia(prompt);
  } catch {
    raw = await callDeepSeek(prompt);
  }

  try {
    // Extract JSON array from response
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found");
    const parsed: OutputItem[] = JSON.parse(match[0]);
    return parsed.map(o => ({ ...o, charCount: o.content.length }));
  } catch {
    // Fallback: generate simple outputs
    return [
      { platform: "Twitter/X", format: "Thread", content: `🧵 Thread: ${content.slice(0, 250)}...\n\n1/ ${content.slice(0, 200)}\n\n2/ Key takeaway from this content...\n\n3/ Like & RT if you found this useful!`, charCount: 0 },
      { platform: "LinkedIn", format: "Post", content: `${content.slice(0, 500)}\n\n💡 What do you think? Share your thoughts below.\n\n#ContentMarketing #AI #Repurpose`, charCount: 0 },
      { platform: "Instagram", format: "Caption", content: `✨ ${content.slice(0, 300)}...\n\n🔥 Save this for later!\n\n#contentcreator #aitools #repurpose #marketing`, charCount: 0 },
      { platform: "TikTok", format: "Video Script", content: `[HOOK] Stop scrolling - this will change how you create content.\n\n[BODY] ${content.slice(0, 200)}\n\n[CTA] Follow for more content tips!`, charCount: 0 },
      { platform: "Email", format: "Newsletter", content: `Subject: You need to read this\n\nHey there,\n\n${content.slice(0, 400)}\n\nBest,\nRepurposeAI`, charCount: 0 },
      { platform: "YouTube", format: "Short Script", content: `[0-3s] ${content.slice(0, 50)}\n[3-30s] ${content.slice(0, 200)}\n[30-60s] If you found this helpful, subscribe!`, charCount: 0 },
    ].map(o => ({ ...o, charCount: o.content.length }));
  }
}

async function callNvidia(prompt: string): Promise<string> {
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.NVIDIA_NIM_API_KEY}` },
    body: JSON.stringify({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000, temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`NVIDIA ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callDeepSeek(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000, temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}
