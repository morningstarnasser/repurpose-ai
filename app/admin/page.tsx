"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "stats" | "users" | "repurposes" | "blog" | "billing" | "analytics";

interface Stats {
  users: { total: number; pro: number; free: number; totalRepurposes: number };
  repurposes: { total: number; today: number; week: number };
  blogPosts: number;
  recentUsers: Array<{ email: string; name: string; plan: string; repurpose_count: number; created_at: string }>;
  recentRepurposes: Array<{ id: string; title: string; user_email: string; content_type: string; created_at: string }>;
  topUsers: Array<{ email: string; name: string; repurpose_count: number }>;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<{ users: Array<Record<string, unknown>>; total: number; totalPages: number }>({ users: [], total: 0, totalPages: 0 });
  const [repurposes, setRepurposes] = useState<{ repurposes: Array<Record<string, unknown>>; total: number; totalPages: number }>({ repurposes: [], total: 0, totalPages: 0 });
  const [blog, setBlog] = useState<Array<Record<string, unknown>>>([]);
  const [billing, setBilling] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<{ platformStats: Array<Record<string, unknown>>; dailyStats: Array<Record<string, unknown>> } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "stats") {
        const r = await fetch("/api/admin?section=stats");
        if (r.status === 403) { setError("Access denied. Admin only."); return; }
        setStats(await r.json());
      } else if (tab === "users") {
        const r = await fetch(`/api/admin?section=users&page=${page}&search=${search}`);
        if (!r.ok) { setError("Failed"); return; }
        setUsers(await r.json());
      } else if (tab === "repurposes") {
        const r = await fetch(`/api/admin?section=repurposes&page=${page}`);
        if (!r.ok) { setError("Failed"); return; }
        setRepurposes(await r.json());
      } else if (tab === "blog") {
        const r = await fetch("/api/admin?section=blog");
        if (!r.ok) { setError("Failed"); return; }
        const d = await r.json();
        setBlog(d.posts || []);
      } else if (tab === "billing") {
        const r = await fetch("/api/admin?section=billing");
        if (!r.ok) { setError("Failed"); return; }
        setBilling(await r.json());
      } else if (tab === "analytics") {
        const r = await fetch("/api/admin?section=analytics");
        if (!r.ok) { setError("Failed"); return; }
        setAnalytics(await r.json());
      }
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  }, [tab, page, search]);

  useEffect(() => { load(); }, [load]);

  async function doAction(action: string, data: Record<string, unknown>) {
    setMsg("");
    const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...data }) });
    if (r.ok) { setMsg("Done!"); load(); setTimeout(() => setMsg(""), 2000); }
    else setMsg("Error");
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "stats", label: "Dashboard" },
    { key: "users", label: "Users" },
    { key: "repurposes", label: "Repurposes" },
    { key: "blog", label: "Blog Posts" },
    { key: "billing", label: "Billing" },
    { key: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-dark text-white border-b-3 border-black">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold uppercase tracking-tight">Admin Panel</span>
          <a href="/dashboard" className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white">Back to App</a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }} className={`brutal-btn px-4 py-2 text-xs ${tab === t.key ? "bg-primary" : "bg-white"}`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="brutal-border bg-secondary/20 text-secondary px-4 py-3 font-bold text-sm mb-4">{error}</div>}
        {msg && <div className="brutal-border bg-lime/30 px-4 py-3 font-bold text-sm mb-4">{msg}</div>}
        {loading && <div className="text-center py-12 font-bold">Loading...</div>}

        {/* STATS */}
        {!loading && tab === "stats" && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: stats.users.total, color: "bg-primary" },
                { label: "Paid Users", value: stats.users.pro, color: "bg-accent" },
                { label: "Total Repurposes", value: stats.repurposes.total, color: "bg-secondary" },
                { label: "Blog Posts", value: stats.blogPosts, color: "bg-lavender" },
                { label: "Repurposes Today", value: stats.repurposes.today, color: "bg-lime" },
                { label: "This Week", value: stats.repurposes.week, color: "bg-white" },
                { label: "Free Users", value: stats.users.free, color: "bg-white" },
                { label: "Total AI Generations", value: stats.users.totalRepurposes, color: "bg-primary" },
              ].map(s => (
                <div key={s.label} className={`brutal-card p-4 ${s.color}`}>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs uppercase tracking-wider font-medium text-dark/60">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="brutal-card p-6 bg-white">
                <h3 className="font-bold uppercase mb-4">Recent Users</h3>
                {stats.recentUsers.map(u => (
                  <div key={u.email} className="flex justify-between items-center py-2 border-b border-black/10 last:border-0">
                    <div>
                      <div className="font-bold text-sm">{u.name || u.email}</div>
                      <div className="text-xs text-dark/40">{u.email}</div>
                    </div>
                    <span className={`brutal-border px-2 py-0.5 text-[10px] font-bold uppercase ${["pro", "business"].includes(u.plan as string) ? "bg-accent" : u.plan === "starter" ? "bg-lime" : "bg-white"}`}>{u.plan}</span>
                  </div>
                ))}
              </div>
              <div className="brutal-card p-6 bg-white">
                <h3 className="font-bold uppercase mb-4">Top Users</h3>
                {stats.topUsers.map((u, i) => (
                  <div key={u.email} className="flex justify-between items-center py-2 border-b border-black/10 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="brutal-border w-6 h-6 flex items-center justify-center text-[10px] font-bold bg-primary">{i + 1}</span>
                      <div className="font-bold text-sm">{u.name || u.email}</div>
                    </div>
                    <span className="font-bold text-sm">{u.repurpose_count} rp</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {!loading && tab === "users" && (
          <div>
            <div className="flex gap-3 mb-4">
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} placeholder="Search by email or name..." className="flex-1 brutal-border px-4 py-2 text-sm bg-white" />
              <button onClick={load} className="brutal-btn px-4 py-2 text-xs bg-accent">Search</button>
            </div>
            <div className="brutal-card bg-white overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b-3 border-black">
                  <th className="text-left p-3 font-bold uppercase text-xs">User</th>
                  <th className="text-left p-3 font-bold uppercase text-xs">Plan</th>
                  <th className="text-left p-3 font-bold uppercase text-xs">Repurposes</th>
                  <th className="text-left p-3 font-bold uppercase text-xs">Joined</th>
                  <th className="text-left p-3 font-bold uppercase text-xs">Actions</th>
                </tr></thead>
                <tbody>
                  {users.users.map((u: Record<string, unknown>) => (
                    <tr key={u.email as string} className="border-b border-black/10">
                      <td className="p-3">
                        <div className="font-bold">{(u.name as string) || "-"}</div>
                        <div className="text-xs text-dark/40">{u.email as string}</div>
                      </td>
                      <td className="p-3"><span className={`brutal-border px-2 py-0.5 text-[10px] font-bold uppercase ${["pro", "business"].includes(u.plan as string) ? "bg-accent" : u.plan === "starter" ? "bg-lime" : "bg-white"}`}>{u.plan as string}</span></td>
                      <td className="p-3 font-bold">{u.repurpose_count as number}</td>
                      <td className="p-3 text-xs text-dark/40">{new Date(u.created_at as string).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          <select onChange={(e) => { if (e.target.value !== u.plan) doAction("updatePlan", { email: u.email, plan: e.target.value }); }} value={u.plan as string} className="brutal-border px-2 py-1 text-[10px] font-bold uppercase bg-accent cursor-pointer">
                            {["free", "starter", "pro", "business"].map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <button onClick={() => doAction("resetCount", { email: u.email })} className="brutal-btn px-2 py-1 text-[10px] bg-primary">Reset</button>
                          <button onClick={() => { if (confirm(`Delete ${u.email}?`)) doAction("deleteUser", { email: u.email }); }} className="brutal-btn px-2 py-1 text-[10px] bg-secondary text-white">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.totalPages > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {Array.from({ length: users.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`brutal-btn px-3 py-1 text-xs ${page === i + 1 ? "bg-primary" : "bg-white"}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPURPOSES */}
        {!loading && tab === "repurposes" && (
          <div>
            <div className="brutal-card bg-white overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b-3 border-black">
                  <th className="text-left p-3 font-bold uppercase text-xs">Title</th>
                  <th className="text-left p-3 font-bold uppercase text-xs">User</th>
                  <th className="text-left p-3 font-bold uppercase text-xs">Type</th>
                  <th className="text-left p-3 font-bold uppercase text-xs">Date</th>
                  <th className="text-left p-3 font-bold uppercase text-xs">Actions</th>
                </tr></thead>
                <tbody>
                  {repurposes.repurposes.map((r: Record<string, unknown>) => (
                    <tr key={r.id as string} className="border-b border-black/10">
                      <td className="p-3 font-bold max-w-[200px] truncate">{r.title as string}</td>
                      <td className="p-3 text-xs">{(r.user_name as string) || (r.user_email as string)}</td>
                      <td className="p-3"><span className="brutal-border px-2 py-0.5 text-[10px] font-bold uppercase bg-lavender/30">{r.content_type as string}</span></td>
                      <td className="p-3 text-xs text-dark/40">{new Date(r.created_at as string).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <a href={`/dashboard/${r.id}`} target="_blank" className="brutal-btn px-2 py-1 text-[10px] bg-accent">View</a>
                          <button onClick={() => { if (confirm("Delete?")) doAction("deleteRepurpose", { id: r.id }); }} className="brutal-btn px-2 py-1 text-[10px] bg-secondary text-white">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {repurposes.totalPages > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {Array.from({ length: repurposes.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`brutal-btn px-3 py-1 text-xs ${page === i + 1 ? "bg-primary" : "bg-white"}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BLOG */}
        {!loading && tab === "blog" && (
          <div className="grid gap-4">
            <a href="/api/blog/generate" className="brutal-btn px-4 py-2 text-xs bg-accent inline-block w-fit" onClick={async (e) => { e.preventDefault(); await doAction("generateBlog", {}); }}>+ Generate New Blog Post</a>
            {blog.length === 0 && <p className="text-dark/40 font-medium text-sm">No blog posts yet.</p>}
            {blog.map((p: Record<string, unknown>) => (
              <div key={p.slug as string} className="brutal-card p-4 bg-white flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm">{p.title as string}</div>
                  <div className="text-xs text-dark/40">{p.date as string} · {p.readTime as string}</div>
                </div>
                <div className="flex gap-2">
                  <a href={`/blog/${p.slug}`} target="_blank" className="brutal-btn px-3 py-1 text-[10px] bg-accent">View</a>
                  <button onClick={() => { if (confirm("Delete post?")) doAction("deleteBlogPost", { slug: p.slug }); }} className="brutal-btn px-3 py-1 text-[10px] bg-secondary text-white">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BILLING */}
        {!loading && tab === "billing" && billing && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "MRR", value: `$${billing.mrr}`, color: "bg-lime" },
                { label: "Total Revenue", value: `$${billing.totalRevenue}`, color: "bg-accent" },
                { label: "Active Subs", value: `${billing.activeSubs}`, color: "bg-primary" },
                { label: "Paid Users", value: `${billing.totalPro}`, color: "bg-lavender" },
              ].map(s => (
                <div key={s.label} className={`brutal-card p-4 ${s.color}`}>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs uppercase tracking-wider font-medium text-dark/60">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="brutal-card p-6 bg-white">
              <h3 className="font-bold uppercase mb-4">Recent Transactions</h3>
              {(billing.recentCharges as Array<{ amount: number; email: string; date: string }>)?.length ? (
                <div className="space-y-2">
                  {(billing.recentCharges as Array<{ amount: number; email: string; date: string }>).map((c, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-black/10 last:border-0">
                      <div>
                        <span className="font-bold text-sm">${c.amount}</span>
                        <span className="text-xs text-dark/40 ml-2">{c.email}</span>
                      </div>
                      <span className="text-xs text-dark/40">{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-dark/40 text-sm font-medium">No transactions yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {!loading && tab === "analytics" && analytics && (
          <div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="brutal-card p-6 bg-white">
                <h3 className="font-bold uppercase mb-4">Platform Usage</h3>
                {analytics.platformStats.map((p) => {
                  const maxCount = Math.max(...analytics.platformStats.map(s => Number(s.count)));
                  const pct = maxCount > 0 ? (Number(p.count) / maxCount) * 100 : 0;
                  return (
                    <div key={p.platform as string} className="mb-3">
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span>{p.platform as string}</span>
                        <span>{p.count as number}</span>
                      </div>
                      <div className="brutal-border h-6 bg-white overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {analytics.platformStats.length === 0 && <p className="text-dark/40 text-sm">No data yet.</p>}
              </div>
              <div className="brutal-card p-6 bg-white">
                <h3 className="font-bold uppercase mb-4">Daily Repurposes (30 days)</h3>
                <div className="flex items-end gap-1 h-40">
                  {analytics.dailyStats.map((d) => {
                    const maxCount = Math.max(...analytics.dailyStats.map(s => Number(s.count)));
                    const pct = maxCount > 0 ? (Number(d.count) / maxCount) * 100 : 0;
                    return (
                      <div key={d.day as string} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.day}: ${d.count}`}>
                        <div className="w-full brutal-border bg-accent min-h-[4px]" style={{ height: `${pct}%` }} />
                      </div>
                    );
                  })}
                </div>
                {analytics.dailyStats.length === 0 && <p className="text-dark/40 text-sm">No data yet.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
