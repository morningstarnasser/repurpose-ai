import fs from "fs/promises";
import path from "path";

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

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    await fs.mkdir(BLOG_DIR, { recursive: true });
    const files = await fs.readdir(BLOG_DIR);
    const posts: BlogPost[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await fs.readFile(path.join(BLOG_DIR, file), "utf-8");
      posts.push(JSON.parse(raw));
    }

    return posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const raw = await fs.readFile(
      path.join(BLOG_DIR, `${slug}.json`),
      "utf-8"
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function savePost(post: BlogPost): Promise<void> {
  await fs.mkdir(BLOG_DIR, { recursive: true });
  await fs.writeFile(
    path.join(BLOG_DIR, `${post.slug}.json`),
    JSON.stringify(post, null, 2)
  );
}
