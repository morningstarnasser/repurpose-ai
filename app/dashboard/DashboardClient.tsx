"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ToastProvider, useToast } from "@/components/Toast";

interface OutputItem {
  platform: string;
  format: string;
  content: string;
  charCount: number;
}

interface Repurpose {
  id: string;
  title: string;
  original_content: string;
  content_type: string;
  outputs: OutputItem[];
  created_at: string;
  favorite?: boolean;
  tone?: string;
}

function DashboardContent({ repurposes: initial, userName }: { repurposes: Repurpose[]; userName: string }) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [repurposes, setRepurposes] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Show payment toast
  if (searchParams.get("payment") === "success") {
    toast("Payment successful! You are now a Pro user.", "success");
  }

  const totalOutputs = repurposes.reduce((sum, r) => sum + r.outputs.length, 0);
  const uniquePlatforms = new Set(repurposes.flatMap((r) => r.outputs.map((o) => o.platform))).size;
  const contentTypes = [...new Set(repurposes.map((r) => r.content_type))];

  const filtered = repurposes.filter((r) => {
    if (filter === "favorites" && !r.favorite) return false;
    if (typeFilter !== "all" && r.content_type !== typeFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function toggleFav(id: string) {
    const res = await fetch(`/api/repurpose/${id}`, { method: "PATCH" });
    if (res.ok) {
      setRepurposes((prev) => prev.map((r) => r.id === id ? { ...r, favorite: !r.favorite } : r));
      toast("Updated!");
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Welcome + CTA */}
      <div className="brutal-card p-8 bg-primary mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase mb-1">Welcome, {userName}!</h1>
          <p className="text-dark/70 font-medium">Upload content and let AI transform it for every platform.</p>
        </div>
        <a href="/dashboard/new" className="brutal-btn px-6 py-3 bg-dark text-white shrink-0 text-center">
          + New Repurpose
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Repurposes", value: repurposes.length.toString() },
          { label: "Outputs Generated", value: totalOutputs.toString() },
          { label: "Platforms", value: uniquePlatforms.toString() },
        ].map((stat) => (
          <div key={stat.label} className="brutal-card p-4 bg-white">
            <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
            <div className="text-xs uppercase tracking-wider font-medium text-dark/60">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Library Header with Search/Filter/Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold uppercase">Your Library</h2>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = "/api/repurpose/export"}
            className="brutal-btn px-3 py-1.5 text-xs bg-accent"
          >
            Export CSV
          </button>
        </div>
      </div>

      {repurposes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="brutal-border px-3 py-1.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-accent w-48"
          />
          <button
            onClick={() => setFilter(filter === "all" ? "favorites" : "all")}
            className={`brutal-btn px-3 py-1.5 text-xs ${filter === "favorites" ? "bg-primary" : "bg-white"}`}
          >
            {filter === "favorites" ? "&#9733; Favorites" : "&#9734; All"}
          </button>
          {contentTypes.length > 1 && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="brutal-border px-3 py-1.5 text-xs font-bold bg-white uppercase"
            >
              <option value="all">All Types</option>
              {contentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Library List */}
      {filtered.length === 0 ? (
        <div className="brutal-card p-12 bg-white text-center">
          <div className="text-4xl mb-3">&#128640;</div>
          <p className="font-bold text-lg mb-2">{repurposes.length === 0 ? "No repurposes yet" : "No results"}</p>
          <p className="text-dark/60 font-medium text-sm mb-6">
            {repurposes.length === 0 ? "Upload your first piece of content to get started!" : "Try a different search or filter."}
          </p>
          {repurposes.length === 0 && (
            <a href="/dashboard/new" className="brutal-btn inline-block px-6 py-3 bg-primary">Create Your First Repurpose</a>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="brutal-card p-6 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <a href={`/dashboard/${r.id}`} className="flex-1 hover:opacity-80">
                <h3 className="font-bold text-lg uppercase">{r.title}</h3>
                <div className="flex gap-3 text-xs font-medium text-dark/40 mt-1">
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span>{r.content_type}</span>
                  <span>&bull;</span>
                  <span>{r.outputs.length} outputs</span>
                  {r.tone && <><span>&bull;</span><span>{r.tone}</span></>}
                </div>
              </a>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap">
                  {r.outputs.slice(0, 3).map((o) => (
                    <span key={o.platform} className="brutal-border px-2 py-0.5 text-[10px] font-bold uppercase bg-primary/30">
                      {o.platform}
                    </span>
                  ))}
                  {r.outputs.length > 3 && (
                    <span className="brutal-border px-2 py-0.5 text-[10px] font-bold bg-dark/10">+{r.outputs.length - 3}</span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); toggleFav(r.id); }}
                  className="text-xl hover:scale-110 transition-transform"
                  title={r.favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {r.favorite ? "\u2605" : "\u2606"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function DashboardClient(props: { repurposes: Repurpose[]; userName: string }) {
  return (
    <ToastProvider>
      <DashboardContent {...props} />
    </ToastProvider>
  );
}
