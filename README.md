# RepurposeAI

AI-powered content repurposing SaaS — turn one piece of content into optimized posts for 10 platforms. Built with **Neo-Brutalism** design.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=flat-square&logo=stripe)

---

## Overview

RepurposeAI helps creators multiply their content output. Upload a podcast, blog post, video, or PDF — the AI transforms it into optimized content for every platform: Twitter/X threads, LinkedIn posts, Instagram captions, TikTok scripts, YouTube Shorts, Reddit posts, Threads, blog articles, email newsletters, and carousel slides.

**Live:** [repurpose-ai-nine.vercel.app](https://repurpose-ai-nine.vercel.app)

---

## Features

- **10 Platform Outputs** — Twitter/X, LinkedIn, Instagram, TikTok, Email, YouTube, Reddit, Threads, Blog Post, Carousel
- **Multi-Input** — Paste text, import URL, upload audio/video/PDF with automatic transcription
- **5 Tone Modes** — Professional, Casual, Funny, Inspirational, Technical
- **Platform Selector** — Choose which platforms to generate for
- **Inline Editing** — Edit any output directly, or regenerate individual platforms with different tones
- **Favorites & Search** — Star repurposes, search/filter your library, bulk CSV export
- **Stripe Payments** — Pro plan ($19/mo) with checkout, webhooks, and customer portal
- **Profile & Settings** — Avatar upload, name editing, notification preferences, default tone
- **Admin Panel** — User management, content moderation, billing stats, platform analytics
- **Welcome Email** — Automated welcome via Resend on first signup
- **Monthly Usage Reset** — Vercel cron resets free-tier usage on the 1st of each month
- **Blog** — AI-generated SEO blog posts via Kimi K2 / DeepSeek

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) with `@theme` |
| Language | TypeScript 5 |
| Database | [Neon](https://neon.tech/) (Serverless Postgres) |
| Auth | [NextAuth v5](https://authjs.dev/) (Google + Apple OAuth) |
| Payments | [Stripe](https://stripe.com/) (Checkout, Webhooks, Portal) |
| AI | NVIDIA NIM (Kimi K2) + DeepSeek (fallback) |
| Email | [Resend](https://resend.com/) |
| Deployment | [Vercel](https://vercel.com/) |
| Design | Neo-Brutalism (Space Grotesk, thick borders, hard shadows) |

---

## Project Structure

```
Repurpose/
├── app/
│   ├── page.tsx                    # Landing (Hero, Features, HowItWorks, Pricing, Testimonials, FAQ, CTA)
│   ├── globals.css                 # Tailwind @theme + Neo-Brutalism utilities
│   ├── layout.tsx                  # Root layout, metadata, fonts
│   ├── login/page.tsx              # Auth login page
│   ├── admin/page.tsx              # Admin panel (Stats, Users, Repurposes, Blog, Billing, Analytics)
│   ├── blog/                       # Blog listing + [slug] detail
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard (library, favorites, search, export)
│   │   ├── DashboardClient.tsx     # Client-side dashboard logic
│   │   ├── new/page.tsx            # New repurpose (input, tone, platform selector)
│   │   ├── [id]/page.tsx           # Detail view (outputs, edit, regenerate, copy)
│   │   └── profile/page.tsx        # Profile settings (avatar, name, tone, notifications)
│   └── api/
│       ├── repurpose/              # CRUD + regenerate + export
│       ├── stripe/                 # checkout, webhook, portal
│       ├── user/profile/           # GET/PUT/DELETE profile
│       ├── admin/                  # Admin API
│       ├── cron/reset-usage/       # Monthly usage reset
│       ├── extract/                # URL/file content extraction
│       ├── blog/                   # Blog CRUD + AI generation
│       └── auth/[...nextauth]/     # NextAuth handlers
├── components/
│   ├── DashboardNav.tsx            # Shared dashboard navigation (server)
│   ├── SubNav.tsx                  # Sub-page navigation (logo + back link)
│   ├── Toast.tsx                   # Toast notification system (context-based)
│   ├── Navbar.tsx                  # Landing page navbar
│   ├── Hero.tsx, Features.tsx, HowItWorks.tsx
│   ├── Pricing.tsx                 # Pricing with Stripe checkout integration
│   ├── Testimonials.tsx            # Testimonial cards
│   ├── FAQ.tsx                     # Accordion FAQ
│   ├── CTA.tsx, Footer.tsx
│   └── ScrollReveal.tsx            # Intersection Observer animation wrapper
├── lib/
│   ├── db.ts                       # Neon DB connection + schema migrations
│   ├── repurpose.ts                # Core logic (generate, CRUD, profiles, favorites)
│   ├── auth.ts                     # NextAuth config (Google + Apple)
│   ├── stripe.ts                   # Stripe helpers (lazy init)
│   ├── admin.ts                    # Admin queries (stats, billing, analytics)
│   ├── email.ts                    # Resend welcome email
│   └── blog.ts                     # Blog post queries
├── middleware.ts                    # Auth middleware for /dashboard/*
├── vercel.json                     # Cron config (monthly usage reset)
└── package.json
```

---

## Environment Variables

```env
# Auth
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_APPLE_ID=...              # optional
APPLE_TEAM_ID=...              # optional
APPLE_KEY_ID=...               # optional
APPLE_PRIVATE_KEY=...          # optional

# Database
DATABASE_URL=postgresql://...

# AI
NVIDIA_NIM_API_KEY=...
DEEPSEEK_API_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...

# Blog
BLOG_API_SECRET=...

# Cron
CRON_SECRET=...

# Admin
ADMIN_EMAIL=...
```

---

## Getting Started

```bash
git clone https://github.com/morningstarnasser/repurpose-ai.git
cd repurpose-ai
npm install
cp .env.example .env.local  # fill in your env vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Design: Neo-Brutalism

| Element | Implementation |
|---------|---------------|
| Borders | 3px solid black on all interactive elements |
| Shadows | Hard offset (`4px 4px 0px #000`), no blur |
| Colors | Bold saturated palette (yellow, coral, turquoise) |
| Typography | Space Grotesk, bold uppercase headings |
| Hover | Shadow-shift (buttons "press in") |
| Cards | Slight rotation, lift on hover |

### Color Palette

```
Primary     #FFD700  ██  Yellow / Gold
Secondary   #FF6B6B  ██  Coral / Pink
Accent      #4ECDC4  ██  Turquoise
Dark        #1A1A2E  ██  Near-black
Lime        #A8E6CF  ██  Soft green
Lavender    #C3B1E1  ██  Soft purple
Background  #FAFAFA  ██  Off-white
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/repurpose` | Create new repurpose |
| GET | `/api/repurpose` | List user's repurposes |
| GET | `/api/repurpose/[id]` | Get single repurpose |
| PUT | `/api/repurpose/[id]` | Edit output content |
| PATCH | `/api/repurpose/[id]` | Toggle favorite |
| POST | `/api/repurpose/[id]/regenerate` | Regenerate single output |
| GET | `/api/repurpose/export` | Export all as CSV |
| GET/PUT/DELETE | `/api/user/profile` | Profile CRUD |
| POST | `/api/stripe/checkout` | Create Stripe checkout |
| POST | `/api/stripe/webhook` | Stripe webhook handler |
| POST | `/api/stripe/portal` | Stripe billing portal |
| GET | `/api/cron/reset-usage` | Monthly usage reset |
| GET/POST | `/api/admin` | Admin operations |

---

## License

MIT
