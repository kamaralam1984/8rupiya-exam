# 8Rupia — What's Still Missing (audit as of today)

Legend: ✅ done · ⚠️ partial · ❌ missing · 🔒 needs external setup (keys/service)

---

## 🔥 Critical / blocking real launch

| # | Item | Status | Note |
|---|---|---|---|
| 1 | Razorpay live ₹8 unlock — actually tested | 🔒 | Code + UI ready. Needs `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` set + webhook URL configured in Razorpay dashboard. |
| 2 | Workers process running | ⚠️ | `workers/index.ts` written but **not running in dev**. Run `npm run workers` in a second terminal. |
| 3 | Submit route — streak + badge awarding wiring | ❌ | `lib/streak.ts` exists with `bumpStreak()` + `awardBadges()` but the `/api/attempts/submit` route does **not call them yet**. Streak stays at 0 and badges never granted. |
| 4 | Dev server restart to pick up new pages | ⚠️ | All new pages (`/settings`, `/forgot-password`, `/reset-password`, `/notes`, `/current-affairs`, `/radar`, `/bookmarks`) need a server restart to be reachable. |
| 5 | Sample question bank is generic (12 MCQs reused across all 10 exams) | ⚠️ | Real exam-specific banks not seeded. Either generate via PDF→MCQ admin flow or expand `prisma/seed.ts`. |
| 6 | Initial Prisma migration file (`prisma/migrations/0001_init/`) | ❌ | Currently using `prisma db push`. For production `prisma migrate deploy` you need real migration files committed. |

## 🔐 Auth / account gaps

| # | Item | Status | Note |
|---|---|---|---|
| 7 | Email delivery for password reset | 🔒 | API returns `devLink` in dev; in prod needs Resend/SendGrid/AWS SES. Reset token is properly hashed (sha256) + 1h expiry. |
| 8 | Phone OTP login | ❌ | Spec mentioned phone-first; right now phone is just an identifier with password. Needs MSG91/Twilio. |
| 9 | Multi-factor auth (TOTP / passkeys) | ❌ | Not in scope yet. |
| 10 | Account deletion (GDPR / DPDP) | ❌ | No `/api/me` DELETE-with-cascade. India's DPDP needs this. |
| 11 | Email verification on sign-up | ❌ | Currently any email accepted. |

## 💳 Payments / monetization

| # | Item | Status | Note |
|---|---|---|---|
| 12 | Wallet system | ❌ | Spec mentioned wallet; only ₹8 unlocks + Subscription model exist. |
| 13 | Subscription purchase UI (Smart Monthly / Exam Pro) | ❌ | `/pricing` page exists but CTA buttons don't open Razorpay subscription flow. |
| 14 | Refer & earn | ❌ | Spec implies viral loop — not built. |
| 15 | Refunds API + admin tool | ❌ | Razorpay refund endpoint not exposed. |
| 16 | Invoice / GST PDF generation | ❌ | Required for any meaningful Indian revenue. |

## 🤖 AI feature gaps

