# 8Rupia — Website Info (Hindi/Hinglish)

## Website ka Naam aur Tagline
**8Rupia** — *AI Exam Prep for ₹8*
*“AI Se Banega Selection”* — sirf **8 rupaye** mein AI-powered mock tests, predicted question sets,
weakness analysis, live classes aur Golu AI mentor. NEET, JEE, SSC, Railway, Banking, CUET, CTET,
UPSC, State exams, Class 10/12 Boards, Police, Teacher exams — sab cover.

---

## Website ka Kaam Kya Hai? (Purpose)
India ka **AI-powered futuristic exam preparation ecosystem** — PW + Netflix + Duolingo + ChatGPT
ki feel ek single ultra-premium app mein:

1. **PDF → MCQ AI pipeline** — admin PDF upload kare, AI MCQs generate karta hai (BullMQ queue)
2. **AI Predicted Test Sets** — sambhavit prashn, trend-based (educational only, no leak claims)
3. **Real Mock Test Engine** — exam-grade timer, anti-distraction, rank prediction
4. **AI Weakness Radar** — subject heatmap, accuracy aur time-management analytics
5. **AI Doubt Solver** — text/voice/image, Hindi+English, step-by-step
6. **Selection Probability Meter** — real attempts se data-driven probability
7. **Battle Arena** — 10-Q duel vs AI bot, XP award
8. **SRS Smart Revision** — SM-2 spaced repetition flashcards
9. **Daily Practice Problems (DPP)** — deterministic 10-Q per (exam, date)
10. **Golu AI mentor** — voice chat, motivation, burnout detection
11. **Community, Teachers, Centers, Store, Achievements, NCERT, PYQ, Notes** — full ecosystem
12. **₹8 unlock** Razorpay-backed; Pro + Family plans available

---

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Next.js API routes (Node 22), Prisma ORM
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ (background AI jobs)
- **AI providers**: OpenAI-SDK compatible chain (Anthropic Claude, Groq, OpenRouter, Together, Mistral, DeepSeek, HuggingFace) — fallback chain configurable per-operation
- **Payments**: Razorpay (₹8 unlock + plan subscriptions + webhook)
- **Auth**: JWT (jose) + bcrypt, httpOnly cookies, Email OTP
- **PWA**: Service Worker (push + offline fallback), install prompt, manifest
- **Push notifications**: `web-push` + VAPID keys, admin broadcast UI
- **Voice**: Web Speech API (STT) + SpeechSynthesis (TTS) for `/voice-tutor`
- **i18n**: Hindi / English toggle
- **Deployment**: Hostinger VPS (187.127.148.237), systemd + nginx

---

## Design System (light + dark)
- **Light mode** = clean **navy + white** (PW-style readability)
  - Buttons: solid navy `#1e3a8a` + white text
  - Headlines accent: solid navy (`.ai-gradient-text` collapses to navy)
  - Cards: solid white with subtle shadow (`.neon-card`)
  - Chips: indigo-50 bg + navy text (`.ai-chip`)
- **Dark mode** = neon futuristic
  - Gradient buttons (indigo → purple → pink) with glow
  - Neon gradient text + glass cards
  - Animated holographic borders
- **Hero**: animated AI brain SVG bg + student photo in glowing ring + AIR ranks marquee + demo video modal + typing AI assistant
- **Primitives**: `<ProgressRing>`, `<Magnetic>` (mouse-tilt 3D), `<LiquidGradient>` SVG morph
- **Theme**: dark mode preserved via `.dark` selector overrides

---

## Saare User-Facing Features (Pages)

### Public / Landing
- **`/`** — Cinematic hero (AI brain bg + student photo hologram + typewriter + live counters + AIR ticker + demo modal), exam grid, features, scholarship countdown, batch launch cards, live classes, Golu AI section, AI control center, gamification, selection showcase, how-it-works, subject row, YouTube section, app download, pricing, push opt-in card
- **`/about`** — About page
- **`/contact`** — Contact form
- **`/blog`** — Blog index
- **`/disclaimer`** — Legal disclaimer (no leak claims, AdSense-safe)
- **`/privacy`** — Privacy policy
- **`/terms`** — Terms of Service
- **`/exams`** — All exams catalogue
- **`/exams/[slug]`** — Per-exam SEO landing (CTET, SSC, NEET, JEE, etc.) with Article schema
- **`/offline`** — PWA offline fallback

### Authentication
- **`/signin`**, **`/signup`** — Login / register (Email OTP)
- **`/forgot-password`**, **`/reset-password`** — Password reset flow
- **`/verify-email`** — Email OTP verification

