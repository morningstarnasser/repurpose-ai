# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered SaaS that repurposes content for 10 social media platforms. Neo-Brutalism design, Next.js 16 App Router, deployed on Vercel.

## Commands

- `npm run dev` — Dev server (Turbopack, port 3000)
- `npm run build` — Production build (must pass before deploy)
- `npm run lint` — ESLint check
- `git push origin master` — Auto-deploys to Vercel
- Post-deploy: `POST /api/setup` with `x-api-secret` header to run DB migrations

## Architecture

### App Router Structure

```
/                          Landing page (server component, imports landing components)
/login                     LoginForm (email OTP + Google + Apple OAuth)
/dashboard                 Server component → DashboardClient (repurpose list)
/dashboard/new             Create repurpose (text/URL/file/YouTube/audio/PDF input)
/dashboard/[id]            View/edit single repurpose outputs
/dashboard/profile         User settings, voice learning, webhook config
/admin                     Admin dashboard (restricted to ADMIN_EMAIL)
/blog                      Blog listing
/blog/[slug]               Single blog post
/privacy, /terms           Legal pages
```

### API Routes

```
/api/repurpose             CRUD + CSV export (/export)
/api/repurpose/[id]        GET/POST/DELETE single repurpose
/api/repurpose/[id]/regenerate   Per-platform regeneration (Starter+ plan)
/api/image                 AI image generation (SD3 → Gemini → Imagen fallback)
/api/extract               Content extraction (YouTube, URL, file, PDF, audio)
/api/voice                 Voice samples CRUD (Pro+ plan)
/api/auth/[...nextauth]    NextAuth handlers
/api/auth/send-code        Email OTP (6-digit code, 10-min expiry)
/api/stripe/checkout       Create Stripe checkout
/api/stripe/portal         Billing portal redirect
/api/stripe/webhook        Stripe event webhook (raw body + signature)
/api/blog/generate         Auto-generate blog post (protected by BLOG_API_SECRET)
/api/blog                  List blog posts
/api/cron/blog             Daily blog generation cron
/api/cron/reset-usage      Monthly usage reset (CRON_SECRET Bearer token)
/api/admin                 Admin stats/actions
/api/setup                 DB init + optional blog seeding (?seed=true)
/api/user/profile          User profile GET/POST
/api/user/webhook          Webhook URL GET/POST
/api/newsletter/unsubscribe   HMAC-SHA256 token-based unsubscribe
```

### Core Lib Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth v5 beta config (Google + Apple + Email OTP credentials) |
| `lib/db.ts` | Neon Postgres connection, `initDB()` schema migrations |
| `lib/repurpose.ts` | AI generation engine: `generateOutputs()`, `regenerateSingleOutput()`, voice learning, webhooks |
| `lib/plans.ts` | Plan configs, limits, price ID mapping: `getPlanConfig()`, `isPaidPlan()` |
| `lib/stripe.ts` | Lazy-initialized Stripe: `createCheckoutSession()`, `createPortalSession()` |
| `lib/email.ts` | Nodemailer (Hostpoint SMTP): OTP codes, welcome emails, blog newsletters |
| `lib/blog.ts` | Blog CRUD: `getAllPosts()`, `getPost()`, `savePost()` |
| `lib/admin.ts` | Admin: stats, user management, billing, analytics |

### Auth Flow

- **Middleware** (`middleware.ts`): Only protects `/dashboard/:path*` via NextAuth `auth()`
- **3 providers**: Google OAuth, Apple OAuth (optional), Email OTP (Credentials)
- **Email OTP**: send-code → `verification_codes` table (10-min expiry) → Credentials provider validates
- **Session**: JWT strategy, `AUTH_SECRET` env var
- **Admin check**: `isAdmin(email)` against `ADMIN_EMAIL` env var + hardcoded fallback

### AI Provider Chains (with fallbacks)

