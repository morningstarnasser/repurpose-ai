import { getPost } from "@/lib/blog";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // Simple markdown-to-HTML: headers, bold, lists, paragraphs
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const html = post.content
    .split("\n")
    .map((line) => {
      if (line.startsWith("### "))
        return `<h3 class="text-xl font-bold uppercase mt-8 mb-3">${esc(line.slice(4))}</h3>`;
      if (line.startsWith("## "))
        return `<h2 class="text-2xl font-bold uppercase mt-10 mb-4">${esc(line.slice(3))}</h2>`;
      if (line.startsWith("- "))
        return `<li class="ml-6 mb-1 list-disc">${esc(line.slice(2))}</li>`;
      if (line.trim() === "") return "<br/>";
      return `<p class="mb-4 leading-relaxed">${esc(line)}</p>`;
    })
    .join("")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold uppercase tracking-tight">
            Repurpose<span className="text-secondary">AI</span>
          </a>
          <a href="/blog" className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">
            &larr; All Posts
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="brutal-border px-2 py-0.5 text-xs font-bold uppercase bg-primary/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold uppercase leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm font-bold uppercase text-dark/40 mb-10">
          <span>{post.date}</span>
          <span>&bull;</span>
          <span>{post.readTime}</span>
          <span>&bull;</span>
          <span>By {post.author}</span>
        </div>

        {/* Content */}
        <article
          className="text-dark/80 font-medium text-base md:text-lg"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA */}
        <div className="brutal-card p-8 bg-primary mt-12 text-center">
          <h3 className="text-2xl font-bold uppercase mb-2">
            Ready to Repurpose?
          </h3>
          <p className="text-dark/70 font-medium mb-4">
            Turn this blog post into tweets, videos, and more with RepurposeAI.
          </p>
          <a href="/#pricing" className="brutal-btn inline-block px-6 py-3 bg-dark text-white">
            Try Free &rarr;
          </a>
        </div>
      </main>
    </div>
  );
}
