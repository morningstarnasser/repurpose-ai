import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserRepurposes } from "@/lib/repurpose";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;
  const repurposes = await getUserRepurposes(user.email!);
  const totalOutputs = repurposes.reduce((sum, r) => sum + r.outputs.length, 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold uppercase tracking-tight">
            Repurpose<span className="text-secondary">AI</span>
          </a>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.image && (
                <img src={user.image} alt={user.name || ""} className="w-8 h-8 rounded-full brutal-border" />
              )}
              <span className="hidden sm:inline text-sm font-bold">{user.name}</span>
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" className="brutal-btn px-4 py-2 text-xs bg-secondary text-white">Sign Out</button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome + CTA */}
        <div className="brutal-card p-8 bg-primary mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase mb-1">Welcome, {user.name?.split(" ")[0]}!</h1>
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
            { label: "Platforms", value: "6" },
          ].map((stat) => (
            <div key={stat.label} className="brutal-card p-4 bg-white">
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              <div className="text-xs uppercase tracking-wider font-medium text-dark/60">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Library */}
        <h2 className="text-2xl font-bold uppercase mb-4">Your Library</h2>
        {repurposes.length === 0 ? (
          <div className="brutal-card p-12 bg-white text-center">
            <div className="text-4xl mb-3">🚀</div>
            <p className="font-bold text-lg mb-2">No repurposes yet</p>
            <p className="text-dark/60 font-medium text-sm mb-6">Upload your first piece of content to get started!</p>
            <a href="/dashboard/new" className="brutal-btn inline-block px-6 py-3 bg-primary">Create Your First Repurpose</a>
          </div>
        ) : (
          <div className="grid gap-4">
            {repurposes.map((r) => (
              <a key={r.id} href={`/dashboard/${r.id}`} className="brutal-card p-6 bg-white hover:bg-lime/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg uppercase">{r.title}</h3>
                  <div className="flex gap-3 text-xs font-medium text-dark/40 mt-1">
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span>{r.content_type}</span>
                    <span>&bull;</span>
                    <span>{r.outputs.length} outputs</span>
                  </div>
                </div>
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
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
