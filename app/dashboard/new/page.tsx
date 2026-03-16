"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SubNav from "@/components/SubNav";

type InputMethod = "text" | "url" | "upload";

const inputMethods = [
  { value: "text" as const, label: "Paste Text", icon: "📝", desc: "Blog, transcript, any text" },
  { value: "url" as const, label: "Import URL", icon: "🔗", desc: "Blog post, article, webpage" },
  { value: "upload" as const, label: "Upload File", icon: "📁", desc: "Audio, video, or PDF" },
];

const acceptedFiles: Record<string, string> = {
  "audio/*": "Audio (.mp3, .wav, .m4a, .ogg)",
  "video/*": "Video (.mp4, .mov, .webm)",
  "application/pdf": "PDF (.pdf)",
};

const TONES = ["Professional", "Casual", "Funny", "Inspirational", "Technical"];

const ALL_PLATFORMS = [
  { platform: "Twitter/X", icon: "🐦" },
  { platform: "LinkedIn", icon: "💼" },
  { platform: "Instagram", icon: "📸" },
  { platform: "TikTok", icon: "🎵" },
  { platform: "Email", icon: "📧" },
  { platform: "YouTube", icon: "🎬" },
  { platform: "Reddit", icon: "🤖" },
  { platform: "Threads", icon: "🧵" },
  { platform: "Blog Post", icon: "📝" },
  { platform: "Carousel", icon: "🎠" },
];

