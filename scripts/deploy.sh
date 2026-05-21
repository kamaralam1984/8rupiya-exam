#!/usr/bin/env bash
# VPS deploy script for 8Rupia.
# Run from /var/www/8rupia (or wherever your app root is).
# Idempotent: keeps .env.production, swaps everything else.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/8rupia}"
BRANCH="${BRANCH:-main}"
TARBALL_URL="${TARBALL_URL:-https://github.com/kamaralam1984/8rupiya-exam/archive/refs/heads/${BRANCH}.tar.gz}"

echo "==> Deploying $TARBALL_URL → $APP_DIR"
cd "$APP_DIR"

# 1. Download new code
wget -q "$TARBALL_URL" -O /tmp/v.tar.gz

# 2. Preserve env
test -f .env.production && cp .env.production /tmp/env.bak

# 3. Extract (--strip-components=1 unwraps the GitHub top-dir like "8rupiya-exam-main/")
tar -xzf /tmp/v.tar.gz --strip-components=1 --exclude='.env.production'

# 4. Restore env
test -f /tmp/env.bak && cp /tmp/env.bak .env.production

# 5. Source env vars for prisma + build
set -a
. ./.env.production
set +a

# 6. Install deps (no dev audit noise)
npm install --no-audit

# 7. Prisma — generate + push schema
npx prisma generate
npx prisma db push --skip-generate

# 7b. Seed exam catalog (NEET, CTET, SSC, etc.). The seed script uses
#     upserts and findFirst-then-create checks, so running it on every
#     deploy is idempotent: existing rows are preserved, only missing
#     ones get inserted.
echo "==> Running seed (idempotent)…"
npm run db:seed || echo "==> Seed step failed (non-fatal) — continuing deploy."

# 8. Build Next.js
npm run build

# 9. Restart systemd services (web + workers)
sudo systemctl restart 8rupia-web 8rupia-workers

echo "==> Deploy complete: $(git log --oneline -1 2>/dev/null || echo "(no git)")"
