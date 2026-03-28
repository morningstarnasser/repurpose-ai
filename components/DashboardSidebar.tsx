"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface DashboardSidebarProps {
  readonly user: {
    readonly name?: string | null;
    readonly email?: string | null;
    readonly image?: string | null;
  };
  readonly plan: string;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "\u25A0" },
  { label: "New Repurpose", href: "/dashboard/new", icon: "+" },
  { label: "Profile", href: "/dashboard/profile", icon: "\u25CF" },
];

export default function DashboardSidebar({ user, plan }: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b-3 border-black">
        <Link href="/" className="text-xl font-bold uppercase tracking-tight">
          Repurpose<span className="text-secondary">AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
              isActive(item.href)
                ? "bg-primary brutal-border shadow-[2px_2px_0_#000]"
                : "hover:bg-primary/20"
            }`}
          >
            <span className="w-5 text-center text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Plan Badge */}
      <div className="px-4 pb-4">
        {plan === "free" ? (
          <Link
            href="/#pricing"
            className="block text-center brutal-btn px-4 py-2.5 text-xs bg-accent w-full"
          >
            Upgrade Plan
          </Link>
        ) : (
          <div className="brutal-border px-4 py-2.5 text-xs font-bold uppercase text-center bg-lime">
            {plan} Plan
          </div>
        )}
      </div>

      {/* User + Sign Out */}
      <div className="border-t-3 border-black p-4">
        <div className="flex items-center gap-3 mb-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || ""}
              className="w-8 h-8 rounded-full brutal-border shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full brutal-border bg-primary flex items-center justify-center text-xs font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">{user.name}</div>
            <div className="text-[10px] text-dark/50 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="brutal-btn w-full px-4 py-2 text-xs bg-secondary text-white"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r-3 border-black shadow-[4px_0_0_#000] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 bg-white border-b-3 border-black shadow-[0_4px_0_#000] z-40 h-16 flex items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold uppercase tracking-tight">
          Repurpose<span className="text-secondary">AI</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="brutal-btn w-10 h-10 flex items-center justify-center bg-white text-lg"
        >
          {mobileOpen ? "\u00D7" : "\u2261"}
        </button>
      </div>

      {/* Mobile Overlay + Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r-3 border-black shadow-[4px_0_0_#000] z-50 animate-fadeIn">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
