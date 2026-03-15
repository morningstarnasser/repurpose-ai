import { getAllPosts } from "@/lib/blog";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold uppercase tracking-tight">
            Repurpose<span className="text-secondary">AI</span>
          </a>
          <a href="/" className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">
            &larr; Home
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block brutal-card px-4 py-2 mb-4 bg-lavender rotate-[-1deg]">
            <span className="text-sm font-bold uppercase tracking-wider">
              Blog
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase">
            Content <span className="text-secondary">Insights</span>
          </h1>
          <p className="text-lg text-dark/60 font-medium mt-4 max-w-2xl mx-auto">
            Tips, strategies, and guides on content repurposing, AI-powered marketing, and growing your audience.
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="brutal-card p-12 bg-white text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="font-bold text-lg mb-2">No posts yet</p>
            <p className="text-dark/60 font-medium text-sm">
              New blog posts are published daily. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="brutal-card p-6 md:p-8 bg-white hover:bg-lime/20">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="brutal-border px-2 py-0.5 text-xs font-bold uppercase bg-primary/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold uppercase mb-2">
                    {post.title}
                  </h2>
                  <p className="text-dark/60 font-medium text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold uppercase text-dark/40">
                    <span>{post.date}</span>
                    <span>&bull;</span>
                    <span>{post.readTime}</span>
                    <span>&bull;</span>
                    <span>{post.author}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
