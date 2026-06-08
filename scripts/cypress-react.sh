#!/usr/bin/env bash
set -euo pipefail

# Run selected Cypress component tests against React 16/17/18 locally.
#   cypress-react.sh 16 packages/core/src/button/Button.cy.tsx   # one file
#   cypress-react.sh 17 packages/lab/src/combo-box               # a dir
#   cypress-react.sh 16 packages/core/src/button open            # interactive
#   cypress-react.sh reset                                       # back to React 18

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"

# reset: drop the pin (it lives in yarn.lock) and relink from the lockfile.
if [[ "${1:-}" == "reset" ]]; then
  git checkout HEAD -- yarn.lock
  yarn install --immutable --mode=skip-build
  exit 0
fi

REACT_VERSION="${REACT:-18}"
case "${1:-}" in 16 | 17 | 18) REACT_VERSION="$1"; shift ;; esac
SPEC_ARG="${1:?pass a spec file or directory (relative to repo root)}"
MODE="${2:-run}"

if [[ -d "$SPEC_ARG" ]]; then
  SPEC="${SPEC_ARG%/}/**/*.cy.{js,ts,jsx,tsx}"
else
  SPEC="$SPEC_ARG"
fi

if [[ "$REACT_VERSION" != "18" ]]; then
  yarn set resolution "react@npm:^18.0.0" "npm:^$REACT_VERSION"
  yarn set resolution "react-dom@npm:^18.0.0" "npm:^$REACT_VERSION"
fi

if [[ "$MODE" == "open" ]]; then
  yarn cypress open --component --browser electron
else
  yarn cypress run --component --browser electron --spec "$SPEC"
fi
