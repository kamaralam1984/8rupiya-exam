#!/usr/bin/env bash
# 8rupia.in — VPS installer
#
# Run this on the Hostinger VPS (Ubuntu 22.04). It is IDEMPOTENT and SAFE:
# - Won't touch vidyt.com / aapkaplot.com nginx configs.
# - Won't restart nginx (only reload).
# - Won't touch system-wide PostgreSQL/Redis (uses Docker on 127.0.0.1:55432 / 127.0.0.1:56379).
# - 8rupia Next app runs on 127.0.0.1:8021 — no port collision.
#
# Usage (as a user with sudo):
#   sudo bash deploy/scripts/install.sh

set -euo pipefail

REPO_DIR="/var/www/8rupia"
SYSTEMD_DIR="/etc/systemd/system"
NGINX_AVAILABLE="/etc/nginx/sites-available/8rupia.in"
NGINX_ENABLED="/etc/nginx/sites-enabled/8rupia.in"
DEPLOY_USER="${DEPLOY_USER:-deploy}"

log() { printf "\033[1;36m▶ %s\033[0m\n" "$*"; }
warn() { printf "\033[1;33m! %s\033[0m\n" "$*"; }
fail() { printf "\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

if [[ $EUID -ne 0 ]]; then fail "Run with sudo."; fi
if [[ ! -d "$REPO_DIR" ]]; then fail "Repo not found at $REPO_DIR. Clone first."; fi

# 1. Deploy user
if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
  log "Creating user '$DEPLOY_USER'"
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG docker "$DEPLOY_USER" 2>/dev/null || true
fi
chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$REPO_DIR"

# 2. Node + tools
if ! command -v node >/dev/null; then
  log "Installing Node 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
if ! command -v docker >/dev/null; then
  log "Installing Docker"
  curl -fsSL https://get.docker.com | bash
  systemctl enable --now docker
  usermod -aG docker "$DEPLOY_USER" || true
fi
if ! command -v nginx >/dev/null; then
  warn "nginx not installed — installing"
  apt-get install -y nginx
fi
if ! command -v certbot >/dev/null; then
  log "Installing certbot"
  apt-get install -y certbot python3-certbot-nginx
fi

# 3. .env.production check
if [[ ! -f "$REPO_DIR/.env.production" ]]; then
  fail "Missing $REPO_DIR/.env.production — copy .env.local + edit DATABASE_URL/REDIS_URL/JWT_SECRET/API keys"
fi
chmod 600 "$REPO_DIR/.env.production"
chown "$DEPLOY_USER":"$DEPLOY_USER" "$REPO_DIR/.env.production"

# 4. Postgres + Redis via docker compose (ports 127.0.0.1:55432 / 56379)
log "Starting Postgres + Redis containers"
cd "$REPO_DIR"
sudo -u "$DEPLOY_USER" docker compose -f docker-compose.prod.yml up -d

# 5. Install deps + build
log "npm ci"
sudo -u "$DEPLOY_USER" -H bash -c "cd $REPO_DIR && npm ci --no-audit --no-fund"
log "Prisma generate + db push"
sudo -u "$DEPLOY_USER" -H bash -c "cd $REPO_DIR && set -a && . ./.env.production && set +a && npx prisma generate && npx prisma db push --skip-generate"
log "Next.js build"
sudo -u "$DEPLOY_USER" -H bash -c "cd $REPO_DIR && set -a && . ./.env.production && set +a && npm run build"

# 6. Systemd units
log "Installing systemd units"
install -m 0644 "$REPO_DIR/systemd/8rupia-web.service" "$SYSTEMD_DIR/"
install -m 0644 "$REPO_DIR/systemd/8rupia-workers.service" "$SYSTEMD_DIR/"
systemctl daemon-reload
systemctl enable --now 8rupia-web.service 8rupia-workers.service

# 7. Nginx vhost (only this one site is touched)
log "Installing nginx vhost"
install -m 0644 "$REPO_DIR/deploy/nginx/8rupia.in.conf" "$NGINX_AVAILABLE"
ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
mkdir -p /var/www/letsencrypt
# nginx -t MUST pass before reload
if nginx -t 2>/dev/null; then
  systemctl reload nginx
  log "nginx reloaded"
else
  warn "nginx config test failed — NOT reloading. Fix the error and run: sudo nginx -t && sudo systemctl reload nginx"
fi

# 8. Health check
sleep 3
log "Health check"
if curl -fsS http://127.0.0.1:8021/api/health >/dev/null; then
  printf "\n\033[1;32m✓ 8rupia Web is up at http://127.0.0.1:8021\033[0m\n"
else
  warn "Web health check failed — check: sudo journalctl -u 8rupia-web -n 60"
fi

cat <<MSG

────────────────────────────────────────────────────────
NEXT STEPS
────────────────────────────────────────────────────────
1. Point DNS:        8rupia.in     A     187.127.148.237
                     www.8rupia.in A     187.127.148.237
   Wait 5-10 minutes for DNS to propagate (check: dig 8rupia.in +short).

2. Issue SSL (after DNS propagates):
     sudo certbot --nginx -d 8rupia.in -d www.8rupia.in --redirect --agree-tos -m you@example.com

3. Visit https://8rupia.in 🎉

4. Logs:
     sudo journalctl -u 8rupia-web -f
     sudo journalctl -u 8rupia-workers -f
     sudo tail -f /var/log/nginx/8rupia.in.access.log
────────────────────────────────────────────────────────
MSG
