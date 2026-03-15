import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, savePost } from "@/lib/blog";

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json(posts);
}

// POST - Create new blog post (n8n webhook / API)
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-secret");
  if (secret !== process.env.BLOG_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, excerpt, tags, author } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content required" },
      { status: 400 }
    );
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const wordCount = content.split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const post = {
    slug,
    title,
    excerpt: excerpt || content.slice(0, 160) + "...",
    content,
    author: author || "RepurposeAI",
    date: new Date().toISOString().split("T")[0],
    tags: tags || ["content-marketing", "ai"],
    readTime,
  };

  await savePost(post);

  return NextResponse.json({ success: true, slug }, { status: 201 });
}