export default function NewRepurposePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<InputMethod>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState(false);
  const [tone, setTone] = useState("Professional");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(ALL_PLATFORMS.map((p) => p.platform));

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length <= 1) return prev; // min 1
        return prev.filter((p) => p !== platform);
      }
      return [...prev, platform];
    });
  }

  async function handleExtract() {
    setError("");
    setExtracting(true);
    try {
      const formData = new FormData();

      if (method === "url") {
        if (!url.trim()) throw new Error("Please enter a URL");
        formData.append("type", "url");
        formData.append("url", url.trim());
      } else if (method === "upload" && file) {
        if (file.size > 4 * 1024 * 1024) throw new Error("File too large. Maximum 4MB.");
        const isAudio = file.type.startsWith("audio/");
        const isVideo = file.type.startsWith("video/");
        const isPdf = file.type === "application/pdf";
        if (!isAudio && !isVideo && !isPdf) throw new Error("Unsupported file type. Use audio, video, or PDF.");
        formData.append("type", isPdf ? "pdf" : isAudio ? "audio" : "video");
        formData.append("file", file);
      } else {
        throw new Error("Please select a file");
      }

      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");

      setContent(data.content);
      setExtracted(true);
      if (!title && method === "url") {
        setTitle(url.replace(/^https?:\/\//, "").split("/").slice(0, 2).join("/"));
      }
      if (!title && method === "upload" && file) {
        setTitle(file.name.replace(/\.[^.]+$/, ""));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 20) {
      setError("Content must be at least 20 characters.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const contentType = method === "url" ? "blog" : method === "upload" && file?.type.startsWith("audio/") ? "podcast" : method === "upload" && file?.type.startsWith("video/") ? "video" : "text";
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || undefined, content, contentType, tone: tone.toLowerCase(), platforms: selectedPlatforms }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to repurpose");
      }
      const data = await res.json();
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  const canExtract = (method === "url" && url.trim().length > 5) || (method === "upload" && file);
  const canGenerate = content.trim().length >= 20;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SubNav />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold uppercase mb-8">
          New <span className="text-secondary">Repurpose</span>
        </h1>

        {/* Step 1: Input Method */}
        <div className="mb-8">
          <label className="block text-sm font-bold uppercase tracking-wider mb-3">How do you want to add content?</label>
          <div className="grid grid-cols-3 gap-3">
            {inputMethods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => { setMethod(m.value); setExtracted(false); setContent(""); setError(""); }}
                className={`brutal-card p-4 text-center text-sm font-bold transition-colors ${
                  method === m.value ? "bg-primary" : "bg-white"
                }`}
              >
                <div className="text-2xl mb-1">{m.icon}</div>
                <div>{m.label}</div>
                <div className="text-[10px] font-medium text-dark/40 mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate}>
          {/* URL Input */}
          {method === "url" && !extracted && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Paste URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/blog-post"
                  className="flex-1 brutal-border px-4 py-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={!canExtract || extracting}
                  className={`brutal-btn px-6 py-3 shrink-0 ${extracting ? "bg-dark/50 text-white" : "bg-accent"}`}
                >
                  {extracting ? "Extracting..." : "Extract"}
                </button>
              </div>
            </div>
          )}

          {/* File Upload */}
          {method === "upload" && !extracted && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Upload File</label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className={`brutal-card p-8 text-center cursor-pointer transition-colors ${file ? "bg-lime/20" : "bg-white hover:bg-primary/10"}`}
              >
                <input ref={fileRef} type="file" accept="audio/*,video/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <>
                    <div className="text-3xl mb-2">{file.type.startsWith("audio/") ? "🎙️" : file.type.startsWith("video/") ? "🎬" : "📄"}</div>
                    <p className="font-bold text-sm">{file.name}</p>
                    <p className="text-xs text-dark/40 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-2">📁</div>
                    <p className="font-bold text-sm mb-1">Drop file here or click to browse</p>
                    <p className="text-xs text-dark/40">{Object.values(acceptedFiles).join(" · ")}</p>
                    <p className="text-xs text-dark/30 mt-1">Max 4MB</p>
                  </>
                )}
              </div>
              {file && (
                <div className="flex gap-3 mt-3">
                  <button type="button" onClick={handleExtract} disabled={extracting} className={`brutal-btn flex-1 py-3 ${extracting ? "bg-dark/50 text-white" : "bg-accent"}`}>
                    {extracting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">&#9889;</span>
                        {file.type === "application/pdf" ? "Extracting text..." : "Transcribing..."}
                      </span>
                    ) : (
                      file.type === "application/pdf" ? "Extract Text" : "Transcribe"
                    )}
                  </button>
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="brutal-btn px-4 py-3 bg-secondary/20 text-secondary">
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Extracted source badge */}
          {extracted && method !== "text" && (
            <div className="flex items-center gap-2 mb-3">
              <span className="brutal-border px-3 py-1 text-xs font-bold uppercase bg-lime/30">
                Content extracted from {method === "url" ? "URL" : file?.type.startsWith("audio/") ? "Audio" : file?.type.startsWith("video/") ? "Video" : "PDF"}
              </span>
              <button type="button" onClick={() => { setExtracted(false); setContent(""); }} className="text-xs font-bold text-dark/40 hover:text-secondary">
                Change source
              </button>
            </div>
          )}

          {/* Title */}
          {(method === "text" || extracted) && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                Title <span className="text-dark/40">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your content a name..."
                className="w-full brutal-border px-4 py-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}

          {/* Content Textarea */}
          {(method === "text" || extracted) && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                {extracted ? (
                  <>Extracted Content <span className="text-dark/40">(you can edit before repurposing)</span></>
                ) : (
                  <>Your Content <span className="text-secondary">*</span></>
                )}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your blog post, podcast transcript, video script, or any text here..."
                rows={12}
                className="w-full brutal-border px-4 py-3 font-medium bg-white resize-y focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <div className="text-xs font-medium text-dark/40 mt-1">
                {content.length} characters · {content.split(/\s+/).filter(Boolean).length} words · Min 20 characters
              </div>
            </div>
          )}

          {/* Tone Selector */}
          {(method === "text" || extracted) && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wider mb-3">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`brutal-btn px-4 py-2 text-xs ${tone === t ? "bg-primary" : "bg-white"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Platform Selector */}
          {(method === "text" || extracted) && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wider mb-3">
                Platforms <span className="text-dark/40">({selectedPlatforms.length} selected)</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ALL_PLATFORMS.map((p) => (
                  <button
                    key={p.platform}
                    type="button"
                    onClick={() => togglePlatform(p.platform)}
                    className={`brutal-card p-2 text-center text-[11px] font-bold transition-colors ${
                      selectedPlatforms.includes(p.platform) ? "bg-primary" : "bg-white opacity-50"
                    }`}
                  >
                    <div className="text-lg">{p.icon}</div>
                    <div className="truncate">{p.platform}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="brutal-border bg-secondary/20 text-secondary px-4 py-3 font-bold text-sm mb-6">
              {error}
            </div>
          )}

          {/* Submit */}
          {(method === "text" || extracted) && (
            <button
              type="submit"
              disabled={generating || !canGenerate}
              className={`brutal-btn w-full py-4 text-lg ${
                generating ? "bg-dark/50 text-white" : !canGenerate ? "bg-dark/20 text-dark/40" : "bg-primary"
              }`}
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">&#9889;</span>
                  AI is transforming your content...
                </span>
              ) : (
                `Repurpose with AI (${selectedPlatforms.length} platforms) →`
              )}
            </button>
          )}
        </form>
      </main>
    </div>
  );
}
