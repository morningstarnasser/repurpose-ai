import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: false,
  max: 10,
});

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
  await sql`CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN (preferences)`;
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

  // Webhook URL for Business plan integrations
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS webhook_url TEXT`;

  // Email OTP verification codes
  await sql`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email)`;

  // Passkeys (WebAuthn)
  await sql`
    CREATE TABLE IF NOT EXISTS passkeys (
      credential_id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      public_key TEXT NOT NULL,
      counter BIGINT NOT NULL DEFAULT 0,
      device_type TEXT,
      backed_up BOOLEAN DEFAULT false,
      transports TEXT,
      name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_passkeys_user ON passkeys(user_email)`;

  // WebAuthn challenges (temporary, single-use)
  await sql`
    CREATE TABLE IF NOT EXISTS webauthn_challenges (
      id SERIAL PRIMARY KEY,
      challenge TEXT NOT NULL,
      email TEXT,
      type TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`DELETE FROM webauthn_challenges WHERE expires_at < NOW()`;
}
