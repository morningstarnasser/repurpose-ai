"use client";

import { useState, useEffect } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; image?: string; email?: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Check auth session
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {});

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b-3 border-black shadow-[0_4px_0_#000]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 text-xl font-bold uppercase tracking-tight">
          <svg viewBox="0 0 512 512" className="w-8 h-8" aria-hidden="true">
            <rect x="20" y="20" width="472" height="472" rx="40" fill="#FFD700" stroke="#000" strokeWidth="16"/>
            <text x="138" y="380" fontFamily="Arial Black, Impact, sans-serif" fontSize="360" fontWeight="900" fill="#1A1A2E" letterSpacing="-15">R</text>
            <rect x="300" y="280" width="170" height="80" rx="8" fill="#FF6B6B" stroke="#000" strokeWidth="10" transform="rotate(3, 385, 320)"/>
            <text x="327" y="340" fontFamily="Arial Black, Impact, sans-serif" fontSize="56" fontWeight="900" fill="#FFF" transform="rotate(3, 385, 320)">AI</text>
          </svg>
          <span className="hidden sm:inline">Repurpose<span className="text-secondary">AI</span></span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors"
            >
              {link.label}
            </a>
          ))}
          {user ? (
            <a href="/dashboard" className="brutal-btn px-5 py-2 text-sm bg-primary flex items-center gap-2">
              {user.image && <img src={user.image} alt="" className="w-5 h-5 rounded-full" />}
              Dashboard
            </a>
          ) : (
            <>
              <a href="/login" className="brutal-btn px-5 py-2 text-sm bg-white">
                Sign In
              </a>
              <a href="#pricing" className="brutal-btn px-5 py-2 text-sm bg-primary">
                Get Started
              </a>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden brutal-border w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-white"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className={`w-5 h-0.5 bg-black transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-5 h-0.5 bg-black transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-0.5 bg-black transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t-3 border-b-3 border-black shadow-[0_4px_0_#000]">
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-bold uppercase tracking-wider py-2 border-b-2 border-black/10"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <a
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="brutal-btn px-5 py-3 text-center bg-primary flex items-center justify-center gap-2"
              >
                {user.image && <img src={user.image} alt="" className="w-5 h-5 rounded-full" />}
                Dashboard
              </a>
            ) : (
              <>
                <a href="/login" onClick={() => setMobileOpen(false)} className="brutal-btn px-5 py-3 text-center bg-white">
                  Sign In
                </a>
                <a href="#pricing" onClick={() => setMobileOpen(false)} className="brutal-btn px-5 py-3 text-center bg-primary">
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
