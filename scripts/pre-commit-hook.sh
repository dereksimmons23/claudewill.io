#!/bin/sh
# Pre-commit hook — claudewill.io
#
# Blocks sensitive files and large files from being committed.
# Install: cp scripts/pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
#
# The overnight housekeeping agent catches drift.
# This hook prevents the worst offenses from entering git at all.

BLOCKED=""

# Get staged files (added, copied, modified — not deleted)
STAGED=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null)

if [ -z "$STAGED" ]; then
  exit 0
fi

# ── Block sensitive file patterns ──

for file in $STAGED; do
  case "$file" in
    strategies/*)
      BLOCKED="$BLOCKED\n  $file — client-confidential documents"
      ;;
    clients/*)
      BLOCKED="$BLOCKED — client work directory"
      ;;
    .env|.env.*|*.env)
      BLOCKED="$BLOCKED\n  $file — environment variables"
      ;;
    ea.html)
      BLOCKED="$BLOCKED\n  $file — deprecated client page"
      ;;
    netlify/anthropic-key.txt|netlify/*.txt)
      BLOCKED="$BLOCKED\n  $file — secrets"
      ;;
  esac
done

# ── Block large files (>5MB) ──

for file in $STAGED; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file" 2>/dev/null | tr -d ' ')
    if [ "$SIZE" -gt 5242880 ] 2>/dev/null; then
      MB=$(echo "scale=1; $SIZE / 1048576" | bc 2>/dev/null || echo "?")
      BLOCKED="$BLOCKED\n  $file — ${MB}MB (add to .gitignore)"
    fi
  fi
done

# ── Report ──

if [ -n "$BLOCKED" ]; then
  echo ""
  echo "BLOCKED — sensitive or oversized files staged for commit:"
  printf "$BLOCKED\n"
  echo ""
  echo "Fix: git reset HEAD <file> to unstage, then add to .gitignore."
  echo "Bypass: git commit --no-verify (not recommended)."
  echo ""
  exit 1
fi

exit 0
