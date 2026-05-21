# 8Rupia — Project Status & Roadmap

_Generated: 2026-05-21_

Ye file batati hai website mein **abhi kya kya hai**, **kya missing hai**, aur **aage kya kar ke isko aur advance bana sakte hain**. Section-wise scan kiya gaya hai poora codebase.

---

## 1. CURRENT FEATURES (Abhi kya kaam karta hai)

### 1.1 Authentication & Users
- ✅ Email + Phone signup/login (password-based)
- ✅ JWT session cookies (HS256, 30-day)
- ✅ Email OTP verification (Resend, 6-digit code, 10 min expiry)
- ✅ Block-login-until-verified for email accounts (ADMIN exempt)
- ✅ Password reset via OTP (6-digit code, ticket-based reset)
- ✅ Account deletion
- ✅ Settings page (name, language, examTrack, password change, email-verify trigger)
- ✅ Onboarding flow (`/onboarding` — pick exam track)
- ✅ User menu in navbar (auto-detect login state)

### 1.2 Roles & Access Control (4 roles)
- **FREE** — default, paywall + rate limits apply
- **PREMIUM** — bypasses paywalls + rate limits (after Razorpay payment auto-upgrade)
- **FAMILY** — same access as PREMIUM (label only — multi-user sharing not built yet)
- **ADMIN** — full unlimited access + admin panel access
- ✅ Admin can change any user's role via dropdown
- ✅ Razorpay payment auto-upgrades FREE → PREMIUM
- ✅ Subscription grant (admin) also upgrades role
- ✅ Centralized bypass logic: `lib/access.ts`, `lib/ratelimit.ts`

### 1.3 Exams (11 tracks supported)
NEET · CTET · SSC · Railway · Banking · CUET · Class 10 · NIIT · Police · Teacher (TET/STET) · State (UPPSC/BPSC/MPPSC)
- ✅ Real circular crest logo for each exam (`/public/exam-logos/`)
- ✅ Per-exam config: subjects, duration, total questions, gradient color
- ✅ Admin can toggle isActive (visible/hidden on homepage)
- ✅ Exam detail page `/exams/[slug]`
- ✅ Per-track "TrackHome" personalized dashboard on `/home`

### 1.4 Mock Test System
- ✅ Test sets with calibrated questions (per-exam difficulty mix)
- ✅ Take a test: `/test/[slug]` → starts an `Attempt`
- ✅ Test runner (timer, navigator, flag-for-review, language toggle)
- ✅ Submit attempt → `/attempt/[id]/result`
- ✅ Resume in-progress attempt
- ✅ Free vs Premium test sets (₹8 unlock model)
- ✅ Unlock per test set OR full PREMIUM/FAMILY/ADMIN bypass
- ✅ Admin: bulk grant unlock to user
- ✅ Bilingual questions (Hindi + English with one-tap toggle)

### 1.5 AI Features (all working)
- ✅ **AI Doubt Solver** — text + image (paste/upload) → step-by-step explanation, bilingual
- ✅ **AI Notes Generator** — topic → JSON summary + key points + mnemonics
- ✅ **AI Flashcards** — topic → front/back cards
- ✅ **AI Study Planner** — exam + days + hours → daily plan with weekly themes
- ✅ **AI Predict** — predicted questions for any exam
- ✅ **AI Predict 2026** (`/predict-2026`) — special end-of-year prediction set
- ✅ **AI Weakness Report** — per-attempt analysis (subjects, time, accuracy, guessing)
- ✅ **Topic Radar** — AI scans trending exam topics
- ✅ **Predict PYQ** — predicted set based on past papers
- ✅ **PYQ Search** (`/pyq`) — previous year question archive
- ✅ **Current Affairs** — daily quiz auto-generated via cron
- ✅ AI provider chain support: OpenAI, OpenRouter, Groq, DeepSeek, Together, Mistral, Cohere, HuggingFace, Anthropic
- ✅ Per-route chain config via env (`LLM_CHAIN_*`)

