# 8Rupia — AI Exam Prep for ₹8

Next.js 15 + TypeScript + Tailwind + shadcn/ui + Framer Motion landing scaffold for **8rupia.in**.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill values when you wire AI/Razorpay
npm run dev                  # http://localhost:3000
```

## What's in this scaffold (phase 1)

- Animated, glassmorphic, dark-by-default landing page with particle background
- Mobile-first navbar with theme toggle, sticky glass header
- Hero with animated counters and 3 CTAs (Start Free Test / AI Prediction Test / Analyze My Weakness)
- Exam grid (CTET, SSC, Railway, Banking, CUET, Class 10, NIIT, Police, Teacher, State)
- 9-card Features section (AI Mock Engine, PDF→MCQ, Predicted Sets, Weakness Analyzer, etc.)
- Per-exam SEO-friendly dynamic pages `/exams/[slug]` with breadcrumb + Article schema
- Pricing, Blog index, About, Contact, Privacy, Terms, Disclaimer pages
- `sitemap.xml`, `robots.txt`, PWA manifest, JSON-LD Organization + FAQ schema
- AdSense-safe copy throughout — no leak claims, with explicit Disclaimer

## Backend (phase 2 — shipped)

```bash
npm install
npm run infra:up          # starts Postgres + Redis via docker compose
cp .env.example .env.local && edit it
npx prisma generate
npm run db:push           # create schema
npm run db:seed           # seed exams + sample/premium test sets
npm run dev               # API + frontend
npm run workers           # in a second terminal — BullMQ workers
```

Backend includes:
- **Prisma schema** (`prisma/schema.prisma`): User, Exam, Subject, Chapter, Question, TestSet, TestSetQuestion, Attempt, Answer, Payment, Unlock, Subscription, Pdf, AiJob, Doubt
- **Auth**: JWT (jose) + bcrypt, httpOnly cookie session
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET/DELETE /api/auth/me`
- **Mock test engine**:
  - `POST /api/attempts/start` (gates premium tests behind Unlock)
  - `POST /api/attempts/submit` (scores, builds subject + chapter stats, awards XP)
  - `GET  /api/attempts/[id]`
- **Razorpay ₹8 unlock**:
  - `POST /api/payments/create-order`, `POST /api/payments/verify` (HMAC SHA-256 signature)
  - `POST /api/payments/webhook` (`payment.captured` / `payment.failed`)
- **AI (Anthropic Claude)**: `lib/ai/claude.ts` + safety-first prompts
  - `POST /api/ai/doubt` — step-by-step explainer (Hindi/English)
  - `POST /api/ai/weakness` — personalized weakness report from a submitted attempt
  - `POST /api/ai/predict` — queued; `GET /api/ai/predict?jobId=...` polls
- **Admin**:
  - `POST /api/admin/pdfs/upload` — registers PDF + enqueues ingestion
  - `POST /api/admin/questions/approve` — approve/reject AI-generated questions
- **Workers** (`workers/index.ts`): BullMQ workers for PDF→MCQ and predicted-set generation
- **Rate limiting**: Redis token bucket (`lib/ratelimit.ts`)
- **Health**: `GET /api/health` checks Postgres + Redis

### Safety / AdSense posture
Prompts include a hard rule: no claim of paper leaks, no verbatim copy of copyrighted material, all "predicted" sets are explicitly educational study aids. Reinforces the `/disclaimer` page.

## Not yet built

- Razorpay client-side checkout component
- Test runner UI (question navigator, timer, submit screen)
- Student dashboard + analytics charts
- Admin UI screens
- i18n (Hindi/English copy toggle)
- Object storage for PDF uploads (current `storagePath` assumes local path or pre-signed URL workflow)

Tell me which to ship next.

## Stack notes

- Next.js 15 App Router + RSC
- Tailwind + custom design tokens (`app/globals.css`)
- `next-themes` for dark/light
- `framer-motion` for entrance + counter animations
- Canvas particle background (no heavy lib)
- shadcn-style primitives in `components/ui/`

## Domain

Production domain: **8rupia.in** (set in `lib/utils.ts:SITE`).
