import { signOut } from "@/lib/auth";
import Link from "next/link";

interface DashboardNavProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold uppercase tracking-tight">
          Repurpose<span className="text-secondary">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
    </nav>
  );
}
