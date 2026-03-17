"use client";

import { useState, useEffect } from "react";
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

const FREE_LIMIT = 5;

function DashboardContent({
  repurposes: initial,
  userName,
  plan,
  usageCount,
}: {
  repurposes: Repurpose[];
  userName: string;
  plan: string;
  usageCount: number;
}) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [repurposes, setRepurposes] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Show payment toast
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast("Payment successful! You are now a Pro user.", "success");
    }
  }, [searchParams, toast]);

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
      setRepurposes((prev) => prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)));
      toast("Updated!");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/repurpose/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRepurposes((prev) => prev.filter((r) => r.id !== id));
        toast("Repurpose deleted!");
      } else {
        toast("Failed to delete", "error");
      }
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  }

  // Recent activity (last 5)
  const recentActivity = repurposes.slice(0, 5);

  const usagePercent = plan === "pro" ? 100 : Math.min((usageCount / FREE_LIMIT) * 100, 100);
  const usageRemaining = plan === "pro" ? Infinity : Math.max(FREE_LIMIT - usageCount, 0);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Welcome + CTA */}
      <div className="brutal-card p-8 bg-primary mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase mb-1">Welcome, {userName}!</h1>
          <p className="text-dark/70 font-medium">Upload content and let AI transform it for every platform.</p>
        </div>
        <a href="/dashboard/new" className="brutal-btn px-6 py-3 bg-dark text-white shrink-0 text-center">
          + New Repurpose
        </a>
      </div>

      {/* Usage Bar (Free users) */}
      {plan === "free" && (
        <div className="brutal-card p-5 bg-white mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold uppercase">Monthly Usage</span>
            <span className="text-sm font-bold">
              {usageCount}/{FREE_LIMIT} repurposes
            </span>
          </div>
          <div className="brutal-border h-4 bg-[#FAFAFA] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                usagePercent >= 100 ? "bg-secondary" : usagePercent >= 80 ? "bg-primary" : "bg-accent"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {usageRemaining === 0 ? (
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-bold text-secondary">Monthly limit reached</span>
              <a href="/#pricing" className="brutal-btn px-4 py-1.5 text-xs bg-accent">
                Upgrade to Pro — Unlimited
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium text-dark/40">
                {usageRemaining} repurpose{usageRemaining !== 1 ? "s" : ""} remaining this month
              </span>
              <a href="/#pricing" className="text-xs font-bold text-accent hover:underline">
                Go unlimited with Pro →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Repurposes", value: repurposes.length.toString(), color: "bg-primary/20" },
          { label: "Outputs Generated", value: totalOutputs.toString(), color: "bg-accent/20" },
          { label: "Platforms Used", value: uniquePlatforms.toString(), color: "bg-lavender/20" },
        ].map((stat) => (
          <div key={stat.label} className={`brutal-card p-4 ${stat.color}`}>
            <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
            <div className="text-xs uppercase tracking-wider font-medium text-dark/60">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity Timeline */}
      {recentActivity.length > 0 && (
        <div className="brutal-card p-6 bg-white mb-6">
          <h2 className="text-lg font-bold uppercase mb-4">Recent Activity</h2>
          <div className="space-y-0">
            {recentActivity.map((r, i) => {
              const date = new Date(r.created_at);
              const timeAgo = getTimeAgo(date);
              return (
                <div key={r.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 brutal-border bg-primary rounded-full shrink-0 mt-1" />
                    {i < recentActivity.length - 1 && <div className="w-0.5 bg-black/10 flex-1 min-h-[24px]" />}
                  </div>
                  {/* Content */}
                  <a href={`/dashboard/${r.id}`} className="flex-1 pb-4 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{r.title}</span>
                      <span className="brutal-border px-1.5 py-0.5 text-[9px] font-bold uppercase bg-lime/30">
                        {r.content_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-dark/40 font-medium">{timeAgo}</span>
                      <span className="text-xs text-dark/40">&bull;</span>
                      <span className="text-xs text-dark/40 font-medium">{r.outputs.length} outputs</span>
                      {r.tone && (
                        <>
                          <span className="text-xs text-dark/40">&bull;</span>
                          <span className="text-xs text-dark/40 font-medium">{r.tone}</span>
                        </>
                      )}
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Library Header with Search/Filter/Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold uppercase">Your Library</h2>
        <div className="flex gap-2">
          <button
            onClick={() => (window.location.href = "/api/repurpose/export")}
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
            {filter === "favorites" ? "★ Favorites" : "☆ All"}
          </button>
          {contentTypes.length > 1 && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="brutal-border px-3 py-1.5 text-xs font-bold bg-white uppercase"
            >
              <option value="all">All Types</option>
              {contentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Library List */}
      {filtered.length === 0 ? (
        <div className="brutal-card p-12 bg-white text-center">
          {repurposes.length === 0 ? (
            <>
              <div className="text-5xl mb-4">🚀</div>
              <p className="font-bold text-xl mb-2">Create your first repurpose</p>
              <p className="text-dark/60 font-medium text-sm mb-8 max-w-md mx-auto">
                Upload content in any format and let AI transform it for 10 platforms in seconds.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                {[
                  { icon: "📝", label: "Paste Text", desc: "Blog, transcript, notes" },
                  { icon: "🔗", label: "Import URL", desc: "Any blog or article" },
                  { icon: "📁", label: "Upload File", desc: "Audio, video, or PDF" },
                ].map((m) => (
                  <a
                    key={m.label}
                    href="/dashboard/new"
                    className="brutal-card p-4 bg-[#FAFAFA] hover:bg-primary/10 transition-colors text-center"
                  >
                    <div className="text-2xl mb-2">{m.icon}</div>
                    <div className="text-xs font-bold uppercase">{m.label}</div>
                    <div className="text-[10px] text-dark/40 font-medium mt-1">{m.desc}</div>
                  </a>
                ))}
              </div>
              <a href="/dashboard/new" className="brutal-btn inline-block px-8 py-3 bg-primary text-lg">
                + New Repurpose
              </a>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-bold text-lg mb-2">No results</p>
              <p className="text-dark/60 font-medium text-sm">Try a different search or filter.</p>
            </>
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
                  {r.tone && (
                    <>
                      <span>&bull;</span>
                      <span>{r.tone}</span>
                    </>
                  )}
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
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFav(r.id);
                  }}
                  className="text-xl hover:scale-110 transition-transform"
                  title={r.favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {r.favorite ? "★" : "☆"}
                </button>
                {/* Delete */}
                {confirmDelete === r.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(r.id);
                      }}
                      disabled={deleting === r.id}
                      className="brutal-btn px-2 py-1 text-[10px] bg-secondary text-white"
                    >
                      {deleting === r.id ? "..." : "Delete"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setConfirmDelete(null);
                      }}
                      className="brutal-btn px-2 py-1 text-[10px] bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setConfirmDelete(r.id);
                    }}
                    className="text-dark/20 hover:text-secondary transition-colors text-lg"
                    title="Delete repurpose"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function DashboardClient(props: {
  repurposes: Repurpose[];
  userName: string;
  plan: string;
  usageCount: number;
}) {
  return (
    <ToastProvider>
      <DashboardContent {...props} />
    </ToastProvider>
  );
}
