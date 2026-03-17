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
  imageUrl?: string;
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

export async function getUserPlan(email: string): Promise<{ plan: string; repurpose_count: number; image_count: number }> {
  const rows = await sql`SELECT plan, repurpose_count, COALESCE(image_count, 0) as image_count FROM users WHERE email = ${email}`;
  if (!rows.length) return { plan: "free", repurpose_count: 0, image_count: 0 };
  return rows[0] as { plan: string; repurpose_count: number; image_count: number };
}

export async function getUserProfile(email: string): Promise<{
  id: number; email: string; name: string; image: string; plan: string;
  repurpose_count: number; preferences: Record<string, unknown>;
  stripe_customer_id: string | null; stripe_subscription_id: string | null;
  subscription_status: string; created_at: string; total_repurposes: number;
  image_count: number;
} | null> {
  const rows = await sql`SELECT id, email, name, image, plan, repurpose_count, preferences, stripe_customer_id, stripe_subscription_id, subscription_status, created_at, COALESCE(image_count, 0) as image_count FROM users WHERE email = ${email}`;
  if (!rows.length) return null;
  const u = rows[0] as Record<string, unknown>;
  const totalRepurposes = await sql`SELECT COUNT(*) as total FROM repurposes WHERE user_email = ${email}`;
  return {
    id: u.id as number, email: u.email as string, name: u.name as string, image: u.image as string,
    plan: u.plan as string, repurpose_count: u.repurpose_count as number,
    preferences: typeof u.preferences === "string" ? JSON.parse(u.preferences) : (u.preferences as Record<string, unknown> || {}),
    stripe_customer_id: u.stripe_customer_id as string | null,
    stripe_subscription_id: u.stripe_subscription_id as string | null,
    subscription_status: u.subscription_status as string, created_at: u.created_at as string,
    total_repurposes: Number(totalRepurposes[0].total),
    image_count: u.image_count as number,
  };
}

export async function updateUserProfile(email: string, data: { name?: string; image?: string; preferences?: Record<string, unknown> }) {
  if (data.name !== undefined) await sql`UPDATE users SET name = ${data.name} WHERE email = ${email}`;
  if (data.image !== undefined) await sql`UPDATE users SET image = ${data.image} WHERE email = ${email}`;
  if (data.preferences !== undefined) await sql`UPDATE users SET preferences = ${JSON.stringify(data.preferences)} WHERE email = ${email}`;
}

export async function deleteUserAccount(email: string) {
  await sql`DELETE FROM voice_samples WHERE user_email = ${email}`;
  await sql`DELETE FROM repurposes WHERE user_email = ${email}`;
  await sql`DELETE FROM users WHERE email = ${email}`;
}

export async function updateUserStripe(email: string, data: { stripe_customer_id?: string; stripe_subscription_id?: string; subscription_status?: string; plan?: string }) {
  if (data.stripe_customer_id !== undefined) await sql`UPDATE users SET stripe_customer_id = ${data.stripe_customer_id} WHERE email = ${email}`;
  if (data.stripe_subscription_id !== undefined) await sql`UPDATE users SET stripe_subscription_id = ${data.stripe_subscription_id} WHERE email = ${email}`;
  if (data.subscription_status !== undefined) await sql`UPDATE users SET subscription_status = ${data.subscription_status} WHERE email = ${email}`;
  if (data.plan !== undefined) await sql`UPDATE users SET plan = ${data.plan} WHERE email = ${email}`;
}

export async function getUserByStripeCustomerId(id: string) {
  const rows = await sql`SELECT * FROM users WHERE stripe_customer_id = ${id}`;
  return rows[0] || null;
}

export async function toggleFavorite(id: string, email: string) {
  await sql`UPDATE repurposes SET favorite = NOT favorite WHERE id = ${id} AND user_email = ${email}`;
}

export async function deleteRepurpose(id: string, email: string): Promise<boolean> {
  const rows = await sql`DELETE FROM repurposes WHERE id = ${id} AND user_email = ${email} RETURNING id`;
  return rows.length > 0;
}

export async function regenerateSingleOutput(content: string, platform: string, format: string, tone = "professional", voiceSamples?: string[], priority = false, language = "en"): Promise<string> {
  let voiceInstruction = "";
  if (voiceSamples?.length) {
    voiceInstruction = `\n\nIMPORTANT: Match the writing style of these samples from the user:\n${voiceSamples.map((s, i) => `Sample ${i + 1}: "${s.slice(0, 500)}"`).join("\n")}\n`;
  }

  let languageInstruction = "";
  if (language && language !== "en") {
    const { getLanguageName } = await import("./languages");
    const langName = getLanguageName(language);
    languageInstruction = `\n\nIMPORTANT: Generate ALL content in ${langName}. Every output must be written entirely in ${langName}, not English.\n`;
  }

  const maxSlice = priority ? 5000 : 3000;
  const prompt = `You are a content repurposing expert. Write in a ${tone} tone. Given the following content, generate a single repurposed version for ${platform} (${format}). Return ONLY the repurposed text, no JSON, no code blocks, no markdown wrapping.${voiceInstruction}${languageInstruction}

Original content:
${content.slice(0, maxSlice)}`;

  const aiOpts: AICallOptions = priority ? { maxTokens: 5000, temperature: 0.8 } : {};
  const maxAttempts = priority ? 2 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw = await callNvidia(prompt, aiOpts);
      return raw.trim();
    } catch {
      if (attempt === maxAttempts) {
        const raw = await callDeepSeek(prompt, aiOpts);
        return raw.trim();
      }
    }
  }
  const raw = await callDeepSeek(prompt, aiOpts);
  return raw.trim();
}

