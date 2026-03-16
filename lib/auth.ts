import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { upsertUser } from "./repurpose";
import { sendWelcomeEmail } from "./email";
import { sql } from "./db";

function generateAppleSecret(): string {
  try {
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    const clientId = process.env.AUTH_APPLE_ID;
    const privateKey = process.env.APPLE_PRIVATE_KEY;

    if (!teamId || !keyId || !clientId || !privateKey) return "";

    // Node.js crypto - not available in Edge Runtime (middleware)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPrivateKey, sign } = require("crypto");

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24 * 150; // 5 months

    const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      iss: teamId,
      iat: now,
      exp,
      aud: "https://appleid.apple.com",
      sub: clientId,
    })).toString("base64url");

    const key = createPrivateKey({ key: privateKey.replace(/\\n/g, "\n"), format: "pem" });
    const signature = sign("sha256", Buffer.from(`${header}.${payload}`), { key, dsaEncoding: "ieee-p1363" });

    return `${header}.${payload}.${signature.toString("base64url")}`;
  } catch {
    // Edge Runtime (middleware) can't use Node.js crypto - Apple provider skipped
    return "";
  }
}

const appleSecret = generateAppleSecret();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
    ...(appleSecret
      ? [Apple({
          clientId: process.env.AUTH_APPLE_ID!,
          clientSecret: appleSecret,
        })]
      : []),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
    async signIn({ user }) {
      if (user.email) {
        try {
          const existing = await sql`SELECT email FROM users WHERE email = ${user.email}`;
          const isNewUser = existing.length === 0;
          await upsertUser(user.email, user.name || "", user.image || "");
          if (isNewUser) {
            sendWelcomeEmail(user.email, user.name || "").catch(() => {});
          }
        } catch {}
      }
      return true;
    },
  },
});
