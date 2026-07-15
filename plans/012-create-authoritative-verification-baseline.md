# Plan 012: Create a cross-platform authoritative verification command

> **Executor instructions**: Follow this plan step by step, run every verification command, honor STOP conditions, and update this plan's row in `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- package.json .editorconfig .gitattributes biome.jsonc .stylelintrc.json packages/theme packages/react-resizable-panels-theme CONTRIBUTING.md .github/workflows/test.yml`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: Plan 001, whose artifact command becomes part of the baseline
- **Category**: dx, tests
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

There is no local command equivalent to CI. On the audited Windows checkout, `core.autocrlf=true`, `.editorconfig` requires LF, no `.gitattributes` pins repository text, and Biome reports hundreds of CRLF-only format failures on an unchanged tree. Aggregate Stylelint also omits the published theme and resizable-panel theme.

## Current state

- `package.json:27-46` exposes separate tests, Cypress, formatting, Biome, Stylelint, and typecheck commands.
- `.github/workflows/test.yml:31-113` assembles gates across independent jobs.
- `.editorconfig:4-6` requires LF; `.gitattributes` is absent.
- `package.json:35` aggregate `lint:style` omits `lint:style:theme` and has no resizable-theme command, although line 43 defines theme lint.
- A clean audit run checked 3,863 files and produced 379 predominantly CRLF format errors; do not mass-format source in this plan.

## Commands you will need

| Purpose           | Command                | Expected                                                    |
| ----------------- | ---------------------- | ----------------------------------------------------------- |
| Fast baseline     | `yarn verify`          | exit 0; non-mutating merge-readiness gates                  |
| Extended baseline | `yarn verify:extended` | exit 0; includes build/artifacts/Cypress and documents the external Vercel site gate |
| Line endings      | `git ls-files --eol`   | tracked text reports `i/lf`; policy exceptions explicit     |

## Scope

Root scripts/config, `.gitattributes`, stylelint configuration/commands, CI delegation, and contributor docs. Theme token migrations strictly required to make the new live-source gate pass are in scope; unrelated formatting churn is not.

## Git workflow

Use the operator's branch or `codex/012-verification-baseline`. Keep any approved line-ending normalization in a dedicated mechanical commit separate from scripts/theme semantics. Do not push/open a PR unless instructed.

## Steps

### Step 1: Pin repository line endings without mass churn

Add `.gitattributes` with `* text=auto eol=lf` and explicit binary/generated exceptions. Verify SVG/font/image handling. Do not run a repository-wide renormalization in this plan; document a separately reviewed mechanical commit if the index requires it.

**Verify**: fresh-clone or temporary-index check shows LF text on Windows and no binary conversion.

### Step 2: Put all published theme CSS under Stylelint

Add resizable-theme command and include both theme commands in aggregate `lint:style`. Scope deprecated-token rules so definition files are intentionally exempt but live next-theme consumers are not. Migrate only live violations needed for a clean gate.

**Verify**: `yarn lint:style` exits 0 and includes command output for both themes.

### Step 3: Add `verify` and `verify:extended`

`verify` should run immutable install validation if appropriate, Prettier check, Biome CI/check mode, aggregate Stylelint, source-import policy, spellcheck, typecheck, and Vitest. `verify:extended` should add package build/artifact smoke and Cypress. Document that the production site build is a required Vercel pull-request check; an optional local `verify:site` may mirror that command, but do not add a duplicate mandatory GitHub Actions build without evidence that Vercel is insufficient. Use a small Node orchestrator if cross-platform parallelism/failure reporting is clearer than one shell line; every child must be awaited and failures propagated.

**Verify**: deliberately failing one delegated check makes the parent exit non-zero; revert the deliberate change.

### Step 4: Make CI call the same scripts

Reduce duplicated command composition while keeping parallel CI jobs where useful. Each job may call a documented subset, but `verify` must be reproducible locally.

**Verify**: workflow commands correspond to manifest scripts and local `yarn verify` exits 0.

## Test plan

Test the orchestrator's success and child-failure propagation, LF checkout behavior on Windows/Linux, binary exceptions, and inclusion of both theme packages. Use deliberately failing fixtures or mocked child commands, not edits to production source.

## Done criteria

- [ ] Clean Windows and Linux checkouts agree on LF text.
- [ ] No mass line-ending rewrite is mixed with semantic edits.
- [ ] Both published themes are Stylelint-gated.
- [ ] `yarn verify` and `yarn verify:extended` exist, are non-mutating except standard ignored outputs, and propagate failure.
- [ ] CI delegates to the same scripts.

## STOP conditions

- `.gitattributes` would rewrite generated/binary assets.
- Enabling theme lint uncovers broad intentional legacy debt beyond live next-theme files; split migration into a follow-up.
- Extended verification requires secrets or publication.

## Maintenance notes

Every new workspace/gate must join the authoritative scripts; CI-only checks should be exceptional and documented.