export async function updateRepurposeOutput(id: string, email: string, platform: string, newContent: string, imageUrl?: string | null) {
  const item = await getRepurpose(id);
  if (!item || item.user_email !== email) return null;
  const outputs = item.outputs.map((o) => {
    if (o.platform !== platform) return o;
    const updated = { ...o, content: newContent, charCount: newContent.length };
    if (imageUrl !== undefined) {
      if (imageUrl === null) {
        delete updated.imageUrl;
      } else {
        updated.imageUrl = imageUrl;
      }
    }
    return updated;
  });
  await sql`UPDATE repurposes SET outputs = ${JSON.stringify(outputs)} WHERE id = ${id}`;
  return outputs;
}

export const ALL_PLATFORMS = [
  { platform: "Twitter/X", format: "Thread", desc: "A 5-tweet thread with hooks" },
  { platform: "LinkedIn", format: "Post", desc: "Professional LinkedIn post (1500 chars max)" },
  { platform: "Instagram", format: "Caption", desc: "Engaging caption with hashtags and emojis" },
  { platform: "TikTok", format: "Video Script", desc: "60-second video script with hook" },
  { platform: "Email", format: "Newsletter", desc: "Email newsletter snippet" },
  { platform: "YouTube", format: "Short Script", desc: "60-second YouTube Short script" },
  { platform: "Reddit", format: "Post", desc: "Reddit post with engaging title and body, conversational tone" },
  { platform: "Threads", format: "Post", desc: "Short punchy Threads post (500 chars max), casual and shareable" },
  { platform: "Blog Post", format: "Article", desc: "SEO-optimized blog post with H2 headings (800 words)" },
  { platform: "Carousel", format: "Slides", desc: "10-slide carousel with slide titles and short bullet points" },
];

export async function generateOutputs(content: string, contentType: string, tone = "professional", platforms?: string[], voiceSamples?: string[], priority = false, language = "en"): Promise<OutputItem[]> {
  const selectedPlatforms = platforms?.length
    ? ALL_PLATFORMS.filter((p) => platforms.includes(p.platform))
    : ALL_PLATFORMS;

  const platformList = selectedPlatforms
    .map((p, i) => `${i + 1}. platform: "${p.platform}", format: "${p.format}" - ${p.desc}`)
    .join("\n");

  let voiceInstruction = "";
  if (voiceSamples?.length) {
    voiceInstruction = `\n\nIMPORTANT: Match the writing style, vocabulary, and personality of these samples from the user. Adapt the tone to each platform while keeping their unique voice:\n${voiceSamples.map((s, i) => `Sample ${i + 1}: "${s.slice(0, 500)}"`).join("\n")}\n`;
  }

  let languageInstruction = "";
  if (language && language !== "en") {
    const { getLanguageName } = await import("./languages");
    const langName = getLanguageName(language);
    languageInstruction = `\n\nIMPORTANT: Generate ALL content in ${langName}. Every output must be written entirely in ${langName}, not English.\n`;
  }

  const maxSlice = priority ? 5000 : 3000;
  const prompt = `You are a content repurposing expert. Write in a ${tone} tone. Given the following ${contentType} content, generate repurposed versions for different platforms. Return ONLY valid JSON (no markdown, no code blocks) as an array of objects with fields: platform, format, content.${voiceInstruction}${languageInstruction}

Generate these exact ${selectedPlatforms.length} outputs:
${platformList}

Original content:
${content.slice(0, maxSlice)}`;

  const aiOpts: AICallOptions = priority ? { maxTokens: 5000, temperature: 0.8 } : {};
  const maxAttempts = priority ? 2 : 1;
  let raw = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      raw = await callNvidia(prompt, aiOpts);
      break;
    } catch {
      if (attempt === maxAttempts) {
        raw = await callDeepSeek(prompt, aiOpts);
      }
    }
  }
  if (!raw) raw = await callDeepSeek(prompt, aiOpts);

  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array");
    const parsed: OutputItem[] = JSON.parse(match[0]);
    return parsed.map((o) => ({ ...o, charCount: o.content.length }));
  } catch {
    const fallbacks: OutputItem[] = [
      { platform: "Twitter/X", format: "Thread", content: `Thread:\n\n1/ ${content.slice(0, 200)}\n\n2/ Key takeaway...\n\n3/ Like & RT if useful!`, charCount: 0 },
      { platform: "LinkedIn", format: "Post", content: `${content.slice(0, 500)}\n\nWhat do you think?\n\n#ContentMarketing #AI`, charCount: 0 },
      { platform: "Instagram", format: "Caption", content: `${content.slice(0, 300)}...\n\nSave this!\n\n#contentcreator #aitools`, charCount: 0 },
      { platform: "TikTok", format: "Video Script", content: `[HOOK] Stop scrolling.\n\n[BODY] ${content.slice(0, 200)}\n\n[CTA] Follow for more!`, charCount: 0 },
      { platform: "Email", format: "Newsletter", content: `Subject: You need to read this\n\nHey,\n\n${content.slice(0, 400)}\n\nBest,\nRepurposeAI`, charCount: 0 },
      { platform: "YouTube", format: "Short Script", content: `[0-3s] ${content.slice(0, 50)}\n[3-30s] ${content.slice(0, 200)}\n[30-60s] Subscribe!`, charCount: 0 },
      { platform: "Reddit", format: "Post", content: `**${content.slice(0, 80)}**\n\n${content.slice(0, 400)}\n\nWhat do you guys think?`, charCount: 0 },
      { platform: "Threads", format: "Post", content: `${content.slice(0, 400)}\n\nThoughts?`, charCount: 0 },
      { platform: "Blog Post", format: "Article", content: `# ${content.slice(0, 60)}\n\n${content.slice(0, 800)}`, charCount: 0 },
      { platform: "Carousel", format: "Slides", content: `Slide 1: ${content.slice(0, 50)}\nSlide 2: Key insight\nSlide 3: How to apply\nSlide 4: Save this!`, charCount: 0 },
    ];
    return fallbacks
      .filter((f) => selectedPlatforms.some((s) => s.platform === f.platform))
      .map((o) => ({ ...o, charCount: o.content.length }));
  }
}

