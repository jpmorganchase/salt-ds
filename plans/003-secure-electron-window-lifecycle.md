# Plan 003: REJECTED — ElectronWindow is the obsolete window mechanism

> **Executor instructions**: Do not execute this plan. The maintainer confirmed
> that `ElectronWindow` is the old mechanism. Reconsider only if repository
> evidence shows it remains supported or shipped to active consumers.
>
> **Drift check if reconsidered**: `git diff --stat 338971164..HEAD -- packages/lab/src/window packages/window/src site/docs`

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: rejected
- **Planned at**: commit `338971164`, 2026-07-12
- **Disposition**: REJECTED on maintainer evidence, 2026-07-12

## Why this was rejected

The audit found real render-phase, popup-denial, timer-ownership, and HTML
interpolation problems in `packages/lab/src/window/ElectronWindow.tsx`.
However, remediation has poor leverage if the component is an obsolete window
path. Fixing it would preserve legacy code and could distract from removing the
mechanism or hardening the current `@salt-ds/window` path.

## Scope if reconsidered

First determine whether `ElectronWindow` is exported, documented, packaged,
or used by supported consumers. Prefer deletion/deprecation planning over a
behavioral repair when compatibility policy allows it.

## Git workflow

No branch or commit is required while rejected. If reactivated, use
`codex/003-electron-window` and do not push/open a PR unless instructed.

## Reconsideration steps

1. Prove the old mechanism is still supported and cannot be removed.
2. Characterize its Electron host/IPC contract.
3. Rewrite this plan around either safe removal or the smallest required
   lifecycle/security repair.

## Test plan

No tests are required while rejected. A reactivated plan must cover popup
denial, literal title handling, StrictMode, IPC ordering, and timer cleanup.

## Done criteria

- [x] Maintainer identified the mechanism as obsolete.
- [x] Active plans no longer depend on this plan.
- [ ] If reactivated, current support evidence is recorded first.

## STOP conditions

- The mechanism remains obsolete or is already scheduled for deletion.
- Repair would extend its supported lifetime without a product decision.

## Maintenance notes

Do not re-audit legacy Electron details unless the support/removal decision
changes.

