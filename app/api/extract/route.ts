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

async function extractFromYouTube(videoId: string): Promise<{ content: string; title: string }> {
  // Step 1: Try to get transcript by scraping the YouTube page
  let transcript = "";
  let title = "";

  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (pageRes.ok) {
      const html = await pageRes.text();

      // Extract title
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      if (titleMatch) {
        title = titleMatch[1].replace(" - YouTube", "").trim();
      }

      // Try to extract captions from ytInitialPlayerResponse
      const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/);
      if (playerMatch) {
        try {
          const playerData = JSON.parse(playerMatch[1]);
          const captions = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          if (captions?.length) {
            // Prefer English captions
            const track = captions.find((c: { languageCode: string }) => c.languageCode === "en") || captions[0];
            if (track?.baseUrl) {
              const captionRes = await fetch(track.baseUrl, { signal: AbortSignal.timeout(10000) });
              if (captionRes.ok) {
                const captionXml = await captionRes.text();
                // Parse XML captions - extract text content
                transcript = captionXml
                  .replace(/<[^>]+>/g, " ")
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")
                  .replace(/\s+/g, " ")
                  .trim();
              }
            }
          }
        } catch {
          // JSON parse failed, continue to fallback
        }
      }
    }
  } catch {
    // Page fetch failed
  }

  // Step 2: Fallback - get video info from YouTube Data API
  if (!title && process.env.GOOGLE_API_KEY) {
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
          if (!transcript) {
            // Use description as content if no transcript available
            transcript = snippet.description || "";
          }
        }
      }
    } catch {
      // API call failed
    }
  }

  if (!transcript && !title) {
    throw new Error("Could not extract content from this YouTube video. The video may not have captions available.");
  }

  const content = transcript || `Video Title: ${title}\n\nNote: No transcript available for this video. The video description and title have been used as source content.`;

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
  // Try NVIDIA NIM Parakeet ASR
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
      });

      if (res.ok) {
        const data = await res.json();
        return data.text || "";
      }
    } catch {
      continue;
    }
  }

  // Fallback: Use AI to describe that we need a transcript
  throw new Error("Audio transcription is temporarily unavailable. Please paste your transcript manually in the text field.");
}

async function extractFromPdf(file: File): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await pdfParse(buffer);
  return data.text.slice(0, 8000).trim();
}
