# Plan 002: REJECTED — do not duplicate the Vercel pull-request site build

> **Executor instructions**: Do not execute this plan. The maintainer confirmed
> that Vercel builds the production site on every pull request. Update or
> reactivate this record only if that required external gate is removed or
> shown not to cover the production Next/Mosaic build.
>
> **Drift check if reconsidered**: `git diff --stat 338971164..HEAD -- site/package.json .github/workflows/test.yml vercel.json`

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: rejected
- **Planned at**: commit `338971164`, 2026-07-12
- **Disposition**: REJECTED on maintainer evidence, 2026-07-12

## Why this was rejected

The audit observed that GitHub Actions does not build `@salt-ds/site`, but it
did not have visibility into the repository's Vercel project settings. The
maintainer confirmed that Vercel builds the site for every pull request. That
external required check covers the principal risk identified by the audit:
production Next/Mosaic compilation failing before merge. Adding a duplicate
GitHub Actions build would increase CI time and maintenance without materially
improving coverage.

## Evidence to retain

- `package.json:16` excludes `@salt-ds/site` from the package-oriented root
  build; this is acceptable because it is not the only pull-request gate.
- `site/package.json:12` remains the production Vercel build path.
- The Vercel-every-PR fact is maintainer-supplied external configuration and
  was not independently visible in the repository audit.

## Scope if reconsidered

**In scope**: first verify Vercel required-check status, the exact build
command, environment parity, and whether failures block merge.

**Out of scope**: adding a duplicate GitHub Actions site build merely because
the external gate is not declared in `.github/workflows/`.

## Git workflow

No branch or commit is required for a rejected plan. If reactivated, use the
operator's branch or `codex/002-site-ci` and do not push/open a PR unless
instructed.

## Reconsideration steps

1. Confirm the Vercel check no longer runs on every pull request, does not run
   `yarn workspace @salt-ds/site build`, or is not required for merge.
2. Determine the smallest missing gate. Prefer repairing/documenting Vercel
   over duplicating the entire build in GitHub Actions.
3. Only then rewrite this as an active plan with focused commands and tests.

## Test plan

No tests are required while rejected. If reactivated, compare the candidate
gate against the exact Vercel production command and prove that a deliberate
site compile failure blocks merging.

## Done criteria

- [x] Maintainer confirmed a Vercel site build runs on every pull request.
- [x] The index marks this plan rejected and removes it from dependencies.
- [ ] If reactivated, external-gate evidence is recorded before implementation.

## STOP conditions

- The Vercel check remains required and runs the production site build.
- The proposed work only duplicates an already blocking external check.

## Maintenance notes

Documenting the Vercel check in contributor or release-readiness guidance may
still improve discoverability, but that belongs in Plan 012 and does not
justify a second mandatory build.

