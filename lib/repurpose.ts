import { sql } from "./db";

export interface RepurposeResult {
  id: string;
  user_email: string;
  title: string;
  original_content: string;
  content_type: string;
  outputs: OutputItem[];
  created_at: string;
}

export interface OutputItem {
  platform: string;
  format: string;
  content: string;
  charCount: number;
}

export async function saveRepurpose(data: RepurposeResult) {
  await sql`INSERT INTO repurposes (id, user_email, title, original_content, content_type, outputs)
    VALUES (${data.id}, ${data.user_email}, ${data.title}, ${data.original_content}, ${data.content_type}, ${JSON.stringify(data.outputs)})`;
  await sql`UPDATE users SET repurpose_count = repurpose_count + 1 WHERE email = ${data.user_email}`;
}

export async function getRepurpose(id: string): Promise<RepurposeResult | null> {
  const rows = await sql`SELECT * FROM repurposes WHERE id = ${id}`;
  if (!rows.length) return null;
  const r = rows[0];
  return { ...r, outputs: typeof r.outputs === "string" ? JSON.parse(r.outputs) : r.outputs } as RepurposeResult;
}

export async function getUserRepurposes(email: string): Promise<RepurposeResult[]> {
  const rows = await sql`SELECT * FROM repurposes WHERE user_email = ${email} ORDER BY created_at DESC`;
  return rows.map((r) => ({
    ...r,
    outputs: typeof r.outputs === "string" ? JSON.parse(r.outputs) : r.outputs,
  })) as RepurposeResult[];
}

export async function upsertUser(email: string, name: string, image: string) {
  await sql`INSERT INTO users (email, name, image) VALUES (${email}, ${name}, ${image})
    ON CONFLICT (email) DO UPDATE SET name = ${name}, image = ${image}`;
}

export async function getUserPlan(email: string): Promise<{ plan: string; repurpose_count: number }> {
  const rows = await sql`SELECT plan, repurpose_count FROM users WHERE email = ${email}`;
  return rows[0] as { plan: string; repurpose_count: number } || { plan: "free", repurpose_count: 0 };
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
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array");
    const parsed: OutputItem[] = JSON.parse(match[0]);
    return parsed.map((o) => ({ ...o, charCount: o.content.length }));
  } catch {
    return [
      { platform: "Twitter/X", format: "Thread", content: `🧵 Thread:\n\n1/ ${content.slice(0, 200)}\n\n2/ Key takeaway...\n\n3/ Like & RT if useful!`, charCount: 0 },
      { platform: "LinkedIn", format: "Post", content: `${content.slice(0, 500)}\n\n💡 What do you think?\n\n#ContentMarketing #AI`, charCount: 0 },
      { platform: "Instagram", format: "Caption", content: `✨ ${content.slice(0, 300)}...\n\n🔥 Save this!\n\n#contentcreator #aitools`, charCount: 0 },
      { platform: "TikTok", format: "Video Script", content: `[HOOK] Stop scrolling.\n\n[BODY] ${content.slice(0, 200)}\n\n[CTA] Follow for more!`, charCount: 0 },
      { platform: "Email", format: "Newsletter", content: `Subject: You need to read this\n\nHey,\n\n${content.slice(0, 400)}\n\nBest,\nRepurposeAI`, charCount: 0 },
      { platform: "YouTube", format: "Short Script", content: `[0-3s] ${content.slice(0, 50)}\n[3-30s] ${content.slice(0, 200)}\n[30-60s] Subscribe!`, charCount: 0 },
    ].map((o) => ({ ...o, charCount: o.content.length }));
  }
}

async function callNvidia(prompt: string): Promise<string> {
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.NVIDIA_NIM_API_KEY}` },
    body: JSON.stringify({ model: "moonshotai/kimi-k2-instruct-0905", messages: [{ role: "user", content: prompt }], max_tokens: 3000, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`NVIDIA ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callDeepSeek(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], max_tokens: 3000, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}