| # | Item | Status | Note |
|---|---|---|---|
| 17 | Doubt Solver image vision | ✅ | Wired (5MB cap, PNG/JPG/WEBP, uses `gpt-4o`). |
| 18 | Weakness Analyzer | ✅ | Verified live. |
| 19 | Predicted Test | ✅ | Queued via BullMQ — but worker must run (see #2). |
| 20 | Study Planner | ✅ | New `StudyPlan` model + `/planner`. |
| 21 | Flashcards | ✅ | `/flashcards`. |
| 22 | Revision Notes | ✅ | `/notes`. |
| 23 | Current Affairs | ✅ | `/current-affairs` (daily cached). |
| 24 | Exam Radar | ✅ | `/radar`. |
| 25 | Voice Tutor (TTS) | ✅ | Browser SpeechSynthesis on result + doubt + notes. |
| 26 | Voice **input** (STT for doubt) | ❌ | Could use Web Speech `SpeechRecognition`. |
| 27 | AI-recommended next test (auto-suggest) | ❌ | Weakness report names chapters but no clickable "next mock" call-to-action. |
| 28 | PDF → MCQ — admin browser upload | ⚠️ | Form accepts `storagePath` string; no actual file picker / object storage. Needs Cloudflare R2 / S3. |
| 29 | Per-exam fine-tuned predicted question banks | ❌ | Currently same LLM prompt for all exams. |

## 🎮 Gamification

| # | Item | Status | Note |
|---|---|---|---|
| 30 | XP awarding on submit | ✅ | Already in submit route. |
| 31 | Streak increment | ❌ | `bumpStreak()` written, not called yet. **Fix needed in `app/api/attempts/submit/route.ts`**. |
| 32 | Badges/achievements | ⚠️ | Schema + util ready (`FIRST_ATTEMPT`, `PERFECT`, `SPEED_DEMON`, `STREAK_7/30`). Not wired into submit. No UI to display them on dashboard. |
| 33 | Leaderboard | ✅ | `/leaderboard`. |
| 34 | Daily streak push reminder | ❌ | Needs push notification stack. |
| 35 | Avatars / cosmetic rewards | ❌ | Single initial in UserMenu only. |

## 📚 Content / curriculum

| # | Item | Status | Note |
|---|---|---|---|
| 36 | Hindi MCQ content | ❌ | Sample bank is English-only. AI generates Hindi on demand but no Hindi questions seeded. |
| 37 | Chapter-level structure populated | ⚠️ | `Chapter` model exists but `prisma/seed.ts` only seeds subjects, not chapters. Per-chapter analytics will look empty. |
| 38 | Hindi explanations toggle on result | ❌ | Stored questions are English; runtime translate not wired. |
| 39 | Question reporting ("this question is wrong") | ❌ | No flow for students to flag bad AI-generated questions. |
| 40 | Bookmark **a question from inside a test** | ⚠️ | Bookmark API supports `kind: "question"`; the test runner UI doesn't expose a save button. |

## 🌐 i18n (Hindi)

| # | Item | Status | Note |
|---|---|---|---|
| 41 | Lang toggle in navbar | ✅ | Cookie-based. |
| 42 | Hero copy translates | ✅ | Wired via `useT()`. |
| 43 | Navbar links, Footer, pricing, blog, exam pages copy | ❌ | Still hardcoded English. Add `t(...)` calls + dictionary entries. |
| 44 | `lang` attribute on `<html>` follows cookie | ❌ | Always `en`. Should switch to `hi` for SEO + screen readers. |
| 45 | URL-segment locale routing (`/hi/...`) | ❌ | Not needed yet; cookie + Accept-Language is fine for v1. |

## 📱 PWA / offline / push

| # | Item | Status | Note |
|---|---|---|---|
| 46 | `manifest.webmanifest` | ✅ | Generated. |
| 47 | Service worker | ⚠️ | `public/sw.js` exists; only registers in production build. Confirm shell caching after `next build && next start`. |
| 48 | Install prompt | ✅ | `InstallPrompt` component. |
| 49 | Offline page | ✅ | `/offline`. |
| 50 | Push notifications | 🔒 | Needs VAPID keys + service worker `push` handler + a per-user `PushSubscription` model. |
| 51 | Background sync (queue test submission while offline) | ❌ | Would prevent score loss on flaky network. |

## 🛡️ Anti-cheat / integrity

| # | Item | Status | Note |
|---|---|---|---|
| 52 | Tab-switch / blur / copy / paste detection | ✅ | Logged into `attempt.meta.violations`. |
| 53 | Auto-submit on N violations | ❌ | Currently only toast. No hard cap. |
| 54 | Fullscreen lock | ❌ | Standard for proctored tests. |
| 55 | Webcam proctoring | 🔒 | Out of scope for ₹8 product. |

## 🎨 UI polish

| # | Item | Status | Note |
|---|---|---|---|
| 56 | Toast notifications (replaces `alert`) | ✅ | TestRunner uses it; other call-sites still use `alert` or local error state. |
| 57 | Global loading / error / 404 | ✅ | `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`. |
| 58 | Empty-state illustrations | ❌ | All empty states are text only. |
| 59 | Real OG / share image | ❌ | Only an SVG placeholder. Needs proper 1200×630 PNG. |
| 60 | Real favicon (PNG/ICO) | ❌ | Only `icon.svg`. |
| 61 | Real images / hero photo / exam icons | ❌ | All-vector. |
| 62 | Animated counters use viewport detection | ✅ | Already done. |
| 63 | Mobile palette dialog | ✅ | Already done. |
| 64 | Skeleton loaders on dashboard / result | ⚠️ | Plain spinner. Skeletons would feel premium. |

## 🏗️ Admin

| # | Item | Status | Note |
|---|---|---|---|
| 65 | `/admin` dashboard + stats | ✅ | |
| 66 | `/admin/pdfs` form (path-based) | ✅ | |
| 67 | `/admin/pdfs` real file upload to R2/S3 | 🔒 | |
| 68 | `/admin/questions` approval grid | ✅ | |
| 69 | `/admin/users` user list + role promotion | ❌ | Currently must run SQL by hand. |
| 70 | `/admin/payments` audit | ❌ | |
| 71 | `/admin/jobs` BullMQ queue dashboard | ❌ | Could embed `bull-board`. |
| 72 | Admin audit log | ❌ | |

## 📊 Observability / production-readiness

| # | Item | Status | Note |
|---|---|---|---|
| 73 | Sentry / error monitoring | 🔒 | DSN missing. |
| 74 | Google Analytics 4 / Plausible | 🔒 | Tag missing. |
| 75 | Uptime monitor on `/api/health` | 🔒 | UptimeRobot or similar. |
| 76 | Rate-limit headers exposed (`X-RateLimit-*`) | ❌ | Server tracks limit but doesn't return it. |
| 77 | Request logging | ⚠️ | Console only. Pino + log shipping not configured. |
| 78 | Database backups | ⚠️ | Documented in `DEPLOY.md` but not actually scheduled here. |
| 79 | Tests (Vitest unit + Playwright e2e) | ❌ | Zero coverage. |
| 80 | CI/CD (GitHub Actions) | ❌ | No workflow files. |
| 81 | Lighthouse 90+ verified | ❌ | Not measured in production build. |
| 82 | A11y audit (axe, keyboard nav) | ❌ | Not formally run. |

## 🚚 Deployment

| # | Item | Status | Note |
|---|---|---|---|
| 83 | `DEPLOY.md` (VPS + Vercel paths) | ✅ | Written. |
| 84 | `vercel.json` for Vercel path | ❌ | Optional but typical. |
| 85 | `systemd` unit files for VPS without PM2 | ❌ | Only PM2 ecosystem documented. |
| 86 | Cloudflare cache rules JSON / Terraform | ❌ | Documented as a manual step. |
| 87 | Daily current-affairs cron (instead of lazy-on-request) | ❌ | Currently generates first time someone hits the page each day. Pre-warm via Vercel Cron / GitHub Actions cron would be nicer. |

## ⚙️ Smaller code quality items

| # | Item | Status | Note |
|---|---|---|---|
| 88 | Replace remaining `alert()` calls outside TestRunner | ⚠️ | Some flows still drop errors into `setErr` only — fine, but toast is more consistent. |
| 89 | API: typed wrapper around `db` queries | ❌ | Inline calls; works fine for now. |
| 90 | API: response cache headers on `/api/exams`, `/api/leaderboard` | ⚠️ | `revalidate` set on `/api/leaderboard` & `/api/exams`. Could add `Cache-Control` explicit. |
| 91 | `useUser()` hook caches across navigations | ❌ | Each `/dashboard` etc refetches `/api/auth/me`. SWR/React Query would dedupe. |
| 92 | Image upload size also validated server-side | ⚠️ | Validator caps 7MB string — fine. But `gpt-4o` may reject very large; pre-resize client-side would be ideal. |
| 93 | OpenAI cost cap per user per day | ⚠️ | Hourly rate-limit only. No daily ₹ cap. |
| 94 | Replace `console.log` with proper logger | ❌ | |

---

## Suggested order to close gaps next

1. **Wire streak + badges into submit route** (item #3, #31, #32) — 10 minutes, big perceived value bump.
2. **Restart dev server** so new pages are live (item #4).
3. **Generate `prisma/migrations/0001_init/migration.sql`** so prod can use `migrate deploy` (item #6).
4. **Razorpay test mode keys + verify ₹8 flow once** end-to-end (item #1).
5. **Email service (Resend free tier) wired to forgot-password** (item #7).
6. **OG image + favicon** (items #59, #60) — small win, big SEO/share polish.
7. **PDF object storage on Cloudflare R2** + browser upload (items #28, #67).
8. **Subscription buy flow** + wallet (items #12, #13).
9. **Hindi i18n: Navbar/Footer/Exam pages copy + `<html lang>` switching** (items #43, #44).
10. **Sentry + GA4 + uptime monitor** (items #73, #74, #75).

Everything else can wait until you have real users.
