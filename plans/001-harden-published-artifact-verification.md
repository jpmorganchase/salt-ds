# Plan 001: Make incomplete published artifacts fail before release

> **Executor instructions**: Follow each step and run every verification. Stop on any condition in **STOP conditions**; do not improvise. When complete, update this plan's row in `plans/README.md` unless a reviewer owns the index.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- package.json scripts/build.mjs scripts/makeTypings.mjs packages/icons/scripts/copyCss.mjs packages/countries/scripts/copyCss.mjs .github/workflows/test.yml`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug, tests
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

Package builds currently have three false-success paths: declaration diagnostics are skipped in CI, required icon/country CSS copy errors are swallowed, and the workflow checks `dist/salt-ds-icon/package.json` although the package is emitted as `salt-ds-icons`. The workflow also never consumes packages exactly as npm users do. This plan makes artifact failure observable and adds a clean consumer smoke gate covering manifests, CJS, ESM, declarations, CSS, and workspace-version rewrites.

## Current state

- `scripts/makeTypings.mjs:79-90` returns immediately when `isCI`, before `getPreEmitDiagnostics` and `emitResult.diagnostics` are checked.
- `packages/icons/scripts/copyCss.mjs:10-19` and `packages/countries/scripts/copyCss.mjs:10-24` catch copy errors and only log `err.message`.
- `.github/workflows/test.yml:69-74` greps the nonexistent singular path `dist/salt-ds-icon/package.json`.
- `scripts/build.mjs:82-128` creates preserved-module CJS/ESM/type trees and rewrites the publish manifest; tests inspect only a few dependency strings.
- Match the repository's existing build-script style in `scripts/build.mjs`: ESM, `node:` imports, explicit errors, and deterministic filesystem paths.

## Commands you will need

| Purpose        | Command                          | Expected on success                             |
| -------------- | -------------------------------- | ----------------------------------------------- |
| Typecheck      | `yarn typecheck`                 | exit 0                                          |
| Build          | `yarn build`                     | exit 0; all publish directories exist           |
| Unit tests     | `yarn test --run`                | all tests pass                                  |
| Artifact smoke | `yarn check:published-artifacts` | exit 0 with every publishable workspace checked |

## Scope

**In scope**: `package.json`, `scripts/makeTypings.mjs`, `scripts/build.mjs` only if a shared manifest helper is necessary, both `copyCss.mjs` files, `.github/workflows/test.yml`, and a new artifact-check script plus temporary fixture files under `scripts/` or `integration/`.

**Out of scope**: runtime component code, package API changes, publishing to npm, release workflow permissions, and generated `dist/` files in the commit.

## Git workflow

Use the operator's branch; if one must be created, use `codex/001-artifact-verification`. Match recent imperative commit subjects such as `Fix AriaAnnouncerProvider leaking setTimeout handles on unmount`. Do not push or open a PR unless instructed.

## Steps

### Step 1: Fail declaration generation on diagnostics in every environment

Move diagnostic collection and the throw outside the `isCI` return path. CI may use condensed logging, but any pre-emit or emit diagnostic and `emitResult.emitSkipped` must cause non-zero exit. Add a focused test/fixture that invokes the helper with a declaration-invalid source in CI mode; avoid mutating package source.

**Verify**: run the focused new test, then `yarn typecheck` → both exit 0.

### Step 2: Propagate required CSS copy errors

Keep contextual logging if useful, then rethrow. Ensure all declared icon/country CSS entry points are asserted by the artifact checker, including `css/salt-icon.css` and country CSS outputs.

**Verify**: `yarn workspace @salt-ds/icons copy:css && yarn workspace @salt-ds/countries copy:css` → exit 0 and expected files exist under `dist/`.

### Step 3: Replace grep-only checks with structural artifact validation

Create `check:published-artifacts`. Enumerate publishable workspaces from root workspace metadata; for each built manifest validate entry-point files, declarations, declared `files`, no unresolved `workspace:` ranges, and package-specific CSS. Correct the icon path and remove superseded grep blocks.

For representative JS packages, load ESM with dynamic `import()` and CJS with `require()` from a clean temporary consumer. Include `@salt-ds/core`, `@salt-ds/date-adapters`, `@salt-ds/icons`, `@salt-ds/countries`, and `@salt-ds/embla-carousel`; do not depend on workspace source aliases.

**Verify**: `yarn build && yarn check:published-artifacts` → exit 0; temporarily pointing one asserted entry at a missing file makes the checker exit non-zero, then revert that deliberate test change.

### Step 4: Put the smoke command in CI before release eligibility

Run it after the existing build in the dependency-check job. Keep CI permissions empty and do not add network publication.

**Verify**: inspect `.github/workflows/test.yml` and run `yarn check:published-artifacts` locally → same command and exit 0.

## Test plan

- Unit-test CI declaration diagnostics, a missing required CSS file, an unresolved workspace range, and a missing CJS/ESM/type entry.
- Include one happy-path built manifest fixture.
- Prefer temporary directories and guaranteed cleanup; never edit checked-in package manifests during a test.

## Done criteria

- [ ] CI and local declaration generation fail on diagnostics.
- [ ] CSS copy failures exit non-zero.
- [ ] No workflow reference to `dist/salt-ds-icon/package.json` remains.
- [ ] `yarn build && yarn check:published-artifacts` exits 0.
- [ ] `yarn typecheck` and `yarn test --run` exit 0.
- [ ] No generated `dist/` files are committed.

## STOP conditions

- Existing release tooling already consumes package tarballs in an uninspected path.
- Artifact smoke requires registry publication or credentials.
- Fixing diagnostics requires changing public declarations rather than the generator/checker; report the diagnostics first.

## Maintenance notes

Every new publishable workspace must be discovered automatically or added to an explicit, reviewed exception list. Reviewers should reject package-specific silent skips that recreate the current false-success behavior.
