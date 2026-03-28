"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ToastProvider, useToast } from "@/components/Toast";
import { getPlanConfig } from "@/lib/plans";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  const planConfig = getPlanConfig(plan);
  const hasLimit = planConfig.repurposeLimit !== Infinity;
  const usagePercent = hasLimit ? Math.min((usageCount / planConfig.repurposeLimit) * 100, 100) : 100;
  const usageRemaining = hasLimit ? Math.max(planConfig.repurposeLimit - usageCount, 0) : Infinity;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase">Welcome, {userName}!</h1>
          <p className="text-dark/50 text-sm font-medium mt-1">
            Upload content and let AI transform it for every platform.
          </p>
        </div>
        <a href="/dashboard/new" className="brutal-btn px-6 py-3 bg-primary text-center shrink-0">
          + New Repurpose
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="brutal-card p-5 bg-primary/20">
          <div className="text-3xl font-bold">{repurposes.length}</div>
          <div className="text-xs uppercase tracking-wider font-medium text-dark/60 mt-1">Repurposes</div>
        </div>
        <div className="brutal-card p-5 bg-accent/20">
          <div className="text-3xl font-bold">{totalOutputs}</div>
          <div className="text-xs uppercase tracking-wider font-medium text-dark/60 mt-1">Outputs</div>
        </div>
        <div className="brutal-card p-5 bg-lavender/20">
          <div className="text-3xl font-bold">{uniquePlatforms}</div>
          <div className="text-xs uppercase tracking-wider font-medium text-dark/60 mt-1">Platforms</div>
        </div>
        {hasLimit ? (
          <div className="brutal-card p-5 bg-lime/20">
            <div className="text-3xl font-bold">
              {usageCount}<span className="text-lg text-dark/40">/{planConfig.repurposeLimit}</span>
            </div>
            <div className="text-xs uppercase tracking-wider font-medium text-dark/60 mt-1">Monthly Usage</div>
            <div className="brutal-border h-2 bg-[#FAFAFA] overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  usagePercent >= 100 ? "bg-secondary" : usagePercent >= 80 ? "bg-primary" : "bg-accent"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {usageRemaining === 0 && (
              <a href="/#pricing" className="text-[10px] font-bold text-secondary mt-1 inline-block">
                Limit reached - Upgrade
              </a>
            )}
          </div>
        ) : (
          <div className="brutal-card p-5 bg-lime/20">
            <div className="text-3xl font-bold">&infin;</div>
            <div className="text-xs uppercase tracking-wider font-medium text-dark/60 mt-1">Unlimited</div>
          </div>
        )}
      </div>

      {/* Library Section */}
      <div className="brutal-card bg-white">
        {/* Library Header */}
        <div className="p-5 border-b-3 border-black flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-bold uppercase">Your Library</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="brutal-border px-3 py-1.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-accent w-40"
            />
            <button
              onClick={() => setFilter(filter === "all" ? "favorites" : "all")}
              className={`brutal-btn px-3 py-1.5 text-xs ${filter === "favorites" ? "bg-primary" : "bg-white"}`}
            >
              {filter === "favorites" ? "\u2605 Fav" : "\u2606 All"}
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
            <button
              onClick={() => (window.location.href = "/api/repurpose/export")}
              className="brutal-btn px-3 py-1.5 text-xs bg-accent"
            >
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            {repurposes.length === 0 ? (
              <>
                <div className="text-5xl mb-4">&#x1F680;</div>
                <p className="font-bold text-xl mb-2">Create your first repurpose</p>
                <p className="text-dark/60 font-medium text-sm mb-8 max-w-md mx-auto">
                  Upload content in any format and let AI transform it for 10 platforms in seconds.
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                  {[
                    { icon: "T", label: "Paste Text", desc: "Blog, transcript, notes" },
                    { icon: "#", label: "Import URL", desc: "Any blog or article" },
                    { icon: "^", label: "Upload File", desc: "Audio, video, or PDF" },
                  ].map((m) => (
                    <a
                      key={m.label}
                      href="/dashboard/new"
                      className="brutal-card p-4 bg-[#FAFAFA] hover:bg-primary/10 transition-colors text-center"
                    >
                      <div className="text-2xl font-bold mb-2">{m.icon}</div>
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
                <div className="text-4xl mb-3">&#x1F50D;</div>
                <p className="font-bold text-lg mb-2">No results</p>
                <p className="text-dark/60 font-medium text-sm">Try a different search or filter.</p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-3 border-black bg-[#FAFAFA]">
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider px-5 py-3 text-dark/50">Title</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider px-5 py-3 text-dark/50">Type</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider px-5 py-3 text-dark/50">Outputs</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider px-5 py-3 text-dark/50">Platforms</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider px-5 py-3 text-dark/50">Date</th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-wider px-5 py-3 text-dark/50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b-2 border-black/10 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <a href={`/dashboard/${r.id}`} className="font-bold text-sm hover:text-secondary transition-colors">
                          {r.title}
                        </a>
                        {r.tone && (
                          <span className="ml-2 text-[10px] text-dark/40 font-medium">{r.tone}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="brutal-border px-2 py-0.5 text-[10px] font-bold uppercase bg-lime/30">
                          {r.content_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold">{r.outputs.length}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {r.outputs.slice(0, 3).map((o) => (
                            <span key={o.platform} className="brutal-border px-2 py-0.5 text-[10px] font-bold uppercase bg-primary/30">
                              {o.platform}
                            </span>
                          ))}
                          {r.outputs.length > 3 && (
                            <span className="brutal-border px-2 py-0.5 text-[10px] font-bold bg-dark/10">
                              +{r.outputs.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-dark/40 font-medium whitespace-nowrap">
                        {mounted ? new Date(r.created_at).toLocaleDateString() : ""}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleFav(r.id)}
                            className="text-lg hover:scale-110 transition-transform"
                            title={r.favorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            {r.favorite ? "\u2605" : "\u2606"}
                          </button>
                          {confirmDelete === r.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={deleting === r.id}
                                className="brutal-btn px-2 py-1 text-[10px] bg-secondary text-white"
                              >
                                {deleting === r.id ? "..." : "Delete"}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="brutal-btn px-2 py-1 text-[10px] bg-white"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(r.id)}
                              className="text-dark/20 hover:text-secondary transition-colors text-lg"
                              title="Delete"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y-2 divide-black/10">
              {filtered.map((r) => (
                <div key={r.id} className="p-5 hover:bg-primary/5 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <a href={`/dashboard/${r.id}`} className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm uppercase truncate">{r.title}</h3>
                      <div className="flex gap-2 text-[10px] font-medium text-dark/40 mt-1">
                        <span>{r.content_type}</span>
                        <span>&bull;</span>
                        <span>{r.outputs.length} outputs</span>
                        <span>&bull;</span>
                        <span>{mounted ? new Date(r.created_at).toLocaleDateString() : ""}</span>
                      </div>
                    </a>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleFav(r.id)}
                        className="text-lg"
                      >
                        {r.favorite ? "\u2605" : "\u2606"}
                      </button>
                      {confirmDelete === r.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deleting === r.id}
                            className="brutal-btn px-2 py-1 text-[10px] bg-secondary text-white"
                          >
                            {deleting === r.id ? "..." : "Del"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="brutal-btn px-2 py-1 text-[10px] bg-white"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(r.id)}
                          className="text-dark/20 hover:text-secondary text-lg"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-2">
                    {r.outputs.slice(0, 4).map((o) => (
                      <span key={o.platform} className="brutal-border px-2 py-0.5 text-[10px] font-bold uppercase bg-primary/30">
                        {o.platform}
                      </span>
                    ))}
                    {r.outputs.length > 4 && (
                      <span className="brutal-border px-2 py-0.5 text-[10px] font-bold bg-dark/10">
                        +{r.outputs.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
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
