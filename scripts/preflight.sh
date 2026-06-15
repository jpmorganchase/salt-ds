#!/usr/bin/env sh
# Runs the CI quality gates (mirrors gh actions jobs),
set -u
failed=0
results=""

run() {
  name="$1"; shift
  printf '\n\033[1m▶ %s\033[0m\n' "$name"
  if "$@"; then
    results="${results}\n  \033[32m✓\033[0m ${name}"
  else
    results="${results}\n  \033[31m✗\033[0m ${name}"
    failed=1
  fi
}

run "biome"      yarn biome ci
run "prettier"   yarn prettier:ci
run "stylelint"  yarn lint:style
run "spellcheck" yarn spellcheck
run "typecheck"  yarn typecheck

printf '\n\033[1mPreflight summary:\033[0m'
printf '%b\n\n' "$results"
exit "$failed"
