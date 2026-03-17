"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SubNav from "@/components/SubNav";
import { ToastProvider, useToast } from "@/components/Toast";

interface OutputItem {
  platform: string;
  format: string;
  content: string;
  charCount: number;
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

function getShareUrl(platform: string, content: string): string | null {
  const text = encodeURIComponent(content.slice(0, 280));
  switch (platform) {
    case "Twitter/X":
      return `https://twitter.com/intent/tweet?text=${text}`;
    case "LinkedIn":
      return `https://www.linkedin.com/sharing/share-offsite/?url=&summary=${text}`;
    case "Reddit":
      return `https://www.reddit.com/submit?selftext=true&text=${text}`;
    case "Threads":
      return `https://www.threads.net/intent/post?text=${text}`;
    default:
      return null;
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
    a.click();
    URL.revokeObjectURL(url);
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
          <button onClick={downloadAll} className="brutal-btn px-6 py-3 bg-accent shrink-0">
            Download All
          </button>
        </div>

        {/* Output Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {data.outputs.map((output) => {
            const shareUrl = getShareUrl(output.platform, output.content);
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
                  {/* Share Button */}
                  {shareUrl && (
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brutal-btn px-3 py-2 text-xs bg-primary"
                      title={`Share to ${output.platform}`}
                    >
                      Share →
                    </a>
                  )}
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
