const links = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Sign In", href: "/login" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="px-6 py-12 md:py-16 bg-dark text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="text-2xl font-bold uppercase mb-4 inline-block">
              Repurpose
              <span className="text-primary">AI</span>
            </a>
            <p className="text-white/60 font-medium text-sm max-w-xs">
              Turn one piece of content into dozens with the power of AI.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-4 text-primary">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-white/60 hover:text-white font-medium text-sm transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm font-medium">
            &copy; {new Date().getFullYear()} RepurposeAI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="/privacy" className="text-white/40 hover:text-white text-sm font-medium transition-colors">Privacy</a>
            <a href="/terms" className="text-white/40 hover:text-white text-sm font-medium transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