- **Repurposing**: NVIDIA NIM (Kimi K2) → DeepSeek → hardcoded fallback outputs
- **Image generation**: SD3 → Gemini 2.5 Flash → Imagen 4
- **Audio transcription**: NVIDIA Parakeet ASR → Gemini 2.0 Flash
- **Blog generation**: NVIDIA NIM (Kimi K2) → DeepSeek
- AI calls: `callNvidia()` and `callDeepSeek()` in `lib/repurpose.ts`

### Database (Neon Postgres)

Tables: `users`, `repurposes`, `blog_posts`, `voice_samples`, `verification_codes`

- Users: plan (free/starter/pro/business), `repurpose_count`, `image_count`, `preferences` (JSONB), Stripe fields, `webhook_url`
- Repurposes: `outputs` (JSONB array of `OutputItem[]`), `favorite`, `tone`
- Schema managed via `initDB()` in `lib/db.ts` (no migration tool, raw SQL)

### Pricing Plans

| Plan | Price | Repurposes/mo | Images/mo | Voice | Regen | File Import |
|------|-------|---------------|-----------|-------|-------|-------------|
| Free | $0 | 5 | 3 | 0 | - | - |
| Starter | $9 | 30 | 15 | 0 | yes | - |
| Pro | $19 | unlimited | unlimited | 5 | yes | yes |
| Business | $49 | unlimited | unlimited | 10 | yes | yes |

Config centralized in `lib/plans.ts` (`PlanConfig` type, `PLAN_CONFIGS` map).

### Component Patterns

- **Server Components**: Data-fetching pages (`dashboard/page.tsx`, `admin/page.tsx`)
- **Client Components**: Interactive UI (`DashboardClient.tsx`, `LoginForm.tsx`, `new/page.tsx`, `[id]/page.tsx`, `profile/page.tsx`)
- **Navigation**: `DashboardNav` (server, top bar with plan badge + sign-out), `SubNav` (shared, logo + back link)
- **Toast**: React Context system (`ToastProvider` + `useToast` hook, auto-dismiss 3s)
- **Landing**: Separate components per section (`Hero`, `Features`, `Pricing`, `HowItWorks`, `Demo`, `FAQ`, etc.)

### Design System

- **Style**: Neo-Brutalism (`.brutal-card`, `.brutal-btn`, `.brutal-border`)
- **Colors** (Tailwind `@theme` in `globals.css`): primary `#FFD700`, secondary `#FF6B6B`, accent `#4ECDC4`, lime `#A8E6CF`, lavender `#C3B1E1`
- **Font**: Space Grotesk (Google Fonts)
- **Borders**: 3px solid black, hard shadows (`4px 4px 0px`)
- **Animations**: marquee, slideIn, fadeIn, reveal (in `globals.css`)

### Stripe Integration

- Lazy-initialized via `getStripe()` to avoid build-time errors
- Checkout maps `plan` param → env price IDs (`STRIPE_STARTER_PRICE_ID`, etc.)
- Webhook events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
- Portal session for subscription management

### PWA & Service Worker

- `public/manifest.json`: standalone display, `/dashboard` start URL
- `public/sw.js`: network-first for navigation, stale-while-revalidate for assets, skip API/auth/Sentry
- Icons: 192x192, 512x512, 512x512 maskable, apple-touch-icon 180x180

### Sentry

- `next.config.ts` wrapped with `withSentryConfig()`
- Tunnel route: `/monitoring` (bypasses ad-blockers)
- Config: `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`

## Env Vars Required

```
AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, DATABASE_URL,
NVIDIA_NIM_API_KEY, DEEPSEEK_API_KEY, GEMINI_API_KEY, GOOGLE_API_KEY,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_STARTER_PRICE_ID, STRIPE_PRO_PRICE_ID, STRIPE_BUSINESS_PRICE_ID,
SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM,
CRON_SECRET, ADMIN_EMAIL, BLOG_API_SECRET,
SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN
```

Optional: `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, `AUTH_URL`