### Student Dashboard / Learning
- **`/home`** — Logged-in feed (focus subjects, daily missions, attempt history)
- **`/dashboard`** — Stats overview
- **`/onboarding`** — Exam track + language selection
- **`/test/[slug]`** — Mock test runner (timer, navigator, submit)
- **`/test-config/[examSlug]`** — Custom mock builder
- **`/attempt/[id]`** — Attempt result + step-by-step AI explanations
- **`/predict`** — AI predicted question sets
- **`/predict-2026`** — 2026 exam predictions
- **`/progress`** — XP, attempts history, scores
- **`/radar`** — Subject-wise radar chart (strengths/weaknesses)
- **`/pyq`** — Previous Year Questions
- **`/notes`** — AI study notes (topic → summary + key points + mnemonics)
- **`/flashcards`** — Flashcard deck
- **`/doubt`** — AI doubt solver (text/voice/image)
- **`/wallet`** — Wallet balance + ₹8 unlocks
- **`/refer`** — Referral program
- **`/library`**, **`/library/[pdfId]`** — PDF library + reader
- **`/bookmarks`** — Saved items
- **`/leaderboard`** — Global XP leaderboard
- **`/current-affairs`** — Daily current affairs quiz
- **`/settings`** — Account settings

### NEW — Advanced AI features
- **`/battle`** — Battle Arena (1v1 quiz duel vs AI bot, 10Q × 60s, XP award)
- **`/probability`** — Selection Probability Meter (AI computed from real attempts)
- **`/career`** — AI Career Predictor (3 careers + exams + 12-month roadmap)
- **`/revise`** — SRS Smart Revision (SM-2 spaced repetition)
- **`/dpp`** — Daily Practice Problems (deterministic 10 questions/day)
- **`/voice-tutor`** — Hands-free AI tutor (Web Speech API)
- **`/summaries`** — Paste notes → AI summary + formulas + 5-MCQ quiz
- **`/motivation`** — Mood + burnout detector + AI pep talk
- **`/ncert`** — NCERT Solutions (Class 10/12 chapter grid, deep link to AI doubt)
- **`/store`** — Books & study material catalogue
- **`/community`** — Study rooms + topper feed
- **`/teachers`** — Faculty brand pages (8 educators)
- **`/achievements`** — UserBadge gallery (12 badges + earned/locked filter)
- **`/centers`** — Offline study centers across India
- **`/planner`** — AI study planner

### Admin Panel (`/admin/...`)
- **`/admin`** — Home (KPI tiles + nav)
- **`/admin/users`** — User management
- **`/admin/exams`** — Exam management
- **`/admin/subjects`** — Subject + chapter management
- **`/admin/questions`** — Approve/reject AI-generated questions
- **`/admin/testsets`** — Test set management
- **`/admin/pdfs`** — Upload PDF → AI ingestion queue
- **`/admin/jobs`** — BullMQ background job monitor
- **`/admin/payments`** — Payment records
- **`/admin/plans`** — Pricing plan management
- **`/admin/features`** — Feature flags toggle
- **`/admin/audit`** — Audit log
- **NEW** **`/admin/revenue`** — MRR, last-30d revenue, refund, daily chart, purpose breakdown
- **NEW** **`/admin/referrals`** — Top referrers, conversion-to-paid, last-30d
- **NEW** **`/admin/live`** — Live class CRUD (PlatformSetting JSON-backed)
- **NEW** **`/admin/push`** — Push broadcast UI + VAPID status

---

## Backend API Routes (Major)

### Auth
- `POST /api/auth/signup/start`, `/verify` (Email OTP)
- `POST /api/auth/signin`, `DELETE /api/auth/me`
- `POST /api/auth/forgot-password`, `/reset-password`

### Test Engine
- `POST /api/attempts/start`, `/start-custom`, `/submit`
- `GET  /api/attempts/[id]`

### Payments (Razorpay)
- `POST /api/payments/create-order`, `/plan-order`, `/verify`
- `POST /api/payments/webhook` (HMAC SHA-256)

### AI
- `POST /api/ai/doubt` (text/voice/image)
- `POST /api/ai/predict` (queued via BullMQ), `GET /api/ai/predict?jobId=...`
- `POST /api/ai/weakness` — weakness report
- `POST /api/ai/notes`, `/radar`, `/current-affairs`
- **NEW** `POST /api/ai/probability` — selection % from attempts
- **NEW** `POST /api/ai/career` — career suggestions
- **NEW** `POST /api/ai/motivation` — pep talk + micro-actions
- **NEW** `POST /api/ai/summarize` — notes → structured summary + quiz

