# Plan 014: REJECTED FOR NOW — daily React canary coverage already exists

> **Executor instructions**: Do not execute this plan now. The repository
> already builds packages and runs Cypress against React canary every day.
> Reconsider only when a concrete stable-major support failure or policy need
> appears.
>
> **Drift check if reconsidered**: `git diff --stat 338971164..HEAD -- packages/*/package.json site/package.json yarn.lock .github/workflows/test.yml .github/workflows/react-cron.yml`

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: none
- **Category**: rejected
- **Planned at**: commit `338971164`, 2026-07-12
- **Disposition**: REJECTED for current planning horizon, 2026-07-12

## Why this was rejected

The audit proposed a formal stable React 19 lane and support-policy project.
Current repository evidence materially reduces its urgency:

- `.github/workflows/react-cron.yml:4-5` schedules the workflow daily.
- Line 30 installs `react@canary` and `react-dom@canary`.
- Lines 31-36 build all packages and run Cypress component tests.

Canary is not identical to a pinned stable React 19 contract and does not by
itself prove every public peer range forever. It does, however, provide strong
forward-compatibility warning. Without a concrete consumer failure or an
imminent decision to drop React 16/17, a large policy/migration project is not
proportional now.

## Scope if reconsidered

First identify the trigger: stable React 19 differs from canary, site/Mosaic
fails, a consumer reports a break, or maintainers intend to change the support
floor. Only then define clean stable-major fixtures and peer-range changes.

## Git workflow

No branch/commit is required while rejected. If reactivated, use
`codex/014-react-policy`; commit evidence/decision before migration changes.

## Reconsideration steps

1. Confirm daily canary is green and required owners see failures.
2. Reproduce the concrete stable-major or peer-graph problem.
3. Decide whether the remedy is a pinned React 19 lane, site dependency
   alignment, or a formal support-floor decision.

## Test plan

No new tests now. React support changes must use clean built-package fixtures,
SSR/hydration, portals, style injection, overlays, and the existing Cypress
matrix.

## Done criteria

- [x] Daily React canary build/Cypress coverage is recorded.
- [x] No speculative major support-policy project remains active.
- [ ] If reactivated, a concrete trigger and stable-major reproduction exist.

## STOP conditions

- Daily canary remains green and there is no concrete stable React failure.
- The proposal is only to duplicate canary with another broad matrix lane.

## Maintenance notes

Canary is early warning, not a formal support promise. Revisit when changing
the minimum/maximum supported React majors or when stable behavior diverges.

