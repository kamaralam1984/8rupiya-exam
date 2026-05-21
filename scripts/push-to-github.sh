#!/usr/bin/env bash
# Local → GitHub push helper.
# Stages everything, commits, and pushes to the current branch's remote.
# Usage:
#   npm run deploy                  # auto commit message (timestamp)
#   npm run deploy -- "my message"  # custom commit message
#   bash scripts/push-to-github.sh "my message"
set -euo pipefail

# Color helpers
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}▶${NC} $*"; }
ok()      { echo -e "${GREEN}✓${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC} $*"; }
err()     { echo -e "${RED}✗${NC} $*" >&2; }

# Move to repo root (so script works no matter where it was called from)
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  err "Not inside a git repository."
  exit 1
fi
cd "$REPO_ROOT"

# Sanity: remote must exist
if ! git remote get-url origin >/dev/null 2>&1; then
  err "No 'origin' remote configured. Add one with:"
  echo "    git remote add origin <github-url>"
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REMOTE_URL="$(git remote get-url origin)"
info "Repo:    $REPO_ROOT"
info "Branch:  $BRANCH"
info "Remote:  $REMOTE_URL"
echo ""

# 1. Stage all changes (respects .gitignore)
info "Staging all changes..."
git add -A

# 2. Check if anything is actually staged
if git diff --cached --quiet; then
  warn "No changes to commit. Working tree is clean."
  # Still try to push in case local is ahead of remote
  info "Checking if local is ahead of origin/$BRANCH..."
  git fetch origin "$BRANCH" --quiet || true
  AHEAD="$(git rev-list --count "origin/$BRANCH..HEAD" 2>/dev/null || echo 0)"
  if [[ "$AHEAD" -gt 0 ]]; then
    info "Local is $AHEAD commit(s) ahead. Pushing..."
    git push origin "$BRANCH"
    ok "Pushed to origin/$BRANCH"
  else
    ok "Already in sync with origin/$BRANCH. Nothing to do."
  fi
  exit 0
fi

# 3. Build commit message
MSG="${1:-}"
if [[ -z "$MSG" ]]; then
  TS="$(date '+%Y-%m-%d %H:%M')"
  MSG="chore: deploy $TS"
fi
info "Commit message: \"$MSG\""

# 4. Show summary of what's being committed
echo ""
info "Files in this commit:"
git diff --cached --name-status | sed 's/^/    /'
echo ""

# 5. Commit
git commit -m "$MSG"
ok "Commit created."

# 6. Push (sets upstream automatically if first push)
info "Pushing to origin/$BRANCH..."
if git push -u origin "$BRANCH"; then
  ok "Pushed to GitHub successfully."
else
  err "Push failed. Common fixes:"
  echo "    • If remote has new commits: git pull --rebase origin $BRANCH"
  echo "    • If auth fails: configure a Personal Access Token or SSH key"
  exit 1
fi

# 7. Show the GitHub link to the latest commit
SHA="$(git rev-parse HEAD)"
HTTPS_URL="$(echo "$REMOTE_URL" | sed -E 's#git@github.com:#https://github.com/#; s#\.git$##')"
echo ""
ok "Done. View on GitHub:"
echo "    $HTTPS_URL/commit/$SHA"