### Battle Arena (NEW)
- `POST /api/battle/match?exam=<slug>` — picks 10 Q + assigns bot opponent
- `POST /api/battle/finish` — awards XP

### SRS (NEW)
- `GET  /api/srs/next?exam=<slug>&limit=<n>` — due cards
- `POST /api/srs/review` — record grade (0–3), update SM-2 state

### DPP (NEW)
- `GET /api/dpp/today?exam=<slug>` — deterministic 10 Q for the date

### Achievements (NEW)
- `GET /api/me/badges` — all badges with earned/locked state

### Push notifications (NEW)
- `GET  /api/push/vapid` — public key
- `POST /api/push/subscribe`, `DELETE /api/push/subscribe?endpoint=...`
- `POST /api/admin/push/send` — broadcast to all subscribers
- `GET  /api/admin/push/stats` — subscriber count + VAPID status

### Admin (NEW)
- `GET /api/admin/revenue` — MRR, last-30/90d, daily chart, purpose breakdown
- `GET /api/admin/referrals` — top 25 referrers + conversion rate
- `GET /api/admin/live`, `PUT /api/admin/live` — live classes JSON CRUD

---

## Key libs / helpers
- `lib/auth.ts` — JWT session, `requireUser`, `requireAdmin`
- `lib/api.ts` — `ok / fail / handleError` response shapes
- `lib/db.ts` — Prisma client singleton
- `lib/ai/llm.ts` — Multi-provider OpenAI-compatible chain with fallback
- `lib/ai/prompts.ts` — System / user prompt builders
- `lib/access.ts` — Paid access + feature flag gate
- `lib/ratelimit.ts` — Per-user, per-feature hourly rate limits
- `lib/queue.ts`, `lib/redis.ts` — BullMQ wrappers
- `lib/razorpay.ts` — Razorpay client helpers
- `lib/exams.ts` — Exam catalogue (slugs, icons, durations)
- `lib/srs.ts` **NEW** — SM-2 scheduler (`newCard`, `review(grade)`, `isDue`)
- `lib/ncert.ts` **NEW** — Class 10/12 chapter map
- `lib/badges.ts` **NEW** — 12 badge definitions (common→legendary)
- `lib/push-send.ts` **NEW** — VAPID-based broadcast helper

---

## Notable components
- `hero-ai.tsx` — Hero with animated AI brain SVG + student photo hologram + AIR ticker + demo modal
- `ai-brain-background.tsx`, `hero-hologram.tsx`, `air-ticker.tsx`, `demo-video-modal.tsx`
- `features-ai.tsx`, `live-classes-section.tsx`, `golu-ai-section.tsx`
- `gamification-section.tsx`, `ai-control-center.tsx`, `selection-showcase.tsx`
- `pricing-ai.tsx`, `final-cta.tsx`, `scholarship-banner.tsx`
- `batch-launch-section.tsx`, `youtube-section.tsx`, `app-download-section.tsx`
- `push-opt-in.tsx` — VAPID-based browser push permission card
- `ui/progress-ring.tsx`, `ui/magnetic.tsx`, `ui/liquid-gradient.tsx` (primitives)

---

## Required environment variables
```
DATABASE_URL=postgres://...
JWT_SECRET=<32+ chars>
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
ANTHROPIC_API_KEY=... (or OPENAI_API_KEY / GROQ_API_KEY / OPENROUTER_API_KEY)
LLM_CHAIN_DOUBT=groq,openrouter,openai  # optional
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:support@8rupiya.in
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_SITE_URL=https://8rupiya.in
```

Generate VAPID keys: `npx web-push generate-vapid-keys`

---

## Deployment
- **Hostinger VPS** — `187.127.148.237`
- `systemd` service + `nginx` reverse proxy
- `docker compose` for local infra (Postgres + Redis)
- CI Node 22 (regenerate `package-lock.json` on Node 22 — `npm ci` fails otherwise)
- Push to production: `npm run deploy` (uses `scripts/push-to-github.sh`)

---

## What's still pending (real infra, alag effort)
- **HD live streaming** infra (LiveKit / Agora / Mux) — UI ready, no streaming backend
- **Real multiplayer Battle Arena** — currently bot-only (WebSocket/Pusher needed for human-vs-human)
- **WebSocket** live class chat + community chat rooms
- **Lecture transcript auto-pipeline** — currently `/summaries` is manual paste; future: auto from live class recording
- **Lecture downloads** for full offline viewing (PWA SW caches HTML only)
- **Scheduled push reminder cron** (BullMQ job) — sender ready, scheduling not yet wired
