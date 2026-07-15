# Plan 004: REJECTED — do not prioritize the lab ColorChooser

> **Executor instructions**: Do not execute this plan. The maintainer chose not
> to prioritize ColorChooser while it remains in `@salt-ds/lab`. Reconsider if
> the component is proposed for promotion, active adoption, or accessibility
> support commitments.
>
> **Drift check if reconsidered**: `git diff --stat 338971164..HEAD -- packages/lab/src/color-chooser packages/lab/src/__tests__ site/docs`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: rejected
- **Planned at**: commit `338971164`, 2026-07-12
- **Disposition**: REJECTED on maintainer prioritization, 2026-07-12

## Why this was rejected

The keyboard defect is genuine: the swatch checks `"ENTER"`, closes on every
key, and exposes a focusable unnamed `div`. The maintainer has nevertheless
chosen not to spend implementation capacity on this experimental lab surface.
That is a proportional product decision as long as the component is not being
promoted or presented as stable.

## Scope if reconsidered

Only reactivate when ColorChooser moves toward core/stability or usage evidence
justifies hardening. At that point, prefer a native named button/radio pattern
and focused keyboard/accessibility tests.

## Git workflow

No branch or commit is required while rejected. If reactivated, use
`codex/004-swatch-semantics` and do not push/open a PR unless instructed.

## Reconsideration steps

1. Confirm promotion/adoption/support intent.
2. Characterize the enclosing chooser's ARIA pattern.
3. Restore a full implementation plan with click, Enter, Space, Tab, naming,
   selected-state, and transparent-alpha tests.

## Test plan

No tests are required while rejected. Promotion readiness must include the
keyboard and accessible-name cases above.

## Done criteria

- [x] Maintainer accepted the lab-only risk.
- [x] Accessibility-conformance planning no longer depends on ColorChooser.
- [ ] If promoted, this defect is resolved before stable release.

## STOP conditions

- ColorChooser remains an unpromoted lab component with no active priority.
- A local fix would pre-empt a planned chooser redesign.

## Maintenance notes

Keep this finding visible in promotion criteria so experimental status does
not silently become stable debt.

