# 8Rupia — Deployment Guide

This guide covers two production paths for **8rupia.in**:

- **Path A: Single Ubuntu VPS** — cheapest, full control, you operate it. Matches the spec ("Ubuntu, Nginx, PM2, Redis, PostgreSQL, Cloudflare CDN").
- **Path B: Vercel + managed services** — fastest to ship, near-zero ops, slightly higher monthly cost.

Pick one. Don't mix.

---

## 0. What you must have before starting

- [ ] Domain `8rupia.in` registered, DNS panel accessible (you already have this)
- [ ] An OpenAI account with billing + spend cap set (rotate the leaked key first)
- [ ] Razorpay **live** account (KYC complete) + Webhook secret
- [ ] A 2 GB+ SSD VPS for Path A, or a Vercel account for Path B
- [ ] Cloudflare account (free tier is fine) — for CDN, DDoS, DNS
- [ ] A Git remote (GitHub) for the project

---

## Architecture (both paths)

```
                 ┌──────────────┐
   user ──▶ CF ──┤ Next.js app  │── ▶ PostgreSQL
                 │  (RSC + API) │── ▶ Redis (cache + rate-limit + BullMQ)
                 └──────┬───────┘
                        │ enqueues
                        ▼
                ┌────────────────┐
                │ BullMQ workers │── ▶ OpenAI / OpenRouter / etc
                │ (PDF, predict) │── ▶ PostgreSQL
                └────────────────┘
```

The Next app and the worker process share `lib/db.ts`, `lib/redis.ts`, `lib/queue.ts`. They run as **two separate processes**.

---

# Path A — Ubuntu VPS deployment

Tested target: **Ubuntu 24.04 LTS, 2 vCPU / 2 GB RAM / 40 GB SSD** (~₹400–600/month at Hetzner, Contabo, DigitalOcean, Hostinger VPS, etc).

## A.1 Server prep (one-time, as `root`)

```bash
# Create a non-root user and lock root SSH
adduser deploy
usermod -aG sudo deploy
rsync -a /root/.ssh /home/deploy/ && chown -R deploy:deploy /home/deploy/.ssh

# Disable root + password login
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl reload ssh

# Firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# Auto-security-updates
apt update && apt -y install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

Now log in as `deploy` for everything below.

## A.2 Install runtimes

```bash
# Node 22 LTS (Next 15 requires >=18.18; 22 LTS is the recommended)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt -y install nodejs

# PM2 (process manager) — also bind it to systemd
sudo npm i -g pm2
pm2 startup systemd -u deploy --hp /home/deploy
# follow the printed command (it'll be a `sudo env PATH=... pm2 startup systemd ...`)

# PostgreSQL 16
sudo apt -y install postgresql postgresql-contrib
sudo -u postgres psql <<EOF
CREATE USER rupia WITH PASSWORD 'CHANGE_ME_STRONG';
CREATE DATABASE rupia OWNER rupia;
EOF

# Redis 7
sudo apt -y install redis-server
sudo sed -i 's/^supervised .*/supervised systemd/' /etc/redis/redis.conf
sudo sed -i 's/^# requirepass .*/requirepass CHANGE_ME_REDIS/' /etc/redis/redis.conf
sudo systemctl restart redis-server

