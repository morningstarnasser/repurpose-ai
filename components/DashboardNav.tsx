import { signOut } from "@/lib/auth";
import Link from "next/link";

interface DashboardNavProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  plan?: string;
}

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Repurpose", href: "/dashboard/new" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardNav({ user, plan = "free" }: DashboardNavProps) {
  return (
    <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold uppercase tracking-tight">
            Repurpose<span className="text-secondary">AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 hover:bg-primary/20 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {plan === "free" ? (
            <Link
              href="/#pricing"
              className="hidden sm:inline-block brutal-border px-3 py-1.5 text-xs font-bold uppercase bg-accent hover:bg-accent/80 transition-colors"
            >
              Upgrade
            </Link>
          ) : (
            <span className={`hidden sm:inline-block brutal-border px-3 py-1.5 text-xs font-bold uppercase ${
              plan === "business" ? "bg-accent" : plan === "pro" ? "bg-accent" : "bg-lime"
            }`}>
              {plan}
            </span>
          )}
          <Link href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {user.image && (
              <img src={user.image} alt={user.name || ""} className="w-8 h-8 rounded-full brutal-border" />
            )}
            <span className="hidden sm:inline text-sm font-bold">{user.name}</span>
          </Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="brutal-btn px-4 py-2 text-xs bg-secondary text-white">Sign Out</button>
          </form>
        </div>
      </div>
      {/* Mobile nav links */}
      <div className="md:hidden flex border-t-2 border-black/10">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex-1 text-center text-xs font-bold uppercase tracking-wider py-2.5 hover:bg-primary/20 transition-colors border-r border-black/10 last:border-r-0"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
