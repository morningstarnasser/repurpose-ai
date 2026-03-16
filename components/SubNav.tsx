import Link from "next/link";

export default function SubNav({ backHref = "/dashboard", backLabel = "Dashboard" }: { backHref?: string; backLabel?: string }) {
  return (
    <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold uppercase tracking-tight">
          Repurpose<span className="text-secondary">AI</span>
        </Link>
        <Link href={backHref} className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">
          &larr; {backLabel}
        </Link>
      </div>
    </nav>
  );
}
