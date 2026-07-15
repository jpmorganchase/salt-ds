# Plan 013: Make core list-control typeahead linear

> **Executor instructions**: Follow this plan step by step, run every
> verification command, honor STOP conditions, and update this plan's row in
> `plans/README.md` when complete. Do not modify the related lab responsive
> overflow reducer; that optimization is deliberately delayed.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- packages/core/src/list-control/ListControlState.ts packages/core/src/__tests__`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

Core list typeahead filters the option registry and then linearly searches that
registry again for each matching candidate. This is O(n²) per keystroke in a
large collection. The lab responsive overflow reducer has a similar pattern,
but all lab runtime changes are outside the active planning horizon.

## Current state

- `packages/core/src/list-control/ListControlState.ts:239-242` implements
  `getIndexOfOption` with `findIndex`.
- Lines 252-286 filter the full list and call `getIndexOfOption` inside
  `matches.find`.
- Preserve value equality, document order, search start, repeated-character,
  and no-match behavior.

## Commands you will need

| Purpose | Command | Expected |
| --- | --- | --- |
| Focused tests | `yarn test --run packages/core/src/list-control packages/core/src/__tests__` | matched tests pass |
| Core Cypress | `yarn cypress run --component --browser chrome --headless --spec "packages/core/src/__tests__/**/*{list-box,combo-box,dropdown}*.cy.tsx"` | matched specs pass |
| Typecheck | `yarn typecheck` | exit 0 |

## Scope

**In scope**: core `ListControlState.ts` and focused core tests/operation-count
fixture.

**Out of scope**: every `packages/lab/**` file, `OverflowReducer.ts`, list
registration redesign, virtualization, responsive layout, and public APIs.

## Git workflow

Use the operator's branch or `codex/013-linear-typeahead`; use an imperative
commit subject. Do not push/open a PR unless instructed.

## Steps

1. Add behavior tests for late `startFrom`, wraparound, repeated characters,
   disabled/no-match cases, and duplicate values.
   **Verify**: tests pass against current observable behavior.
2. Rewrite `getOptionFromSearch` as a single indexed scan from `startIndex`
   with explicit wrap semantics; avoid candidate-to-registry lookup.
   **Verify**: focused behavior tests pass.
3. Add deterministic operation-count evidence at representative small/large
   sizes; avoid wall-clock assertions.
   **Verify**: lookup/comparison count scales linearly.
4. Run focused Cypress, unit tests, and typecheck.

## Test plan

Cover search start/wrap/repeated characters/no match/disabled options/duplicate
values and ordering. Use operation counts rather than millisecond thresholds.
No lab tests or files belong in this plan.

## Done criteria

- [ ] No `getIndexOfOption` call occurs inside a candidate scan.
- [ ] Search behavior remains characterized and green.
- [ ] Operation-count evidence demonstrates linear scaling.
- [ ] No `packages/lab` file is modified.
- [ ] Focused tests and typecheck pass.

## STOP conditions

- Option values are intentionally non-unique and current identity semantics
  cannot be preserved by indexed scanning.
- A fix requires list registration/public API changes.
- Work expands into the lab overflow implementation.

## Maintenance notes

The lab `overflowItems.find`-inside-`items.map` finding remains valid but delayed.
Revisit only when lab modernization is explicitly prioritized.

