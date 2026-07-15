# Plan 010: Use owner-window APIs in core and date components

> **Executor instructions**: Follow this plan step by step, run every
> verification command, honor STOP conditions, and update this plan's row in
> `plans/README.md` when complete. Do not modify `packages/lab`; its Portal and
> observer findings are deliberately delayed.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- packages/date-components/src/date-picker packages/core/src/viewport packages/core/src/breakpoints packages/core/src/utils/useResizeObserver.ts packages/core/src/__tests__ packages/date-components/src/__tests__ packages/window/src`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: tech-debt, bug
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

Salt publishes `@salt-ds/window`, but stable core/date paths still read ambient
`document`, `window`, `HTMLInputElement`, or `requestAnimationFrame`. In a
secondary window those globals refer to the opener, causing incorrect focus,
breakpoints, viewport width, and resize scheduling. The related lab Portal and
observer duplication are real but intentionally excluded until lab work is
prioritized.

## Current state

- `packages/date-components/src/date-picker/DatePickerOverlayProvider.tsx:172,179,212`
  uses global active-element and input-constructor state.
- `packages/date-components/src/date-picker/useFocusOut.ts:50-52` compares tab
  boundaries with global `document.activeElement`.
- `packages/core/src/viewport/ViewportProvider.tsx:28-29` observes global
  `document.body`.
- `packages/core/src/breakpoints/BreakpointProvider.tsx:38-52` uses global
  `window.matchMedia`.
- `packages/core/src/utils/useResizeObserver.ts:16-28` creates ResizeObserver
  from `ownerWindow(element)` but schedules ambient `requestAnimationFrame` and
  does not cancel queued frames.
- Use the iframe + `WindowProvider` pattern in
  `packages/core/src/__tests__/__e2e__/salt-provider/SaltProvider.cy.tsx:307-313`.

## Commands you will need

| Purpose | Command | Expected |
| --- | --- | --- |
| Core Cypress | `yarn cypress run --component --browser chrome --headless --spec "packages/core/src/__tests__/**/*{viewport,breakpoint}*.cy.tsx"` | matched specs pass |
| Date Cypress | `yarn cypress run --component --browser chrome --headless --spec "packages/date-components/src/__tests__/**/date-picker/*.cy.tsx"` | matched specs pass |
| Typecheck | `yarn typecheck` | exit 0 |
| Unit tests | `yarn test --run` | all pass |

## Suggested executor toolkit

Use `vercel-react-best-practices` if available for effect lifecycle and
observer ownership.

## Scope

**In scope**: the cited core/date production files, direct owner-window
helpers, and focused core/date tests.

**Out of scope**: all `packages/lab/**` files, lab Portal SSR behavior, lab
ResizeObserver consolidation, Electron IPC/window code, responsive algorithms,
and public breakpoint values.

## Git workflow

Use the operator's branch or `codex/010-window-ownership`. Keep the test fixture,
date focus, providers, and core observer changes reviewable. Do not push/open a
PR unless instructed.

## Steps

### Step 1: Build one reusable secondary-window test fixture

Adapt the existing iframe + `WindowProvider` pattern. Expose the child
`document`, controlled body width, child `matchMedia`, active element,
ResizeObserver, and animation-frame spies.

**Verify**: a self-test proves opener and child signals change independently.

### Step 2: Correct date-picker focus ownership

Resolve active element and input constructor from the reference/trigger owner
document and `defaultView`. Retain and clear focus-selection/blur timers on
unmount. Preserve controlled/uncontrolled open behavior.

**Verify**: Tab, Shift+Tab, Escape, outside press, close focus restoration, and
input selection pass in the child window.

### Step 3: Correct viewport and breakpoint ownership

Use the active WindowProvider target for body measurement, ResizeObserver, and
`matchMedia`. Preserve inherited-provider behavior and SSR defaults.

**Verify**: child resize changes child values only; opener resize does not.

### Step 4: Harden the core ResizeObserver utility

Schedule and cancel through `win.requestAnimationFrame`, retain the frame ID,
and disconnect on cleanup. Preserve callback timing and public hook signature.

**Verify**: tests cover queued-frame cancellation, unmount, empty entries, and
a closed/secondary window.

## Test plan

Add focused Cypress coverage for child-window focus traversal/restoration,
child-only breakpoints/viewport, owner-window constructors, RAF cancellation,
and unmount. Do not import or characterize lab implementations in this plan.

## Done criteria

- [ ] Cited core/date paths use their element/provider owner window.
- [ ] Date focus behavior works in a secondary document.
- [ ] Viewport/breakpoints react only to their target window.
- [ ] Core ResizeObserver cancels queued owner-window frames on cleanup.
- [ ] No `packages/lab` file is modified.
- [ ] Focused Cypress, typecheck, and unit tests pass.

## STOP conditions

- WindowProvider cannot represent the needed document during SSR/hydration.
- Fixing stable paths requires modifying a lab component.
- A supported-browser/React compatibility change is required beyond localized
  owner-window lookup.

## Maintenance notes

Every DOM constructor and scheduler must come from the same owner window as the
element it operates on. Lab Portal/observer cleanup remains deliberately
delayed and should be reconsidered only with broader lab prioritization.

