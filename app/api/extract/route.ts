import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const type = formData.get("type") as string;

  try {
    if (type === "url") {
      const url = formData.get("url") as string;
      if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });
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
