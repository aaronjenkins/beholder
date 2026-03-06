#!/usr/bin/env bash
set -euo pipefail

# One-time git-history secret scanner.
# Requires: git available and repository with history.
# Usage: ./scripts/find_secrets_git.sh

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
cd "$REPO_ROOT"

echo "Scanning current working tree for common secret patterns..."

patterns=(
  "AIza[0-9A-Za-z-_]{35}"        # Google API key
  "AKIA[0-9A-Z]{16}"             # AWS access key id
  "ASIA[0-9A-Z]{16}"             # AWS temporary
  "BEGIN RSA PRIVATE KEY"        # Private keys
  "ssh-rsa"                      # public keys (less critical)
  "SECRET|secret|STYTCH_SECRET|ADMIN_SECRET|API_KEY|YT_KEY"
  "[0-9a-f]{32,}"                # long hex tokens
)

for p in "${patterns[@]}"; do
  echo
  echo "Pattern: $p"
  git grep -n -E "$p" -- ':(exclude)node_modules' || true
done

echo
echo "Searching commit history for patterns (this may take a while)..."

# Search history via git log -p
for p in "${patterns[@]}"; do
  echo
  echo "History pattern: $p"
  # Show matching commits with filenames and snippets
  git log -S"$p" --pretty=format:"%h %an %ad" --all || true
  # Fallback grep in diffs (broader but slower)
  git log -p --all | grep -n --color=always -E "$p" || true
done

echo
echo "Scan complete. If you find secrets, rotate them immediately and follow docs/rotate_keys.md."
echo "Consider using specialized tools (git-secrets, truffleHog) for deeper scanning." 
