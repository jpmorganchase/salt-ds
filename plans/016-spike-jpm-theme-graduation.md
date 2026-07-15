# Plan 016: REJECTED FOR NOW — defer JPM Brand theme graduation

> **Executor instructions**: Do not execute this plan in the current planning
> horizon. The maintainer asked to ignore the graduation work for now.
>
> **Drift check if reconsidered**: `git diff --stat 338971164..HEAD -- site/docs/themes packages/core/src/salt-provider packages/theme/css`

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: none
- **Category**: rejected
- **Planned at**: commit `338971164`, 2026-07-12
- **Disposition**: REJECTED for current planning horizon, 2026-07-12

## Why this was rejected

JPM Brand is documented as the default long-term direction while its APIs
retain `Next` naming, but graduating providers, CSS paths, defaults, tokens,
and migration tooling is a major-release program. The maintainer does not want
to pursue it now, so retaining an active spike would distort the actionable
roadmap.

## Scope if reconsidered

Reopen only alongside an approved major-version/theme migration initiative.
The prior evidence remains a lead, not current execution authority.

## Git workflow

No branch/commit is required while rejected. If reactivated, use
`codex/016-jpm-theme-graduation`; do not mix the decision spike with a default
flip.

## Reconsideration steps

1. Confirm design/product approval for the JPM default end state.
2. Inventory Next/Legacy usage and deprecated token layers.
3. Rewrite the full decision/prototype/codemod plan against current source.

## Test plan

No tests now. A future prototype must cover nesting, SSR/hydration, style
injection, secondary windows, modes/densities, tokens, and visual baselines.

## Done criteria

- [x] Theme graduation is removed from the active roadmap.
- [ ] If reactivated, major-release sponsorship and current migration evidence exist.

## STOP conditions

- There is no approved major-release theme initiative.
- The work would only rename APIs without a complete migration contract.

## Maintenance notes

Do not allow the rejected plan to block unrelated theme maintenance.

