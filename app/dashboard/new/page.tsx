"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const contentTypes = [
  { value: "blog", label: "Blog Post", icon: "📝" },
  { value: "podcast", label: "Podcast Transcript", icon: "🎙️" },
  { value: "video", label: "Video Script", icon: "🎬" },
  { value: "text", label: "Any Text", icon: "📄" },
];

export default function NewRepurposePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 20) {
      setError("Content must be at least 20 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || undefined, content, contentType }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to repurpose");
      }
      const data = await res.json();
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold uppercase mb-8">
          New <span className="text-secondary">Repurpose</span>
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Content Type */}
          <div className="mb-6">
            <label className="block text-sm font-bold uppercase tracking-wider mb-3">Content Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {contentTypes.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setContentType(ct.value)}
                  className={`brutal-card p-4 text-center text-sm font-bold ${
                    contentType === ct.value ? "bg-primary" : "bg-white"
                  }`}
                >
                  <div className="text-2xl mb-1">{ct.icon}</div>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
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

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Your Content <span className="text-secondary">*</span>
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
              {content.length} characters &bull; Min 20 characters
            </div>
          </div>

          {error && (
            <div className="brutal-border bg-secondary/20 text-secondary px-4 py-3 font-bold text-sm mb-6">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`brutal-btn w-full py-4 text-lg ${loading ? "bg-dark/50 text-white" : "bg-primary"}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span>
                AI is transforming your content...
              </span>
            ) : (
              "Repurpose with AI →"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
