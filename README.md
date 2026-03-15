# RepurposeAI

AI-powered content repurposing SaaS — turn one piece of content into dozens. Built with **Neo-Brutalism** design.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Overview

RepurposeAI helps creators multiply their content output. Upload a podcast, blog post, or video — the AI transforms it into optimized content for every platform: tweets, LinkedIn posts, TikToks, YouTube Shorts, Instagram captions, and more.

**Live Demo:** [repurpose-ai.vercel.app](https://repurpose-ai.vercel.app)

---

## Design: Neo-Brutalism

This project uses a **Neo-Brutalism** design language — a modern take on brutalist web design characterized by:

| Element             | Implementation                                    |
| ------------------- | ------------------------------------------------- |
| **Borders**         | 3px solid black on all interactive elements       |
| **Shadows**         | Hard offset shadows (`4px 4px 0px #000`), no blur |
| **Colors**          | Bold, saturated palette (yellow, coral, turquoise) |
| **Typography**      | Space Grotesk, bold uppercase headings            |
| **Hover Effects**   | Shadow-shift (buttons "press in" on hover)        |
| **Background**      | Clean white/light gray, no gradients              |
| **Cards**           | Slight rotation, lift on hover                    |

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

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with `@theme` custom properties
- **Language:** TypeScript 5
- **Font:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- **Deployment:** [Vercel](https://vercel.com)

---

## Project Structure

```
repurpose-ai/
├── app/
│   ├── layout.tsx          # Root layout, metadata, fonts
│   ├── page.tsx            # Landing page (assembles all sections)
│   └── globals.css         # Tailwind config + Neo-Brutalism utilities
├── components/
│   ├── Navbar.tsx           # Sticky nav, mobile hamburger, scroll links
│   ├── Hero.tsx             # Main hero with CTA + stats
│   ├── Features.tsx         # 3 feature cards (Podcast→Social, Blog→Video, Export)
│   ├── HowItWorks.tsx       # 3-step process (Upload, AI Transform, Export)
│   ├── Pricing.tsx          # 2 pricing tiers (Free + Pro $19/mo)
│   ├── CTA.tsx              # Final call-to-action section
│   ├── Footer.tsx           # Links, socials, copyright
│   └── ScrollReveal.tsx     # Intersection Observer scroll animation wrapper
├── public/                  # Static assets
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Sections

### 1. Navbar
Fixed navigation bar with scroll-based background transition. Links scroll smoothly to sections. Includes animated hamburger menu on mobile.

### 2. Hero
Full-height hero with large uppercase heading, rotating "AI" badge, two CTA buttons (scroll to pricing / how it works), and three stat cards.

### 3. Features
3-column grid of feature cards with slight rotation. Each card has a colored icon box and lifts on hover. Cards animate in with staggered scroll reveal.

### 4. How It Works
3-step process with numbered badges, connector line on desktop, and icons. Scroll-animated appearance.

### 5. Pricing
Two-tier pricing: Free ($0) and Pro ($19/mo). Pro card is elevated and has a "Most Popular" badge. Feature lists with checkmark icons.

### 6. CTA
Dark background call-to-action section with trust signals (no credit card, cancel anytime). Final conversion push before footer.

### 7. Footer
4-column link grid (Product, Resources, Company, Legal), brand logo, and social links.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/morningstarnasser/repurpose-ai.git
cd repurpose-ai
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo in [Vercel Dashboard](https://vercel.com/new)
3. Deploy — zero config needed

Or via CLI:

```bash
npx vercel --prod
```

### Environment Variables

No environment variables required for the landing page.

---

## Customization

### Colors
Edit the `@theme` block in `app/globals.css`:

```css
@theme {
  --color-primary: #FFD700;
  --color-secondary: #FF6B6B;
  --color-accent: #4ECDC4;
  /* ... */
}
```

### Content
All section content (features, pricing tiers, steps) is defined as arrays at the top of each component file. Edit the arrays directly.

### Animations
Scroll animations use the `<ScrollReveal>` component wrapping any element. Adjust threshold and delay in `components/ScrollReveal.tsx`.

---

## Performance

- Static site generation (SSG) — all pages pre-rendered at build time
- Turbopack for fast development builds
- Google Fonts with `preconnect` for fast font loading
- No JavaScript frameworks beyond React (no animation libraries)
- Scroll animations use native `IntersectionObserver`

---

## License

MIT
