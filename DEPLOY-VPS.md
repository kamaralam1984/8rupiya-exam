# 8rupia.in — Hostinger VPS deployment (Cloudflare Tunnel setup)

Your VPS uses **Cloudflare Tunnel** as the public entrypoint (no nginx, no public 80/443). Existing sites:

| Site | Local port | Cloudflared route |
|---|---|---|
| vidyt.com | `3000` or `3001` | already configured in `/etc/cloudflared/config.yml` |
| aapkaplot.com | `3000` or `3001` | already configured |

We add **8rupia.in → `localhost:3002`** by adding one ingress entry. The existing two routes are not touched.

**Isolation:**
- 8rupia Postgres + Redis bind to `127.0.0.1:55432` / `127.0.0.1:56379` — unique ports, no collision with aapkaplot's `5433` / `6380` or system redis on `6379`.
- 8rupia Next.js on `localhost:3002` — port `3002` is currently free (3000 + 3001 are taken).
- Cloudflared config is edited as a **diff** — your existing ingress rules stay byte-for-byte identical.

---

## Step 1 — Upload the code (from your local machine)

```bash
# Run this on your LOCAL machine
rsync -avz --delete \
  --exclude node_modules --exclude .next --exclude data --exclude tmp \
  /home/yusuf/Documents/8rupiya/ \
  root@187.127.148.237:/var/www/8rupia/
```

---

## Step 2 — Production env file (on VPS)

```bash
ssh root@187.127.148.237
cd /var/www/8rupia
cp .env.local .env.production
nano .env.production
```

Edit:
```env
NEXT_PUBLIC_SITE_URL=https://8rupia.in
JWT_SECRET=<paste output of: openssl rand -hex 32>
DATABASE_URL=postgresql://rupia:STRONG_PWD@127.0.0.1:55432/rupia
REDIS_URL=redis://127.0.0.1:56379
POSTGRES_PASSWORD=STRONG_PWD
# Razorpay LIVE (or test) keys
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
# AI keys — copy from your local .env.local (Groq, OpenRouter, OpenAI, etc.)
```

Save + chmod:
```bash
chmod 600 .env.production
```

---

## Step 3 — Bring up Postgres + Redis (8rupia containers)

```bash
cd /var/www/8rupia
docker compose -f docker-compose.prod.yml up -d
docker ps | grep 8rupia
# expected: 8rupia-postgres on 127.0.0.1:55432, 8rupia-redis on 127.0.0.1:56379
```

---

## Step 4 — Install Node deps, run migration, build

```bash
cd /var/www/8rupia
# Use existing Node — check version (need 20+)
node -v

# If Node missing or too old:
# curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
# apt-get install -y nodejs

npm ci --no-audit --no-fund

set -a && . ./.env.production && set +a
npx prisma generate
npx prisma db push --skip-generate
npm run build
```

---

## Step 5 — Install systemd units

```bash
install -m 0644 /var/www/8rupia/systemd/8rupia-web.service     /etc/systemd/system/
install -m 0644 /var/www/8rupia/systemd/8rupia-workers.service /etc/systemd/system/

# These run as user "deploy" by default. If you want to run as root instead,
# edit User=/Group= in both unit files. Otherwise create the deploy user:
#   adduser --disabled-password --gecos "" deploy
#   chown -R deploy:deploy /var/www/8rupia
#   usermod -aG docker deploy

systemctl daemon-reload
systemctl enable --now 8rupia-web 8rupia-workers

# Verify
curl -s http://127.0.0.1:3002/api/health
# expected: {"ok":true,"data":{"db":"ok","redis":"ok"}}
```

---

## Step 6 — Add Cloudflared ingress rule (the ONLY public-facing change)

**Back up first:**
```bash
cp /etc/cloudflared/config.yml /etc/cloudflared/config.yml.bak.$(date +%s)
cat /etc/cloudflared/config.yml
```

You'll see something like:
```yaml
tunnel: <UUID>
credentials-file: /etc/cloudflared/<UUID>.json
ingress:
  - hostname: vidyt.com
    service: http://localhost:3001
  - hostname: aapkaplot.com
    service: http://localhost:3000
  - service: http_status:404
```

**Add 2 lines** for 8rupia (8rupia.in + www) BEFORE the final `http_status:404` catch-all:
```bash
nano /etc/cloudflared/config.yml
```

Make it look like:
```yaml
tunnel: <UUID>
credentials-file: /etc/cloudflared/<UUID>.json
ingress:
  - hostname: vidyt.com
    service: http://localhost:3001
  - hostname: aapkaplot.com
    service: http://localhost:3000
  - hostname: 8rupia.in
    service: http://localhost:3002
  - hostname: www.8rupia.in
    service: http://localhost:3002
  - service: http_status:404
```

**Validate + reload:**
```bash
cloudflared tunnel ingress validate
# should print: OK
systemctl reload cloudflared || systemctl restart cloudflared
systemctl status cloudflared --no-pager | head
```

Other two sites continue working — no downtime (reload is graceful).

---

## Step 7 — Point DNS in Cloudflare dashboard

1. Log into Cloudflare → select your account → **DNS** tab for `8rupia.in`.
2. Find the tunnel UUID (same one that serves vidyt.com / aapkaplot.com). It's in `/etc/cloudflared/config.yml`.
3. Add 2 CNAME records (proxied, orange cloud ON):

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` (or `8rupia.in`) | `<UUID>.cfargotunnel.com` | Proxied ✓ |
| CNAME | `www` | `<UUID>.cfargotunnel.com` | Proxied ✓ |

OR run from VPS (auto-creates the DNS record):
```bash
cloudflared tunnel route dns <TUNNEL_NAME_OR_UUID> 8rupia.in
cloudflared tunnel route dns <TUNNEL_NAME_OR_UUID> www.8rupia.in
```

SSL is automatic via Cloudflare — no certbot needed.

---

## Step 8 — Verify

```bash
# From VPS
curl -I https://8rupia.in
# expected: 200 (or 307 redirect → onboarding for logged-in users)

# Other sites still healthy
curl -I https://vidyt.com
curl -I https://aapkaplot.com
```

Open `https://8rupia.in` in browser — live ✅.

---

## Useful commands

```bash
# Logs
journalctl -u 8rupia-web -f
journalctl -u 8rupia-workers -f
journalctl -u cloudflared -f

# Restart Next app + workers (after a code change + rebuild)
systemctl restart 8rupia-web 8rupia-workers

# Pull latest + rebuild
cd /var/www/8rupia
git pull   # or rsync from local
npm ci --no-audit && \
  set -a && . ./.env.production && set +a && \
  npx prisma generate && \
  npx prisma db push --skip-generate && \
  npm run build
systemctl restart 8rupia-web 8rupia-workers

# DB / Redis status
docker compose -f /var/www/8rupia/docker-compose.prod.yml ps
```

---

## Rollback (instant, doesn't touch other sites)

```bash
# Remove ONLY the 8rupia ingress rules from cloudflared
nano /etc/cloudflared/config.yml   # delete the two "8rupia.in" lines
cloudflared tunnel ingress validate
systemctl reload cloudflared

# Stop services
systemctl disable --now 8rupia-web 8rupia-workers
docker compose -f /var/www/8rupia/docker-compose.prod.yml down
```

vidyt.com and aapkaplot.com remain unaffected.
