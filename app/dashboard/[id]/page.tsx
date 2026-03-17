"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import SubNav from "@/components/SubNav";
import { ToastProvider, useToast } from "@/components/Toast";

interface OutputItem {
  platform: string;
  format: string;
  content: string;
  charCount: number;
  imageUrl?: string;
}

interface RepurposeData {
  id: string;
  title: string;
  original_content: string;
  content_type: string;
  outputs: OutputItem[];
  created_at: string;
  favorite?: boolean;
  tone?: string;
}

const platformColors: Record<string, string> = {
  "Twitter/X": "bg-primary",
  LinkedIn: "bg-accent",
  Instagram: "bg-secondary",
  TikTok: "bg-lavender",
  Email: "bg-lime",
  YouTube: "bg-primary",
  Reddit: "bg-[#FF5722]",
  Threads: "bg-dark text-white",
  "Blog Post": "bg-lavender",
  Carousel: "bg-accent",
};

const TONES = ["professional", "casual", "funny", "inspirational", "technical"];

type ShareAction = { type: "link"; url: string; label: string } | { type: "copy-open"; url: string; label: string } | { type: "copy-only"; label: string } | { type: "email"; url: string; label: string };

function getShareAction(platform: string, content: string): ShareAction {
  const text = encodeURIComponent(content.slice(0, 280));
  const fullText = encodeURIComponent(content.slice(0, 2000));

  switch (platform) {
    case "Twitter/X":
      return { type: "link", url: `https://twitter.com/intent/tweet?text=${text}`, label: "Share" };
    case "LinkedIn":
      return { type: "link", url: `https://www.linkedin.com/sharing/share-offsite/?url=&summary=${text}`, label: "Share" };
    case "Reddit":
      return { type: "link", url: `https://www.reddit.com/submit?selftext=true&text=${fullText}`, label: "Share" };
    case "Threads":
      return { type: "link", url: `https://www.threads.net/intent/post?text=${text}`, label: "Share" };
    case "Email":
      return { type: "email", url: `mailto:?subject=${encodeURIComponent("Check this out")}&body=${fullText}`, label: "Send Email" };
    case "Instagram":
      return { type: "copy-open", url: "https://www.instagram.com/", label: "Copy & Open" };
    case "TikTok":
      return { type: "copy-open", url: "https://www.tiktok.com/upload", label: "Copy & Open" };
    case "YouTube":
      return { type: "copy-open", url: "https://studio.youtube.com/", label: "Copy & Open" };
    case "Blog Post":
    case "Carousel":
      return { type: "copy-only", label: "Copy" };
    default:
      return { type: "copy-only", label: "Copy" };
  }
}