// --- Voice Sample CRUD ---

export async function getVoiceSamples(email: string) {
  const rows = await sql`SELECT id, content, label, created_at FROM voice_samples WHERE user_email = ${email} ORDER BY created_at DESC`;
  return rows as { id: number; content: string; label: string | null; created_at: string }[];
}

export async function addVoiceSample(email: string, content: string, label?: string): Promise<{ id: number }> {
  // Plan-based voice sample limit
  const { getPlanConfig } = await import("./plans");
  const { plan } = await getUserPlan(email);
  const config = getPlanConfig(plan);
  if (config.voiceSampleLimit === 0) {
    throw new Error("Voice Learning requires a Pro or Business plan.");
  }
  const countRows = await sql`SELECT COUNT(*) as total FROM voice_samples WHERE user_email = ${email}`;
  if (Number(countRows[0].total) >= config.voiceSampleLimit) {
    throw new Error(`Maximum ${config.voiceSampleLimit} voice samples allowed on ${config.name} plan. Delete one to add a new one.`);
  }
  if (content.length > 2000) {
    throw new Error("Voice sample must be 2000 characters or less.");
  }
  const rows = await sql`INSERT INTO voice_samples (user_email, content, label) VALUES (${email}, ${content}, ${label || null}) RETURNING id`;
  return { id: rows[0].id as number };
}

export async function deleteVoiceSample(email: string, id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM voice_samples WHERE id = ${id} AND user_email = ${email} RETURNING id`;
  return rows.length > 0;
}

// --- Image Count ---

export async function incrementImageCount(email: string) {
  await sql`UPDATE users SET image_count = COALESCE(image_count, 0) + 1 WHERE email = ${email}`;
}

// --- AI API Calls ---

interface AICallOptions {
  maxTokens?: number;
  temperature?: number;
}

async function callNvidia(prompt: string, opts?: AICallOptions): Promise<string> {
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.NVIDIA_NIM_API_KEY}` },
    body: JSON.stringify({ model: "moonshotai/kimi-k2-instruct-0905", messages: [{ role: "user", content: prompt }], max_tokens: opts?.maxTokens || 3000, temperature: opts?.temperature || 0.7 }),
  });
  if (!res.ok) throw new Error(`NVIDIA ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callDeepSeek(prompt: string, opts?: AICallOptions): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], max_tokens: opts?.maxTokens || 3000, temperature: opts?.temperature || 0.7 }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

// --- Webhook ---

export async function getUserWebhook(email: string): Promise<string | null> {
  const rows = await sql`SELECT webhook_url FROM users WHERE email = ${email}`;
  return (rows[0]?.webhook_url as string) || null;
}

export async function updateUserWebhook(email: string, webhookUrl: string | null) {
  await sql`UPDATE users SET webhook_url = ${webhookUrl} WHERE email = ${email}`;
}

export async function fireWebhook(email: string, event: string, data: Record<string, unknown>) {
  const url = await getUserWebhook(email);
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    // Fire-and-forget: silently ignore errors
  }
}
