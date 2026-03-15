import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Dashboard Nav */}
      <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold uppercase tracking-tight">
            Repurpose<span className="text-secondary">AI</span>
          </a>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name || ""}
                  className="w-8 h-8 rounded-full brutal-border"
                />
              )}
              <span className="hidden sm:inline text-sm font-bold">
                {user.name}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="brutal-btn px-4 py-2 text-xs bg-secondary text-white"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="brutal-card p-8 bg-primary mb-8">
          <h1 className="text-3xl md:text-4xl font-bold uppercase mb-2">
            Welcome back, {user.name?.split(" ")[0]}!
          </h1>
          <p className="text-dark/70 font-medium">
            Ready to repurpose some content? Upload your first piece to get
            started.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Upload Content",
              desc: "Drop in a podcast, blog, or video",
              icon: "📤",
              color: "bg-white",
            },
            {
              title: "My Library",
              desc: "View all repurposed content",
              icon: "📚",
              color: "bg-white",
            },
            {
              title: "Export Queue",
              desc: "Scheduled posts ready to publish",
              icon: "📅",
              color: "bg-white",
            },
          ].map((action) => (
            <button
              key={action.title}
              className="brutal-card p-6 text-left hover:bg-lime"
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-bold uppercase mb-1">
                {action.title}
              </h3>
              <p className="text-dark/60 text-sm font-medium">{action.desc}</p>
            </button>
          ))}
        </div>

        {/* Stats */}
        <h2 className="text-2xl font-bold uppercase mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Repurposes", value: "0" },
            { label: "Content Pieces", value: "0" },
            { label: "Exports", value: "0" },
            { label: "Time Saved", value: "0h" },
          ].map((stat) => (
            <div key={stat.label} className="brutal-card p-4 bg-white">
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              <div className="text-xs uppercase tracking-wider font-medium text-dark/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold uppercase mb-4">Recent Activity</h2>
        <div className="brutal-card p-8 bg-white text-center">
          <div className="text-4xl mb-3">🚀</div>
          <p className="font-bold text-lg mb-2">No activity yet</p>
          <p className="text-dark/60 font-medium text-sm">
            Upload your first piece of content to start repurposing!
          </p>
        </div>
      </main>
    </div>
  );
}
