import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export { sql };

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      plan TEXT DEFAULT 'free',
      repurpose_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS repurposes (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email),
      title TEXT NOT NULL,
      original_content TEXT NOT NULL,
      content_type TEXT DEFAULT 'text',
      outputs JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_repurposes_user ON repurposes(user_email)`;

  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      author TEXT DEFAULT 'RepurposeAI',
      date TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]',
      read_time TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}