function DetailContent() {
  const { id } = useParams();
  const { toast } = useToast();
  const [data, setData] = useState<RepurposeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [savingVoice, setSavingVoice] = useState(false);

  useEffect(() => {
    fetch(`/api/repurpose/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  function copyToClipboard(text: string, platform: string) {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    toast("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadAll() {
    if (!data) return;
    const text = data.outputs
      .map((o) => `=== ${o.platform} (${o.format}) ===\n\n${o.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repurpose-${data.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleRegenerate(platform: string, tone?: string) {
    setRegenerating(platform);
    try {
      const res = await fetch(`/api/repurpose/${id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, tone: tone || "professional" }),
      });
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      setData((prev) => (prev ? { ...prev, outputs: result.outputs } : prev));
      toast(`${platform} regenerated!`);
    } catch {
      toast("Failed to regenerate", "error");
    } finally {
      setRegenerating(null);
    }
  }

  async function handleSaveEdit(platform: string) {
    try {
      const res = await fetch(`/api/repurpose/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, content: editContent }),
      });
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      setData((prev) => (prev ? { ...prev, outputs: result.outputs } : prev));
      setEditing(null);
      toast("Saved!");
    } catch {
      toast("Failed to save", "error");
    }
  }

  function handleShare(action: ShareAction, content: string, platform: string) {
    if (action.type === "link" || action.type === "email") {
      window.open(action.url, "_blank", "noopener,noreferrer");
    } else if (action.type === "copy-open") {
      navigator.clipboard.writeText(content);
      toast(`Content copied! Opening ${platform}...`);
      setTimeout(() => window.open(action.url, "_blank", "noopener,noreferrer"), 500);
    } else {
      copyToClipboard(content, platform);
    }
  }

  async function handleWebShare(content: string, platform: string) {
    if (!navigator.share) return false;
    try {
      await navigator.share({ title: `${platform} Content`, text: content });
      return true;
    } catch {
      return false;
    }
  }

  async function handleGenerateImage(platform: string) {
    setGeneratingImage(platform);
    try {
      const output = data?.outputs.find((o) => o.platform === platform);
      if (!output) throw new Error("Output not found");
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: output.content, platform }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Image generation failed");
      }
      const result = await res.json();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          outputs: prev.outputs.map((o) =>
            o.platform === platform ? { ...o, imageUrl: result.imageUrl } : o
          ),
        };
      });
      // Save imageUrl to DB
      await fetch(`/api/repurpose/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, content: data?.outputs.find((o) => o.platform === platform)?.content, imageUrl: result.imageUrl }),
      });
      toast("Image generated!");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Image generation failed", "error");
    } finally {
      setGeneratingImage(null);
    }
  }

  function downloadImage(imageUrl: string, platform: string) {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `repurpose-${platform.toLowerCase().replace(/\//g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const handleRemoveImage = useCallback(async (platform: string) => {
    if (!data) return;
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        outputs: prev.outputs.map((o) =>
          o.platform === platform ? { ...o, imageUrl: undefined } : o
        ),
      };
    });
    const output = data.outputs.find((o) => o.platform === platform);
    if (output) {
      await fetch(`/api/repurpose/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, content: output.content, imageUrl: null }),
      });
    }
    toast("Image removed");
  }, [data, id, toast]);

  async function handleSaveAsVoiceSample() {
    if (!data) return;
    setSavingVoice(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.original_content.slice(0, 2000), label: data.title }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save voice sample");
      }
      toast("Saved as voice sample!");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSavingVoice(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="brutal-card p-8 bg-white text-center">
          <div className="text-4xl animate-spin mb-3">&#9889;</div>
          <p className="font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="brutal-card p-8 bg-white text-center">
          <div className="text-4xl mb-3">&#10060;</div>
          <p className="font-bold mb-4">Not found</p>
          <a href="/dashboard" className="brutal-btn px-6 py-2 bg-primary inline-block">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SubNav />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase">{data.title}</h1>
            <p className="text-sm font-medium text-dark/40 mt-1">
              {new Date(data.created_at).toLocaleDateString()} &bull; {data.content_type} &bull; {data.outputs.length}{" "}
              outputs
              {data.tone && <> &bull; {data.tone}</>}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleSaveAsVoiceSample}
              disabled={savingVoice}
              className={`brutal-btn px-4 py-3 text-xs ${savingVoice ? "bg-dark/50 text-white" : "bg-lavender"}`}
              title="Save original content as a voice/style sample"
            >
              {savingVoice ? "Saving..." : "Save as Voice Sample"}
            </button>
            <button onClick={downloadAll} className="brutal-btn px-6 py-3 bg-accent">
              Download All
            </button>
          </div>
        </div>

        {/* Output Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {data.outputs.map((output) => {
            const shareAction = getShareAction(output.platform, output.content);
            return (
              <div key={output.platform} className="brutal-card p-6 bg-white flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`brutal-border px-3 py-1 text-xs font-bold uppercase ${platformColors[output.platform] || "bg-primary"}`}
                    >
                      {output.platform}
                    </span>
                    <span className="text-xs font-medium text-dark/40">{output.format}</span>
                  </div>
                  <span className="text-xs text-dark/40">{output.content.length} chars</span>
                </div>

                {/* Generated Image */}
                {output.imageUrl && (
                  <div className="mb-4">
                    <img src={output.imageUrl} alt={`${output.platform} image`} className="w-full brutal-border" />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => downloadImage(output.imageUrl!, output.platform)}
                        className="brutal-btn px-3 py-1 text-[10px] bg-accent"
                      >
                        Download Image
                      </button>
                      <button
                        onClick={() => handleRemoveImage(output.platform)}
                        className="brutal-btn px-3 py-1 text-[10px] bg-secondary/20 text-secondary"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {editing === output.platform ? (
                  <div className="flex-1 mb-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={8}
                      className="w-full brutal-border px-3 py-2 text-sm font-medium bg-white resize-y focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveEdit(output.platform)}
                        className="brutal-btn px-4 py-1.5 text-xs bg-lime"
                      >
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="brutal-btn px-4 py-1.5 text-xs bg-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm font-medium text-dark/80 leading-relaxed flex-1 mb-4 max-h-64 overflow-y-auto">
                    {output.content}
                  </pre>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => copyToClipboard(output.content, output.platform)}
                    className={`brutal-btn flex-1 py-2 text-xs ${copied === output.platform ? "bg-lime" : "bg-white"}`}
                  >
                    {copied === output.platform ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(output.platform);
                      setEditContent(output.content);
                    }}
                    className="brutal-btn px-3 py-2 text-xs bg-white"
                  >
                    Edit
                  </button>
                  <div className="relative group">
                    <button
                      onClick={() => handleRegenerate(output.platform)}
                      disabled={regenerating === output.platform}
                      className={`brutal-btn px-3 py-2 text-xs ${regenerating === output.platform ? "bg-dark/50 text-white" : "bg-accent"}`}
                    >
                      {regenerating === output.platform ? "..." : "Regen"}
                    </button>
                    {/* Tone options on hover */}
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col gap-1 z-10 brutal-border bg-white p-2 shadow-[4px_4px_0_#000]">
                      {TONES.map((t) => (
                        <button
                          key={t}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegenerate(output.platform, t);
                          }}
                          className="text-[10px] font-bold uppercase px-3 py-1 hover:bg-primary/30 text-left whitespace-nowrap"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Generate Image Button */}
                  {!output.imageUrl && (
                    <button
                      onClick={() => handleGenerateImage(output.platform)}
                      disabled={generatingImage === output.platform}
                      className={`brutal-btn px-3 py-2 text-xs ${generatingImage === output.platform ? "bg-dark/50 text-white" : "bg-lavender"}`}
                    >
                      {generatingImage === output.platform ? "..." : "AI Image"}
                    </button>
                  )}
                  {/* Share Button */}
                  <button
                    onClick={async () => {
                      // Try Web Share API on mobile first
                      const shared = await handleWebShare(output.content, output.platform);
                      if (!shared) handleShare(shareAction, output.content, output.platform);
                    }}
                    className="brutal-btn px-3 py-2 text-xs bg-primary"
                    title={`${shareAction.label} to ${output.platform}`}
                  >
                    {shareAction.label} &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function RepurposeDetailPage() {
  return (
    <ToastProvider>
      <DetailContent />
    </ToastProvider>
  );
}
