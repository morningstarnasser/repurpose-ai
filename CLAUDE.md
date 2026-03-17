# RepurposeAI - Claude Code Instructions

## Project Overview
AI-powered SaaS that repurposes content for 10 social media platforms. Neo-Brutalism design, Next.js 16 App Router.

## Key Commands
- `npm run dev` — Start dev server (Turbopack, port 3000)
- `npm run build` — Production build (must pass before deploy)
- `git push origin master` — Auto-deploys to Vercel

## Architecture
- **Server Components** for data-fetching pages (`dashboard/page.tsx`)
- **Client Components** for interactive UI (`DashboardClient.tsx`, `new/page.tsx`, `[id]/page.tsx`)
- **DashboardNav** (server) for the main dashboard nav with sign-out
- **SubNav** (shared) for sub-pages with logo + back link
- **Toast** system via React Context (`ToastProvider` + `useToast`)

## Database (Neon Postgres)
- Schema migrations in `lib/db.ts` → `initDB()`
- Tables: `users`, `repurposes`, `blog_posts`
- Users have: `preferences` (JSONB), `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`
- Repurposes have: `favorite` (bool), `tone` (text), `outputs` (JSONB array)

## AI Generation
- Primary: NVIDIA NIM (Kimi K2) via `callNvidia()`
- Fallback: DeepSeek via `callDeepSeek()`
- `generateOutputs()` accepts `tone` and `platforms` parameters
- `regenerateSingleOutput()` for per-platform regeneration
- Fallback outputs are hardcoded for all 10 platforms

## Stripe Integration
- Lazy-initialized in `lib/stripe.ts` (uses `getStripe()` to avoid build-time errors)
- Checkout → webhook → plan upgrade flow
- Webhook events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
- Portal session for subscription management

## 10 Platforms
Twitter/X, LinkedIn, Instagram, TikTok, Email, YouTube, Reddit, Threads, Blog Post, Carousel

## 5 Tones
Professional, Casual, Funny, Inspirational, Technical

## Important Patterns
- All API routes check `auth()` for session
- Admin routes check `isAdmin(email)` (ADMIN_EMAIL env var)
- Stripe webhook uses raw body + signature verification
- Profile image upload is base64, max 100KB
- CSV export via `/api/repurpose/export`
- Cron job at `/api/cron/reset-usage` protected by `CRON_SECRET` Bearer token

## Env Vars Required
AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, DATABASE_URL, NVIDIA_NIM_API_KEY, DEEPSEEK_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, RESEND_API_KEY, CRON_SECRET, ADMIN_EMAIL

## Design System
- Neo-Brutalism: `.brutal-card`, `.brutal-btn`, `.brutal-border`
- Colors: primary (#FFD700), secondary (#FF6B6B), accent (#4ECDC4), lime (#A8E6CF), lavender (#C3B1E1)
- Font: Space Grotesk
- All in `app/globals.css` via Tailwind `@theme`
