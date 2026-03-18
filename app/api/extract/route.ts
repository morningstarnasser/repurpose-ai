import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 60;

// YouTube URL patterns
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
];

function extractYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const type = formData.get("type") as string;

  try {
    if (type === "url") {
      const url = formData.get("url") as string;
      if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

      // Check if it's a YouTube URL
      const youtubeId = extractYouTubeId(url);
      if (youtubeId) {
        const result = await extractFromYouTube(youtubeId);
        return NextResponse.json({
          content: result.content,
          source: "youtube",
          wordCount: result.content.split(/\s+/).length,
          youtube: { id: youtubeId, title: result.title, thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` },
        });
      }

      const content = await extractFromUrl(url);
      if (!content || content.length < 20) {
        return NextResponse.json({ error: "Could not extract meaningful content from this URL" }, { status: 400 });
      }
      return NextResponse.json({ content, source: "url", wordCount: content.split(/\s+/).length });
    }

    if (type === "audio" || type === "video") {
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 });
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 4MB for audio/video." }, { status: 400 });
      }
      const content = await transcribeAudio(file);
      if (!content || content.length < 10) {
        return NextResponse.json({ error: "Could not transcribe audio. Please paste the transcript manually." }, { status: 400 });
      }
      return NextResponse.json({ content, source: "transcription", wordCount: content.split(/\s+/).length });
    }

    if (type === "pdf") {
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 });
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 4MB for PDF." }, { status: 400 });
      }
      const content = await extractFromPdf(file);
      if (!content || content.length < 20) {
        return NextResponse.json({ error: "Could not extract text from this PDF" }, { status: 400 });
      }
      return NextResponse.json({ content, source: "pdf", wordCount: content.split(/\s+/).length });
    }

    return NextResponse.json({ error: "Invalid type. Use: url, audio, video, pdf" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function extractJsonObject(html: string, startIdx: number): string | null {
  const jsonStart = html.indexOf("{", startIdx);
  if (jsonStart === -1) return null;
  let depth = 0;
  for (let i = jsonStart; i < Math.min(html.length, jsonStart + 500000); i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") depth--;
    if (depth === 0) return html.slice(jsonStart, i + 1);
  }
  return null;
}

function parseCaptionXml(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractFromYouTube(videoId: string): Promise<{ content: string; title: string }> {
  let transcript = "";
  let title = "";
  let description = "";

  // Step 1: YouTube Data API (most reliable from serverless environments)
  if (process.env.GOOGLE_API_KEY) {
    try {
      const apiRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.GOOGLE_API_KEY}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        const snippet = apiData.items?.[0]?.snippet;
        if (snippet) {
          title = snippet.title || "";
          description = snippet.description || "";
        }
      }
    } catch {
      // API call failed
    }
  }

  // Step 2: Try YouTube timedtext API directly for captions
  if (!transcript) {
    for (const lang of ["en", "de", "fr", "es"]) {
      try {
        const ttRes = await fetch(
          `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv3`,
          {
            headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (ttRes.ok) {
          const ttXml = await ttRes.text();
          if (ttXml.includes("<text")) {
            transcript = parseCaptionXml(ttXml);
            if (transcript.length > 50) break;
          }
        }
      } catch {
        continue;
      }
    }
  }

  // Step 3: Fetch YouTube page and extract captions from player response
  if (!transcript) {
    try {
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Cookie: "CONSENT=PENDING+999; SOCS=CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjMwODI5LjA3X3AxGgJlbiADGgYIgOy8mgY",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (pageRes.ok) {
        const html = await pageRes.text();

        // Extract title if not yet found
        if (!title) {
          const titleMatch = html.match(/<meta\s+name="title"\s+content="([^"]+)"/i)
            || html.match(/<title>([^<]*)<\/title>/);
          if (titleMatch) {
            title = titleMatch[1].replace(" - YouTube", "").trim();
          }
        }

        // Try to extract captions using balanced brace matching
        const markers = ["ytInitialPlayerResponse", "var ytInitialPlayerResponse"];
        for (const marker of markers) {
          const idx = html.indexOf(marker);
          if (idx === -1) continue;
          const jsonStr = extractJsonObject(html, idx);
          if (!jsonStr) continue;
          try {
            const playerData = JSON.parse(jsonStr);
            const captions = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (captions?.length) {
              const track = captions.find((c: { languageCode: string }) => c.languageCode === "en") || captions[0];
              if (track?.baseUrl) {
                const captionRes = await fetch(track.baseUrl, { signal: AbortSignal.timeout(10000) });
                if (captionRes.ok) {
                  transcript = parseCaptionXml(await captionRes.text());
                }
              }
            }
            break;
          } catch {
            continue;
          }
        }

        // Fallback: search for captions URL directly in HTML
        if (!transcript) {
          const captionUrlMatch = html.match(/"captionTracks":\[.*?"baseUrl":"(https?:[^"]+)"/);
          if (captionUrlMatch) {
            try {
              const captionUrl = captionUrlMatch[1].replace(/\\u0026/g, "&");
              const captionRes = await fetch(captionUrl, { signal: AbortSignal.timeout(10000) });
              if (captionRes.ok) {
                transcript = parseCaptionXml(await captionRes.text());
              }
            } catch {
              // Caption URL fetch failed
            }
          }
        }
      }
    } catch {
      // Page fetch failed (common on serverless — YouTube blocks datacenter IPs)
    }
  }

  // Build the best content we have
  if (!transcript && !title && !description) {
    throw new Error("Could not extract content from this YouTube video. The video may not have captions available.");
  }

  let content = "";
  if (transcript) {
    content = transcript;
  } else if (description && description.length > 50) {
    content = `Video Title: ${title}\n\n${description}\n\nNote: No transcript available. Using video description as source content.`;
  } else {
    content = `Video Title: ${title}\n\n${description || ""}\n\nNote: No transcript or detailed description available for this video. Please paste the content manually for best results.`;
  }

  return { content: content.slice(0, 8000), title: title || "YouTube Video" };
}

async function extractFromUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RepurposeAI/1.0)",
      Accept: "text/html,application/xhtml+xml,text/plain",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Failed to fetch URL (${res.status})`);

  const contentType = res.headers.get("content-type") || "";
  const body = await res.text();

  // If plain text, return directly
  if (contentType.includes("text/plain")) {
    return body.slice(0, 8000).trim();
  }

  // Extract text from HTML
  let text = body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "");

  // Try to extract article or main content
  const articleMatch = text.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  const mainMatch = text.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i);
  const contentArea = articleMatch?.[1] || mainMatch?.[1] || text;

  // Strip remaining HTML tags and clean up
  const cleaned = contentArea
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.slice(0, 8000);
}

async function transcribeAudio(file: File): Promise<string> {
  // Try NVIDIA NIM ASR models
  const models = ["nvidia/parakeet-ctc-1.1b-asr", "openai/whisper-large-v3"];

  for (const model of models) {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("model", model);
      form.append("response_format", "json");

      const res = await fetch("https://integrate.api.nvidia.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.NVIDIA_NIM_API_KEY}` },
        body: form,
        signal: AbortSignal.timeout(30000),
      });

      if (res.ok) {
        const data = await res.json();
        return data.text || "";
      }

      const errBody = await res.text().catch(() => "");
      console.error(`[transcribe] ${model} failed: ${res.status} ${errBody.slice(0, 200)}`);
    } catch (err) {
      console.error(`[transcribe] ${model} error:`, err instanceof Error ? err.message : err);
      continue;
    }
  }

  // Fallback: Gemini multimodal audio transcription
  if (process.env.GEMINI_API_KEY) {
    try {
      const audioBytes = Buffer.from(await file.arrayBuffer());
      const base64Audio = audioBytes.toString("base64");
      const mimeType = file.type || "audio/mpeg";

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType, data: base64Audio } },
                { text: "Transcribe this audio exactly as spoken. Return only the transcript text, nothing else." },
              ],
            }],
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text && text.length > 10) return text;
      } else {
        const errBody = await res.text().catch(() => "");
        console.error(`[transcribe] Gemini fallback failed: ${res.status} ${errBody.slice(0, 200)}`);
      }
    } catch (err) {
      console.error(`[transcribe] Gemini error:`, err instanceof Error ? err.message : err);
    }
  }

  throw new Error("Audio transcription is temporarily unavailable. Please paste your transcript manually in the text field.");
}

async function extractFromPdf(file: File): Promise<string> {
  const { extractText } = await import("unpdf");
  const buffer = new Uint8Array(await file.arrayBuffer());
  const { text } = await extractText(buffer);
  const joined = Array.isArray(text) ? text.join("\n") : String(text);
  return joined.slice(0, 8000).trim();
}