# Nginx + Certbot for TLS
sudo apt -y install nginx certbot python3-certbot-nginx
```

## A.3 DNS + Cloudflare

In your registrar's panel **OR** Cloudflare DNS:

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `@` | your VPS IPv4 | Proxied (orange cloud) |
| A | `www` | your VPS IPv4 | Proxied |

In Cloudflare → SSL/TLS → set to **Full (strict)** after you have Let's Encrypt working.
Enable: Auto-Minify (HTML, CSS, JS), Brotli, Always Use HTTPS, HTTP/3, Early Hints.
Rules → Page Rule: `*8rupia.in/*` → Cache Level: Standard. Optionally a rule excluding `/api/*` from cache.

## A.4 Clone, build, env

```bash
sudo mkdir -p /var/www && sudo chown deploy:deploy /var/www
cd /var/www
git clone https://github.com/<you>/8rupia.git
cd 8rupia
npm ci --omit=dev=false  # build needs devDeps
```

Create `/var/www/8rupia/.env.production`:

```dotenv
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://8rupia.in

# 64-char hex — generate: openssl rand -hex 32
JWT_SECRET=REPLACE_WITH_64_HEX_CHARS

DATABASE_URL=postgresql://rupia:CHANGE_ME_STRONG@localhost:5432/rupia
REDIS_URL=redis://default:CHANGE_ME_REDIS@127.0.0.1:6379

LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...

RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
```

Build + DB:

```bash
npx prisma generate
npx prisma migrate deploy           # apply committed migrations (preferred)
# OR if you haven't created migrations yet:
# npx prisma db push
npm run db:seed                     # only first deploy
npm run build
```

> **Migrations vs `db push`**: in production prefer `prisma migrate`. Before the first deploy, run `npx prisma migrate dev --name init` locally, commit the `prisma/migrations/` folder, then on the server use `migrate deploy`.

## A.5 PM2 ecosystem

Create `/var/www/8rupia/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: "8rupia-web",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: "max",
      exec_mode: "cluster",
      env_file: ".env.production",
      max_memory_restart: "600M",
    },
    {
      name: "8rupia-workers",
      script: "node_modules/.bin/tsx",
      args: "workers/index.ts",
      cwd: __dirname,
      env_file: ".env.production",
      max_memory_restart: "400M",
      autorestart: true,
    },
  ],
};
```

Start + persist:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 logs --lines 30      # verify
```

## A.6 Nginx reverse proxy + TLS

Create `/etc/nginx/sites-available/8rupia`:

```nginx
server {
  listen 80;
  server_name 8rupia.in www.8rupia.in;

  client_max_body_size 25M;        # PDF uploads
  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
  }

  # Long-lived for AI calls
  location ~ ^/api/(ai|payments)/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/8rupia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# TLS — get a Let's Encrypt cert
sudo certbot --nginx -d 8rupia.in -d www.8rupia.in --redirect --agree-tos -m you@8rupia.in
```

Cloudflare → set SSL/TLS to **Full (strict)** (now that origin has a real cert).

## A.7 Razorpay webhook URL

In Razorpay dashboard → Webhooks → add:
- URL: `https://8rupia.in/api/payments/webhook`
- Events: `payment.captured`, `payment.failed`
- Secret: copy into `RAZORPAY_WEBHOOK_SECRET` on the server, then `pm2 restart 8rupia-web`.

## A.8 Backups

Daily Postgres dump to a separate disk / object store:

```bash
sudo crontab -e -u postgres
# add:
0 2 * * * pg_dump -Fc rupia > /var/backups/rupia-$(date +\%F).pgc && find /var/backups -name 'rupia-*.pgc' -mtime +14 -delete
```

For real safety, rsync the backups offsite (e.g., Cloudflare R2 via `rclone`).

## A.9 Deploys after the first

```bash
cd /var/www/8rupia
git pull
npm ci --omit=dev=false
npx prisma migrate deploy
npm run build
pm2 reload ecosystem.config.cjs
```

Hook this into GitHub Actions or a simple webhook later.

---

# Path B — Vercel + managed services

Faster, but you pay per service. Best for the first 6–12 months.

| Concern | Service | Free → first paid tier |
|---|---|---|
| Next.js app | **Vercel** | Free Hobby → Pro $20/mo when you outgrow |
| PostgreSQL | **Neon** (serverless) or **Supabase** | Free tier sufficient at launch |
| Redis | **Upstash** (HTTP Redis) | Free 10k commands/day → pay-per-request |
| BullMQ workers | **Railway** or **Render** (background worker) | ~$5/mo |
| Object storage (PDFs) | **Cloudflare R2** | Free 10 GB |
| Email | **Resend** | 100/day free |
| Monitoring | **Sentry** + **Vercel Analytics** | Free starter |

## B.1 Provision

1. **Neon**: create project `8rupia`, copy `DATABASE_URL`.
2. **Upstash**: create Redis db (Global if you need multi-region), copy `REDIS_URL` (use the `rediss://` TLS one). BullMQ on Upstash needs `enableReadyCheck: false, maxRetriesPerRequest: null` — already set in `lib/redis.ts`.
3. **Vercel**: import GitHub repo. Framework auto-detected. Set env vars from `.env.production` above (skip `DATABASE_URL` referencing localhost). Add `NEXT_PUBLIC_SITE_URL=https://8rupia.in`.
4. **Railway/Render** for workers:
   - New service from same repo
   - Build: `npm ci && npx prisma generate`
   - Start: `npm run workers`
   - Same env vars
5. **Cloudflare DNS**: point `@` and `www` to Vercel via the values Vercel shows (CNAME or A record). Then in Vercel → Domains → add `8rupia.in` and `www.8rupia.in`.
6. **Razorpay webhook** → `https://8rupia.in/api/payments/webhook` (same as Path A).

## B.2 Migrations

Use Vercel build command:
```bash
prisma generate && prisma migrate deploy && next build
```
Set Vercel env `PRISMA_HIDE_UPDATE_MESSAGE=true`.

## B.3 PDF uploads → R2

Replace the current `storagePath` string flow with pre-signed PUT URLs to R2. Add `lib/storage.ts` (S3 client), endpoint `/api/admin/pdfs/sign-upload`, and client upload before calling `/api/admin/pdfs/upload`. (Defer until you actually need real PDFs.)

---

## Production checklist (both paths)

- [ ] `JWT_SECRET` is a fresh 32+ char random value, **not** the dev one
- [ ] Postgres password and Redis password rotated
- [ ] All AI keys rotated (the ones you pasted earlier)
- [ ] Razorpay keys are **live** (`rzp_live_*`), not test
- [ ] OpenAI org has a monthly spend limit (start ₹500–₹1000)
- [ ] `LLM_PROVIDER` set; if using OpenAI, `gpt-4o-mini` keeps cost low
- [ ] Webhook secret matches Razorpay dashboard
- [ ] Database backed up daily
- [ ] Cloudflare proxy enabled (orange cloud) on `@` and `www`
- [ ] Cloudflare SSL/TLS = Full (strict)
- [ ] Cloudflare WAF: enable "Bot Fight Mode" (free)
- [ ] Sitemap submitted at https://search.google.com/search-console for `8rupia.in/sitemap.xml`
- [ ] First admin user promoted: `UPDATE "User" SET role='ADMIN' WHERE email='you@8rupia.in';`
- [ ] Google Analytics 4 / Plausible script added (not in scaffold)
- [ ] AdSense account created (apply only after 20–30 unique educational articles published in `/blog`)
- [ ] Sentry DSN added (frontend + workers)
- [ ] Status page (UptimeRobot free check on `/api/health` every 5 min)

## Rough monthly cost at small scale

| Path | Hosting | DB | Redis | Workers | Total |
|---|---|---|---|---|---|
| A (VPS) | ₹450 Hetzner / Hostinger | included | included | included | **≈ ₹450** |
| B (Vercel) | Free hobby | Neon free | Upstash free | Railway ₹400 | **≈ ₹400** |

OpenAI usage on `gpt-4o-mini` is the variable cost: ~₹0.02–0.05 per weakness report, ~₹0.15 per predicted set, ~₹0.20 per PDF→MCQ chunk.
At ~1000 daily users with mixed usage, expect ₹3,000–₹8,000/month in OpenAI bill. Add `LLM_PROVIDER=openrouter` and switch to a cheaper model (Llama-3-8B via Together / DeepSeek) to drop 70–80% of that.

## Common gotchas

- **Prisma engine size on Vercel**: Vercel has size limits per Lambda. If you hit them, set `PRISMA_CLIENT_ENGINE_TYPE=binary` and use the `prisma-data-proxy` or move to Neon's serverless driver via `@prisma/adapter-neon`.
- **Redis on Upstash + BullMQ**: `enableReadyCheck: false, maxRetriesPerRequest: null` is required (already set).
- **Service worker caching old HTML**: bump the `VERSION` string in `public/sw.js` on every deploy that changes shell pages.
- **Cloudflare cache + dynamic auth**: never cache `/api/*` and `/dashboard`, `/admin`, `/attempt/*`, `/test/*`. The Page Rule above keeps these uncached because they set `Cache-Control: no-store` via `dynamic = "force-dynamic"`.
- **PM2 workers don't restart on code change**: `pm2 reload` only restarts. For a clean restart, `pm2 restart 8rupia-workers`.
- **Razorpay live mode**: webhook **must** be HTTPS; Razorpay rejects HTTP URLs.

## Going further

- Multi-region: put a read replica of Postgres in `ap-south-1`, route Indian users via Cloudflare Argo / `nearest-pop`.
- Cron jobs (daily current affairs quiz): GitHub Actions cron → `POST /api/cron/daily` with a shared bearer secret.
- Mobile app: wrap with Capacitor/Expo later; existing PWA already covers most use cases.

---

When you're ready, tell me which path you picked and I can generate the missing pieces (Vercel `vercel.json`, Railway service config, Prisma initial migration, or systemd unit files if you don't want PM2).
