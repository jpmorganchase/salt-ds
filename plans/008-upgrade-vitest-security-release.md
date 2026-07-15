# Plan 008: REJECTED — Vitest upgrade is owned elsewhere

> **Executor instructions**: Do not execute this plan. The maintainer confirmed
> that the Vitest security upgrade is being handled in another workstream.
>
> **Drift check if reconciled**: `git diff --stat 338971164..HEAD -- package.json yarn.lock vite.config.ts`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: rejected
- **Planned at**: commit `338971164`, 2026-07-12
- **Disposition**: REJECTED as duplicate ownership, 2026-07-12

## Why this was rejected

Vitest 4.0.1 is in the affected range for GHSA-5xrq-8626-4rwp, but another
workstream owns the upgrade. A second executor would create redundant lockfile
churn and conflict risk.

## Scope if reconciled

After the external change lands, verify the resolved version is at least 4.1.0,
the advisory is absent, and `yarn test --run` plus `yarn typecheck` pass.

## Git workflow

No branch/commit is required from this plan. If the other work is abandoned,
reactivate on `codex/008-vitest-security`; do not push/open a PR unless
instructed.

## Reconciliation steps

1. Inspect the external upgrade and lockfile resolution.
2. Run the full Vitest suite, typecheck, and dependency audit.
3. Mark this record DONE if the advisory is gone; otherwise reactivate it for
   the exact residual issue.

## Test plan

No duplicate tests now. Reconciliation requires the complete Vitest suite and
an audit proving GHSA-5xrq-8626-4rwp is absent.

## Done criteria

- [x] Duplicate implementation ownership is prevented.
- [ ] External work resolves Vitest to a patched version and passes gates.

## STOP conditions

- The other Vitest upgrade remains active.
- A second change would touch the same manifest/lockfile.

## Maintenance notes

Reconcile after the external change rather than reopening from stale audit
state.

