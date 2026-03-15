const links = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Resources: ["Blog", "Documentation", "API", "Status"],
  Company: ["About", "Careers", "Contact", "Press"],
  Legal: ["Privacy", "Terms", "Cookies"],
};

export default function Footer() {
  return (
    <footer className="px-6 py-16 bg-dark text-white border-t-4 border-black">
      <div className="max-w-6xl mx-auto">
        {/* Top */}
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold uppercase mb-4">
              Repurpose
              <span className="text-primary">AI</span>
            </div>
            <p className="text-white/60 font-medium text-sm">
              Turn one piece of content into dozens with the power of AI.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-4 text-primary">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/60 hover:text-white font-medium text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="brutal-border border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t-[1px] border-l-0 border-r-0 border-b-0">
          <p className="text-white/40 text-sm font-medium">
            &copy; {new Date().getFullYear()} RepurposeAI. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-white/40 hover:text-primary font-bold text-sm uppercase transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
