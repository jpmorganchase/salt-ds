#!/usr/bin/env bash
# Decide whether a Chromatic build is required for a commit on main.
#
# Usage:   should-skip-main-build.sh <parent_sha> <head_sha>
# Exits:   0 = skip Chromatic, 1 = run Chromatic
#
# When $GITHUB_STEP_SUMMARY is set, a summary block is appended to it.

set -euo pipefail

parent="${1:-}"
head_sha="${2:-}"

summary() {
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    printf '%s\n' "$1" >> "$GITHUB_STEP_SUMMARY"
  fi
}

if [ -z "$parent" ] || [ -z "$head_sha" ]; then
  echo "usage: $0 <parent_sha> <head_sha>" >&2
  exit 1
fi

# NOTE: do not use `git diff -z`. Bash $() command substitution silently
# strips NUL bytes, which would concatenate all filenames into one string
# and cause subtle false-skips.
if ! changed=$(git diff --name-only "$parent" "$head_sha" 2>/dev/null); then
  echo "Could not diff $parent..$head_sha; assuming Chromatic must run." >&2
  summary "### Chromatic decision: **run** _(diff failed)_"
  exit 1
fi

if [ -z "$changed" ]; then
  echo "No files changed between $parent and $head_sha; assuming Chromatic must run." >&2
  summary "### Chromatic decision: **run** _(empty diff)_"
  exit 1
fi

echo "Changed files between $parent and $head_sha:"
printf '%s\n' "$changed" | sed 's/^/  /'

# Paths that cannot affect Storybook output: four directory roots whose
# contents are never part of the visual build, plus LICENSE, plus any
# Markdown / MDX file. Storybook MDX in this codebase is documentation
# only (uses `<Canvas of={...} />` to embed stories defined in
# `.stories.tsx` files; no inline `<Story>` blocks).
allowlist_regex='^(\.changeset|\.github|site|cypress)/|^LICENSE$|\.mdx?$'

remaining=$(printf '%s\n' "$changed" | grep -Ev "$allowlist_regex" || true)

if [ -z "$remaining" ]; then
  echo "All changed files are in the non-visual allowlist; Chromatic will be SKIPPED."
  {
    echo "### Chromatic decision: **skip** _(non-visual main commit)_"
    echo ""
    echo "<details><summary>Changed files</summary>"
    echo ""
    echo '```'
    printf '%s\n' "$changed"
    echo '```'
    echo "</details>"
  } | { while IFS= read -r line; do summary "$line"; done; }
  exit 0
fi

echo "Files outside the allowlist (Chromatic will RUN):"
printf '%s\n' "$remaining" | sed 's/^/  /'
{
  echo "### Chromatic decision: **run**"
  echo ""
  echo '```'
  printf '%s\n' "$remaining"
  echo '```'
} | { while IFS= read -r line; do summary "$line"; done; }
exit 1






