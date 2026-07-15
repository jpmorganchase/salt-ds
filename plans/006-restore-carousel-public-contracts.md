# Plan 006: Restore Carousel DOM, event, and runtime-peer contracts

> **Executor instructions**: Follow this plan step by step, run every verification command, honor STOP conditions, and update this plan's row in `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- packages/embla-carousel/src/Carousel.tsx packages/embla-carousel/src/CarouselSlides.tsx packages/embla-carousel/package.json packages/embla-carousel/src/__tests__`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: Plan 001 for final consumer-package smoke coverage
- **Category**: bug, migration
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

`CarouselProps` inherits section props but consumes `id` without rendering it. `CarouselSlides` invokes `rest.onMouseDown`/`onMouseUp` inside wrappers, then spreads `rest` afterward so consumer handlers replace those wrappers. Finally, the root entry imports `embla-carousel-react` unconditionally while metadata marks it optional.

## Current state

- `Carousel.tsx:65-82` removes `id` and derives `carouselId`; the `<section>` at 110-117 has no `id`.
- `CarouselSlides.tsx:259-279` defines internal pointer wrappers, then `{...rest}` overwrites them.
- `package.json:26-38` marks `embla-carousel-react` optional; `Carousel.tsx:5-7` imports it unconditionally.
- Match event composition patterns where user callbacks run without replacing internal state, e.g. core input/button handlers.

## Commands you will need

| Purpose   | Command                                                                                                     | Expected |
| --------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| Cypress   | `yarn cypress run --component --browser chrome --headless --spec "packages/embla-carousel/src/**/*.cy.tsx"` | all pass |
| Build     | `yarn workspace @salt-ds/embla-carousel build`                                                              | exit 0   |
| Typecheck | `yarn typecheck`                                                                                            | exit 0   |

## Scope

Only Carousel, CarouselSlides, package metadata, and focused tests. Do not change Embla versions, carousel keyboard design, slide announcements, or CSS visuals.

## Git workflow

Use the operator's branch or `codex/006-carousel-contracts`; use an imperative commit subject. Do not push or open a PR unless instructed.

## Steps

1. Test explicit/generated section IDs and both internal drag class transitions plus consumer mouse callbacks.
   **Verify**: explicit-ID and callback-composition assertions fail before the fix.
2. Render the stable `carouselId` on the section. Destructure mouse callbacks, spread ordinary props before internal handlers, and compose each callback exactly once.
   **Verify**: DOM and event tests pass.
3. Remove `embla-carousel-react` from optional peer metadata. Extend Plan 001's consumer smoke to prove a missing required peer is diagnosed and a valid install imports the root entry.
   **Verify**: workspace build and artifact smoke pass.

## Test plan

Add focused Carousel Cypress cases for explicit/generated IDs, mouse down/up internal state, consumer callback composition, and root import with the required peer. Preserve existing keyboard/announcement coverage.

## Done criteria

- [ ] Explicit IDs reach the `<section>` and generated IDs are stable.
- [ ] Internal and consumer mouse handlers both run once.
- [ ] Required runtime peer is not optional.
- [ ] Cypress, build, typecheck, and consumer smoke pass.

## STOP conditions

- Existing public docs promise that section `id` is reserved exclusively for child ID generation.
- Consumer callbacks intentionally replace internal drag behavior and tests prove this contract.

## Maintenance notes

When forwarding native props, destructure every prop with internal behavior and spread remaining props before composed handlers.
