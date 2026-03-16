"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface OutputItem {
  platform: string;
  format: string;
  content: string;
  charCount: number;
}

interface RepurposeData {
  id: string;
  title: string;
  originalContent: string;
  contentType: string;
  outputs: OutputItem[];
  createdAt: string;
}

const platformColors: Record<string, string> = {
  "Twitter/X": "bg-primary",
  LinkedIn: "bg-accent",
  Instagram: "bg-secondary",
  TikTok: "bg-lavender",
  Email: "bg-lime",
  YouTube: "bg-primary",
};

export default function RepurposeDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<RepurposeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/repurpose/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  function copyToClipboard(text: string, platform: string) {
    navigator.clipboard.writeText(text);
    setCopied(platform);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="brutal-card p-8 bg-white text-center">
          <div className="text-4xl animate-spin mb-3">⚡</div>
          <p className="font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="brutal-card p-8 bg-white text-center">
          <div className="text-4xl mb-3">❌</div>
          <p className="font-bold mb-4">Not found</p>
          <a href="/dashboard" className="brutal-btn px-6 py-2 bg-primary inline-block">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold uppercase tracking-tight">
            Repurpose<span className="text-secondary">AI</span>
          </a>
          <a href="/dashboard" className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">
            &larr; Dashboard
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase">{data.title}</h1>
            <p className="text-sm font-medium text-dark/40 mt-1">
              {new Date(data.createdAt).toLocaleDateString()} &bull; {data.contentType} &bull; {data.outputs.length} outputs
            </p>
          </div>
          <button onClick={downloadAll} className="brutal-btn px-6 py-3 bg-accent shrink-0">
            Download All
          </button>
        </div>

        {/* Output Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {data.outputs.map((output) => (
            <div key={output.platform} className="brutal-card p-6 bg-white flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`brutal-border px-3 py-1 text-xs font-bold uppercase ${platformColors[output.platform] || "bg-primary"}`}>
                    {output.platform}
                  </span>
                  <span className="text-xs font-medium text-dark/40">{output.format}</span>
                </div>
                <span className="text-xs text-dark/40">{output.content.length} chars</span>
              </div>

              <pre className="whitespace-pre-wrap text-sm font-medium text-dark/80 leading-relaxed flex-1 mb-4 max-h-64 overflow-y-auto">
                {output.content}
              </pre>

              <button
                onClick={() => copyToClipboard(output.content, output.platform)}
                className={`brutal-btn w-full py-2 text-sm ${
                  copied === output.platform ? "bg-lime" : "bg-white"
                }`}
              >
                {copied === output.platform ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
