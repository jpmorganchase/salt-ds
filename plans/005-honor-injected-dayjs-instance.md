# Plan 005: Route every Day.js adapter operation through the injected factory

> **Executor instructions**: Follow this plan step by step, run every verification command, honor STOP conditions, and update this plan's row in `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- packages/date-adapters/src/dayjs-adapter packages/date-adapters/src/__tests__/dayjs.spec.ts`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

`AdapterDayjs` accepts a custom factory but its system/default timezone paths use the imported global singleton. Consumers using isolated plugins/locales therefore get mixed behavior from one adapter instance.

## Current state

- Constructor at `dayjs-adapter/index.ts:63-73` stores `this.dayjs = instance || defaultDayjs`.
- `resolveTimezone` and `createSystemDate` at lines 86-109 call `defaultDayjs.tz.guess()`, `defaultDayjs.tz(...)`, and `defaultDayjs(...)` after checking capabilities on `this.dayjs`.
- Existing adapter unit style is `packages/date-adapters/src/__tests__/dayjs.spec.ts`; use observable custom-factory behavior, not implementation mocks.

## Commands you will need

| Purpose       | Command                                                              | Expected |
| ------------- | -------------------------------------------------------------------- | -------- |
| Focused tests | `yarn test --run packages/date-adapters/src/__tests__/dayjs.spec.ts` | all pass |
| Typecheck     | `yarn typecheck`                                                     | exit 0   |

## Scope

**In scope**: Day.js adapter implementation/types and its tests. **Out of scope**: other adapters, changing public date semantics, or upgrading Day.js.

## Git workflow

Use the operator's branch or `codex/005-dayjs-instance`; use an imperative commit subject. Do not push or open a PR unless instructed.

## Steps

1. Add tests with global and injected factories configured observably differently. Cover `default`, `system`, `UTC`, explicit IANA timezone, locale, `today`, and `now`.
   **Verify**: tests expose only the global-leak cases.
2. Replace global singleton operations after construction with `this.dayjs`. Refine `Constructor` so timezone `guess` and factory calls are typed rather than cast. Preserve default singleton plugin extension when no instance is supplied.
   **Verify**: focused tests pass in at least UTC and one non-UTC timezone configuration.
3. Run full adapter tests and typecheck.
   **Verify**: `yarn test --run packages/date-adapters && yarn typecheck` exits 0.

## Test plan

Model additions on `packages/date-adapters/src/__tests__/dayjs.spec.ts`. Cover default and injected factories across default/system/UTC/IANA zones, locale behavior, DST boundaries, `today`, and `now`.

## Done criteria

- [ ] `defaultDayjs` is used only for default initialization/plugin setup, not instance operations.
- [ ] Custom-instance timezone and locale behavior is tested.
- [ ] Existing epoch/DST expectations remain unchanged for the default adapter.

## STOP conditions

- Day.js cannot provide an isolated factory with the required plugins through the supported API.
- Correcting the leak changes documented timezone semantics; report affected cases before proceeding.

## Maintenance notes

Review every new adapter method for accidental imports of the singleton; operational methods should use `this.dayjs` exclusively.
