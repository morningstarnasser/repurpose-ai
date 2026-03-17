import { sql } from "./db";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  readTime: string;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const rows = await sql`SELECT * FROM blog_posts ORDER BY date DESC, created_at DESC`;
  return rows.map(mapRow);
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug}`;
  if (!rows.length) return null;
  return mapRow(rows[0]);
}

export async function savePost(post: BlogPost): Promise<void> {
  await sql`INSERT INTO blog_posts (slug, title, excerpt, content, author, date, tags, read_time)
    VALUES (${post.slug}, ${post.title}, ${post.excerpt}, ${post.content}, ${post.author}, ${post.date}, ${JSON.stringify(post.tags)}, ${post.readTime})
    ON CONFLICT (slug) DO UPDATE SET title = ${post.title}, excerpt = ${post.excerpt}, content = ${post.content}, tags = ${JSON.stringify(post.tags)}, read_time = ${post.readTime}`;
}

export async function deleteOldPosts(keepDays: number = 30): Promise<number> {
  const cutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const result = await sql`DELETE FROM blog_posts WHERE date < ${cutoff}`;
  return result.length ?? 0;
}

function mapRow(r: Record<string, unknown>): BlogPost {
  return {
    slug: r.slug as string,
    title: r.title as string,
    excerpt: (r.excerpt as string) || "",
    content: r.content as string,
    author: (r.author as string) || "RepurposeAI",
    date: r.date as string,
    tags: typeof r.tags === "string" ? JSON.parse(r.tags) : (r.tags as string[]),
    readTime: (r.read_time as string) || "3 min read",
  };
}