### 1.6 PDF Library (Class 10 reader)
- ✅ Admin uploads PDFs via `/admin/pdfs` (drag-drop, multi-file)
- ✅ **Auto PDF compression** on upload (Ghostscript `/ebook` preset → 50-87% size reduction)
- ✅ Reorder PDFs (admin ↑/↓ buttons → reflects on `/library` order)
- ✅ Delete PDF (admin)
- ✅ PDF reader at `/library/[pdfId]` with side AI doubt panel
- ✅ Authenticated streaming endpoint with Range requests (page seeking)
- ✅ Class 10 restricted (ADMIN bypasses to view any track's PDFs)
- ✅ AI doubt solver in-page (paste confusing line, ask question)

### 1.7 Payments (Razorpay)
- ✅ Razorpay order creation
- ✅ Signature verification (browser flow + webhook)
- ✅ Webhook handler (`payment.captured`, `payment.failed`)
- ✅ ₹8 per-test unlock
- ✅ Auto-upgrade role to PREMIUM after first payment
- ✅ Wallet top-up flow (separate `Wallet` model + transactions)
- ✅ Referral bonus on first paid unlock (referrer gets ₹5)
- ✅ Admin can manually grant unlocks (test bypass)
- ✅ Admin can grant/revoke subscriptions (MONTH/YEAR/LIFETIME)
- ✅ Admin payment list + refund button

### 1.8 Gamification
- ✅ **XP** (per submission, badges)
- ✅ **Daily Streak** counter
- ✅ **Leaderboard** (`/leaderboard` — public, top XP users)
- ✅ **User Badges** (model exists, code/awardedAt)
- ✅ **Bookmarks** (`/bookmarks` — save questions, flashcards, notes)
- ✅ **Referrals** (`/refer` — unique referral code per user)

### 1.9 Admin Panel (12 sections)
- ✅ Dashboard with stats (users, attempts, questions, PDFs, payments, pending approval)
- ✅ **Users** — search, create, edit, delete, role change, password reset, subscription grant
- ✅ **Exams** — toggle active, edit name/short/desc/duration/questions
- ✅ **Subjects** — CRUD per exam, parent-child support (e.g. Science → Physics/Chem/Bio)
- ✅ **Test Sets** — list, toggle premium/free, edit price, publish toggle
- ✅ **Questions** — review AI-generated, approve/reject
- ✅ **PDFs** — upload, list, delete, reorder, compression report
- ✅ **Payments** — view all, refund
- ✅ **Jobs** — BullMQ job status (PDF ingest, predict)
- ✅ **Audit log** — all admin actions logged
- ✅ **Feature Flags** — enable/disable any feature site-wide, set requiresPaid
- ✅ **Subscriptions** — grant/revoke manually

### 1.10 Background Workers (BullMQ + Redis)
- ✅ **PDF Ingest** worker — extracts text from uploaded PDF, generates MCQs via AI, populates Question + TestSetQuestion tables
- ✅ **Predict** worker — async generation of large predicted sets
- ✅ Job status tracked in `AiJob` table, visible to admin

### 1.11 i18n / Bilingual
- ✅ Hindi + English toggle (`LangToggle` in navbar)
- ✅ Question translation API (`/api/i18n/translate`, batch endpoint)
- ✅ Translation cache (Redis)
- ✅ Cookie-based language preference (`8r_lang`)
- ✅ Most UI strings already Hinglish

### 1.12 UX & Frontend
- ✅ Light + Dark theme toggle (next-themes)
- ✅ EduLearn-style modern design (indigo + saffron palette)
- ✅ 2-col hero with real student photo + floating stat cards
- ✅ TrustStrip, HowItWorks, Testimonials, SubjectRow sections
- ✅ Image-card course thumbnails with hover lift
- ✅ Framer-motion scroll-reveal animations
- ✅ PWA: installable, service worker, manifest, offline page
- ✅ Install prompt (custom banner)
- ✅ Toast notifications (success/error/info)

### 1.13 Security
- ✅ JWT secret enforced (32+ chars)
- ✅ Rate limiting on all sensitive endpoints (login, register, OTP, AI calls)
- ✅ Admin bypass for paid roles on rate limits
- ✅ Anti-enumeration on forgot-password
- ✅ CSP headers via reverse proxy
- ✅ OTP attempts capped (5 max), short TTL (10 min)
- ✅ Audit log for all admin actions
- ✅ Question reports (users can flag bad AI questions)

### 1.14 Infrastructure
- ✅ Next.js 15.5 + React 19 + TypeScript 5.6
- ✅ Prisma + PostgreSQL 16
- ✅ Redis 7 (BullMQ + rate-limit + translation cache)
- ✅ Docker compose (`docker-compose.yml` for local, `docker-compose.prod.yml`)
- ✅ Systemd services on VPS (8rupia-web, 8rupia-workers)
- ✅ Deploy script (`scripts/deploy.sh`) — tarball-based update
- ✅ Health endpoint (`/api/health`)
- ✅ Cron endpoint for daily current affairs
- ✅ Web push subscriptions (model exists, endpoint set up)

---

## 2. MISSING / NOT YET IMPLEMENTED

### 2.1 High priority gaps
- ❌ **Phone OTP** — currently only email OTP. Phone-based accounts can't verify at all
- ❌ **SMTP fallback** in `lib/email.ts` — only Resend works, no fallback if Resend down
- ❌ **Family group multi-user sharing** — FAMILY role exists but can't invite/manage family members (no FamilyGroup table yet)
- ❌ **Hero image optimization** — `/hero-student.png` is 2.6 MB (should be < 200 KB via Next/Image conversion to WebP)
- ❌ **Image upload to CDN/S3** — PDFs stored on local disk, no S3 backup, single-VPS failure = data loss
- ❌ **Welcome/transactional emails** — only OTP emails go out. No "welcome", "test completed", "weekly progress" etc.
- ❌ **Contact form backend** — `/contact` page exists but no API route to receive messages
- ❌ **Blog CMS** — `/blog` is placeholder, no posts, no admin section for blog content
- ❌ **Reset password UI for OTP flow** — `/reset-password` page may still expect token-link, needs OTP code input
- ❌ **2FA for admin accounts** — admin can be compromised with just password + email
- ❌ **Webhook idempotency** — Razorpay webhook handler doesn't store idempotency keys, duplicate webhooks may double-process

### 2.2 Mid-priority gaps
- ❌ **Analytics dashboard** — admin sees counts but no charts (DAU/WAU/MAU, conversion funnel, retention)
- ❌ **Error tracking** — no Sentry/Bugsnag integration; errors only in server logs
- ❌ **Google Analytics / Plausible** — CSP allows it but not actually wired in `<head>`
- ❌ **Sitemap regeneration** — sitemap.xml exists but isn't auto-rebuilt when new exams added
- ❌ **SEO meta per page** — only homepage has rich OG tags; exam pages, blog, library use defaults
- ❌ **Robots.txt fine-tuned** — generic, not optimized for AdSense/Search Console
- ❌ **Newsletter signup** — no email list capture form
- ❌ **Promo codes / coupons** — no discount system on unlocks
- ❌ **Discussion forum / Q&A community** — no threads, no comments on questions
- ❌ **Mentor / Doubt chat with humans** — only AI doubt solver
- ❌ **Video lectures** — no video upload, embed, or playlist
- ❌ **Live mock tests** (scheduled, simultaneous) — only async tests
- ❌ **Parent dashboard** — Class 10 parents can't see kid's progress
- ❌ **Mobile app** — PWA works but no native iOS/Android wrapper
- ❌ **WhatsApp integration** — no auto-message on signup/score/etc.
- ❌ **SMS notifications** (Twilio/MSG91) — no SMS at all
- ❌ **Push notification triggering** — endpoint exists but no actual push send code

### 2.3 Polish / Quality gaps
- ❌ **`particle-background.tsx` is unused** — file lying around, replaced by notebook-background
- ❌ **Some build artifacts in git** (`tsconfig.tsbuildinfo`) — should be gitignored
- ❌ **Dev fallback OTP** logs the code to server console — fine for dev, but visible in prod logs if Resend fails silently
- ❌ **No automated tests** — no Jest/Playwright/Vitest tests for any route or component
- ❌ **No CI/CD** — no GitHub Actions, manual deploy via tarball
- ❌ **Hero photo Next/Image not used optimally** — Next/Image is used but priority is true on a 2.6 MB asset (LCP impact)
- ❌ **Some inline gradient `bg-gradient-to-br` still on avatar circles in admin views** — design consistency

---

## 3. ROADMAP — Aage kya kar ke ye website ADVANCED ho jayegi

### 3.1 Phase 1 — Production hardening (1-2 weeks)
1. **Phone OTP** via Twilio / MSG91 / Fast2SMS (target ₹0.10/SMS) → `/api/auth/phone-otp/{send,verify}`
2. **S3/R2 PDF storage** — move PDFs off local disk; signed URLs for serving
3. **Hero image** — convert to WebP at 800px width, ~80 KB
4. **Sentry** for error tracking + source maps upload
5. **Google Analytics** — track signup, attempt, payment funnel
6. **Webhook idempotency** — store `razorpayPaymentId` lookup before processing
7. **Welcome email** + payment receipt + test-complete summary email
8. **Reset password page** — convert UI to 6-box OTP input + new-password form
9. **Sitemap regen** — server-side dynamic generation, ping Google on new content
10. **SMTP fallback** for email (nodemailer when Resend fails)

### 3.2 Phase 2 — Family + Mentorship + Community (2-4 weeks)
1. **FamilyGroup multi-user system**
   - New tables: `FamilyGroup`, `FamilyMember`
   - Owner can invite 3-4 family members (email/phone)
   - Each gets FAMILY role + access flows through ownership
   - Admin panel: family group management
2. **Doubt chat with mentors** (live human tutors)
   - Mentor role + queue + chat interface
   - SLA-based response time
3. **Discussion forum on each question**
   - Comments under questions, upvotes, "best answer"
   - Moderation queue in admin
4. **Group study rooms** — real-time, students take same mock together
5. **Mentor/Instructor accounts** — verified flag, profile page
6. **Course creation tools** — instructor can publish their own mock series

### 3.3 Phase 3 — AI Layer 2.0 (3-6 weeks)
1. **Conversational AI tutor** with memory (vector store per user)
   - Remembers what user studied, where they got stuck
   - Personalized question generation per student
2. **Voice doubt solver** — `Whisper` for speech-to-text + TTS reply
3. **Adaptive difficulty** — questions auto-adjust based on accuracy curve
4. **Smart revision deck** — spaced-repetition (SM-2 algorithm) on wrong/flagged questions
5. **OCR-powered handwriting → solution** — student snaps a math problem, gets step-by-step
6. **Live AI mock interviews** for SSC/Banking interview rounds
7. **Predictive grade** — based on attempts, project user's likely final score with confidence interval
8. **Career counseling AI** — "Based on your CTET attempts, here are colleges/jobs to target"

### 3.4 Phase 4 — Mobile + Reach (4-8 weeks)
1. **React Native / Capacitor mobile app** — wrap the PWA with native features (push notifications, offline downloads, biometrics)
2. **WhatsApp Bot** for reminders, doubt solver, daily affairs (via WhatsApp Business API)
3. **Telegram bot mirror** for tier-2/3 cities preference
4. **Vernacular languages** beyond Hindi/English — Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada (auto-translate cache)
5. **Offline downloads for PREMIUM** — encrypted PDFs + cached AI responses for low-connectivity users
6. **SMS pack** — daily current affairs SMS + payment reminders

### 3.5 Phase 5 — Monetization & Growth (parallel)
1. **Subscription tiers** — Monthly ₹99, Annual ₹599, Family ₹999/year (4 users), Lifetime ₹2,499
2. **Promo codes / referral codes** — first-3-month-50%-off, instructor coupons
3. **Affiliate program** — coaching centers refer students, get cut
4. **In-app ads for FREE tier** (AdSense already CSP-allowed) — non-intrusive native ads only
5. **Marketplace for paid mock series** — third-party instructors list paid courses, platform takes 20%
6. **Corporate / Bulk plans** — schools buy 100 seats at discount
7. **Print-on-demand revision PDFs** — Class 10 / NEET printed notes shipping

### 3.6 Phase 6 — Platform polish (ongoing)
1. **Performance**
   - Edge caching for exam pages (Cloudflare)
   - Image CDN (Cloudflare Images / imgix)
   - Code-split heavy admin bundles
   - DB indices audit + slow query log
2. **CI/CD**
   - GitHub Actions: lint + typecheck + test on PR
   - Auto-deploy on push to main via webhook
   - Preview deployments per PR
3. **Testing**
   - Vitest unit tests for `lib/*`
   - Playwright e2e for signup→test→payment flow
   - Visual regression for major pages
4. **Monitoring**
   - Uptime monitoring (UptimeRobot / BetterStack)
   - Database backup automation
   - Log aggregation (Grafana Loki)
5. **Documentation**
   - Architecture diagram
   - Admin user manual
   - Instructor onboarding guide
6. **Accessibility**
   - WCAG AA audit
   - Keyboard navigation testing
   - Screen-reader labels on all interactive elements
7. **Compliance**
   - GDPR-style data export + delete
   - Razorpay PCI compliance documented
   - DPDP Act (India) compliance for student data

---

## 4. TL;DR — Quick Wins (agar 1 weekend mein kuch impactful karna ho)

1. **Hero image optimize** — saves 2.4 MB on every homepage load
2. **Phone OTP** — Indian students mostly use phone, not email
3. **Welcome email + payment receipt** — basic transactional emails users expect
4. **Google Analytics** — abhi tak metric nahin pata kya chal raha hai
5. **Reset-password OTP UI** — currently inconsistent with new OTP flow
6. **Sentry** — production errors visibility

In 6 items se website production-grade ho jayegi without big architectural changes.

---

_Total features inventory: 60+ pages, 80+ API endpoints, 11 exam tracks, 9 AI features, 12-section admin panel, 2 worker processes, 4 user roles, 11 real exam logos._
