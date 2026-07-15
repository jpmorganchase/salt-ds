# Plan 011: Restore deterministic Spinner completion-announcement coverage

> **Executor instructions**: Follow this plan step by step, run every verification command, honor STOP conditions, and update this plan's row in `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- packages/core/src/spinner/Spinner.tsx packages/core/src/__tests__/__e2e__/spinner/Spinner.accessibility.cy.tsx cypress/support`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

Spinner announces progress and cleanup completion on an accessibility-critical core path, but all completion/opt-out/null-message tests are skipped. The remaining test waits five real seconds, making it slow and timing-sensitive.

## Current state

- `Spinner.tsx:95-123` schedules repeated announcements and announces completion in effect cleanup unless disabled/null.
- `Spinner.accessibility.cy.tsx:36-54` skips unmount completion, `disableAnnouncer`, and null completion tests.
- Lines 27-34 use a real `cy.wait(5000)`.
- Use current Cypress React unmount APIs rather than `ReactDOM.unmountComponentAtNode`.

## Commands you will need

| Purpose   | Command                                                                                                                                      | Expected                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Cypress   | `yarn cypress run --component --browser chrome --headless --spec "packages/core/src/__tests__/__e2e__/spinner/Spinner.accessibility.cy.tsx"` | all tests pass, none skipped |
| Typecheck | `yarn typecheck`                                                                                                                             | exit 0                       |

## Scope

Spinner accessibility spec and implementation only if enabled characterization proves a defect. Do not alter announcement wording/durations without a separate documented accessibility decision.

## Git workflow

Use the operator's branch or `codex/011-spinner-announcements`; keep runtime changes separate from test modernization if both are required. Do not push/open a PR unless instructed.

## Steps

1. Replace real time with `cy.clock`/`cy.tick` and use the supported mount result/unmount API.
2. Enable all three skipped tests. Assert start/progress/completion ordering, exactly-once cleanup, disabled behavior, null completion, and no post-unmount timers.
3. If implementation fails, make the smallest timer/cleanup correction consistent with `AriaAnnouncerProvider` ownership; do not redesign announcements.
4. Run focused Cypress and typecheck.

## Test plan

Use the existing Spinner accessibility spec and Cypress announcement helper. Cover progress timing, unmount completion exactly once, `disableAnnouncer`, null completion, and absence of pending post-unmount work with controlled clocks.

## Done criteria

- [ ] No `it.skip` remains in this spec.
- [ ] No five-second real wait remains.
- [ ] Completion and both opt-out modes are asserted.
- [ ] Focused Cypress and typecheck pass.

## STOP conditions

- Cypress announcement helper cannot observe cleanup with current React mounting; report the infrastructure limitation before changing runtime behavior.
- Existing public docs contradict the asserted completion wording.

## Maintenance notes

Keep timer-driven accessibility tests on controlled clocks to prevent CI runtime and flake growth.
