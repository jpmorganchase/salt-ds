# Plan 007: Align the declared and tested Floating UI version

> **Executor instructions**: Follow this plan step by step, run every verification command, honor STOP conditions, and update this plan's row in `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- package.json yarn.lock packages/date-components/package.json packages/date-components/src/date-picker packages/date-components/src/__tests__`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

Date components declare `@floating-ui/react ^0.26.28`, while the root resolution forces `^0.27.19`. Workspace tests therefore exercise a contract consumers are not told to install.

## Current state

- `packages/date-components/package.json:19` declares `^0.26.28`.
- `packages/core/package.json:20` and `packages/lab/package.json:19` declare `^0.27.19`.
- `package.json:109` forces all requests to `^0.27.19`.
- Date overlays use `useClick`, `useDismiss`, `useInteractions`, and Floating UI context types.

## Commands you will need

| Purpose         | Command                                                                                                                                    | Expected |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Lock validation | `yarn install --immutable`                                                                                                                 | exit 0   |
| Date Cypress    | `yarn cypress run --component --browser chrome --headless --spec "packages/date-components/src/__tests__/__e2e__/date-picker/**/*.cy.tsx"` | all pass |
| Build/typecheck | `yarn workspace @salt-ds/date-components build && yarn typecheck`                                                                          | exit 0   |

## Scope

**In scope**: root resolution/lockfile, date-components metadata, date overlay adaptations, and date tests.

**Out of scope**: every `packages/lab/**` file, unrelated dependencies, and overlay redesign. Lab's existing 0.27 declaration is context only and must not be edited by this plan.

## Git workflow

Use the operator's branch or `codex/007-floating-ui`; keep lockfile changes limited to this migration. Do not push or open a PR unless instructed.

## Steps

1. Read the official 0.27 migration notes and inventory each date-components API use. Record any behavioral breaking change in the PR description.
2. Add/confirm tests for click, dismiss, focus-out, Escape, outside press, controlled/uncontrolled open, and positioning.
3. Update date-components to the verified 0.27 range. Remove the broad root resolution if all consumers now declare compatible ranges; otherwise narrow it and document why.
4. Run immutable install, focused Cypress, build, and typecheck.

## Test plan

Use existing date-picker Cypress specs as the pattern. Cover controlled/uncontrolled open, trigger click, ArrowDown, Escape, focus-out, outside press, focus restoration, and positioning before changing the dependency range.

## Done criteria

- [ ] No workspace is tested against a Floating UI version outside its declared range.
- [ ] Root override is removed or narrowly justified.
- [ ] Overlay interaction tests, build, and typecheck pass.

## STOP conditions

- A required 0.27 change alters a public date-picker contract.
- Another transitive package requires the broad override; report its exact dependency path.

## Maintenance notes

For 0.x dependencies, treat minor-version alignment as a migration and keep manifest ranges equal to tested ranges.
