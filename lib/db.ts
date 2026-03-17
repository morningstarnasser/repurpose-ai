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

  // Profile & Settings
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'`;
  // Stripe
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'`;
  // Favorites
  await sql`ALTER TABLE repurposes ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT false`;
  // Tone
  await sql`ALTER TABLE repurposes ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'professional'`;

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

  // Voice Samples (Feature: Keep Your Voice)
  await sql`
    CREATE TABLE IF NOT EXISTS voice_samples (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email),
      content TEXT NOT NULL,
      label TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_voice_samples_user ON voice_samples(user_email)`;

  // Image generation count for free-tier limit
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS image_count INT DEFAULT 0`;
}
