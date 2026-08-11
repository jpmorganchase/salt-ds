# Plan 004: Finalize the Date Adapters publication contract

> **Historical completion record:** Do not execute this plan again. Canonical
> export projection, dual ESM/CJS format markers, LICENSE fallback, the Date
> package gate, and release ordering were implemented and verified on
> 2026-08-10. Plan 006 owns the narrower follow-up for published metadata,
> isolated consumers, peer closure, and the PR gate.
>
> **Drift check (run first):** > `git diff --stat cfa29d6e3..HEAD -- packages/date-adapters package.json scripts .github/workflows/release.yml packages/mcp/src/__tests__/releaseVerificationScripts.spec.ts .changeset/quiet-catalogs-search.md`
> Also inspect the same paths with `git diff --`; the reviewed Date builder and
> release workflow already contain uncommitted edits.

## Status

- **Plan status:** DONE — implemented and package-verified 2026-08-10; follow-up
  release coverage is tracked in Plan 006
- **Priority:** P1
- **Effort:** M
- **Risk:** MEDIUM
- **Depends on:** none
- **Category:** package compatibility / release
- **Planned at:** commit `cfa29d6e3`, 2026-08-10, including the dirty working tree

## Why this matters

The Date Adapters dry-run has all 18 export targets and correctly omits source
files and `saltSourceEntrypoints`, but its custom builder misses two publication
finalizers used by normal packages. It silently omits the repository LICENSE,
and its ESM `.js` files have no `type: module` boundary. Node 24 reparses them
with `MODULE_TYPELESS_PACKAGE_JSON`; with module detection disabled (and in
loaders without that behavior), native import fails. Date also maintains its
six entrypoints twice, so a routine adapter addition can compile yet omit a
published target.

## Current state

- `packages/date-adapters/package.json:4` declares `Apache-2.0`, but the package
  has no package-local `LICENSE`.

- `packages/date-adapters/scripts/build.mjs:156-164` copies only
  `path.join(cwd, file)` and silently ignores `ENOENT`. By contrast, shared
  `scripts/build.mjs:727-731` falls back to the repository root for LICENSE.

- The custom builder emits ESM and CJS `.js` at lines 79-103, but never writes
  nested format markers. Shared `scripts/build.mjs:266-278` writes:

  ```js
  dist - cjs / package.json; // { type: "commonjs" }
  dist - es / package.json; // { type: "module" }
  ```

- `package.json:12-18` already provides the canonical source entrypoints. The
  builder repeats all six export targets in a hard-coded object at
  `build.mjs:113-143`. Runtime output names are derivable from the export key;
  declaration output names are derivable from the source parent directory.

- The current packed output has 33 files and 18 unique `types`/`import`/
  `require` targets, but no LICENSE or format-marker check owns that result.
  Standard release invokes `yarn build` then only the MCP after-build composite;
  snapshot release likewise names only the MCP verifier before publish.

- `packages/mcp/src/__tests__/releaseVerificationScripts.spec.ts` is the
  existing root-script ordering test. It must verify command composition, not
  reimplement Date package inspection.

## Commands you will need

| Purpose                | Command                                                                                        | Expected on success                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Date build             | `yarn workspace @salt-ds/date-adapters build`                                                  | exit 0; writes only ignored `dist/salt-ds-date-adapters`            |
| Date package gate      | `yarn check:date-adapters:pack`                                                                | exit 0; reports 18 targets, LICENSE, and unambiguous module formats |
| Release wiring test    | `yarn vitest run packages/mcp/src/__tests__/releaseVerificationScripts.spec.ts --maxWorkers=1` | exit 0                                                              |
| Root/MCP typechecks    | `yarn typecheck && yarn typecheck:mcp`                                                         | both exit 0                                                         |
| Existing adapter tests | `yarn vitest run packages/date-adapters/src/__tests__ --maxWorkers=1`                          | exit 0                                                              |
| Changesets             | `yarn changeset status`                                                                        | Date remains patch; existing six-package scope remains              |

Use `npm pack --json --dry-run --ignore-scripts` only inside the verification
script. Do not create a tarball in the workspace, publish, install, or update a
dependency.

## Scope

**In scope — the only files to modify:**

- `packages/date-adapters/scripts/build.mjs`
- `scripts/checkDateAdaptersPackageDryRun.mjs` (new)
- `package.json`
- `.github/workflows/release.yml`
- `packages/mcp/src/__tests__/releaseVerificationScripts.spec.ts`
- `.changeset/quiet-catalogs-search.md` only to make the existing Date patch
  note accurately include LICENSE/module-boundary finalization

**Out of scope:**

- Date adapter runtime APIs, peer dependencies, source implementations, or
  package version.
- Reintroducing deleted `.d.ts` source files or publishing `src`.
- A generic all-package verifier/framework.
- MCP package verification internals, consumer smoke, or release publication.
- Icons/Countries source regeneration, CSS bundling, or a root build in the
  dirty worktree.

## Git workflow

- Remain on `mcp`; do not reset, clean, restore, stage, commit, push, publish,
  version, or switch branches without separate authorization.
- Capture full status and each in-scope diff. The release workflow and root
  scripts contain user work; stop on an unexplained overlapping hunk.
- If later authorized, use a present-tense conventional commit such as
  `fix(date-adapters): finalize published package metadata`.

## Steps

### Step 1: Derive Date exports from the canonical source entrypoints

Keep `saltSourceEntrypoints` in the source package manifest for catalog/build
ownership and continue omitting it from the published manifest. Replace the
hard-coded six-entry `exports` object with a deterministic projection over
that source map:

- `.` maps runtime output to `types` and declaration output to `types`;
- `./<name>` maps runtime output to `<name>`;
- its declaration output directory is the basename of the source entrypoint's
  parent (for example `src/date-fns-adapter/index.ts` becomes
  `dist-types/date-fns-adapter/index.d.ts`).

Validate every source entry at build time: safe normalized export key, relative
contained source path, unique runtime and declaration destinations, and an
existing source file. Sort by export key before emitting the manifest. Preserve
the exact current six export keys and 18 targets.

Do not add a second descriptor beside `saltSourceEntrypoints`; the point is to
remove duplicate adapter-name maintenance.

**Verify:** build Date and inspect its generated `package.json`; all current
targets are unchanged and `saltSourceEntrypoints` is absent.

### Step 2: Apply the missing publication finalizers

After both Rollup formats finish, write:

- `dist/salt-ds-date-adapters/dist-es/package.json` with `{ "type": "module" }`;
- `dist/salt-ds-date-adapters/dist-cjs/package.json` with
  `{ "type": "commonjs" }`.

Match shared `scripts/build.mjs` exactly for formatting/semantics. For LICENSE,
first try the package-local file and then fall back to the repository root. If
neither exists, fail the build; do not silently publish a licensed package
without its license text. Preserve current README/CHANGELOG copy behavior.

**Verify:**

```powershell
yarn workspace @salt-ds/date-adapters build
Get-Content -Raw dist/salt-ds-date-adapters/dist-es/package.json
Get-Content -Raw dist/salt-ds-date-adapters/dist-cjs/package.json
```

Expected: exit 0, exact module/commonjs markers, and
`dist/salt-ds-date-adapters/LICENSE` byte-equals root `LICENSE`.

### Step 3: Add one narrow executable Date package gate

Create `scripts/checkDateAdaptersPackageDryRun.mjs`. It must be read-only with
respect to the repository and fail on any of these conditions:

- built Date output or manifest is absent/invalid;
- `saltSourceEntrypoints` is present in published metadata;
- the dry-run packed file list contains `src/` or omits README, CHANGELOG,
  LICENSE, either format marker, or any export target;
- packed LICENSE bytes differ from root LICENSE;
- an export target escapes the package, is duplicated, or is missing;
- `dist-es/package.json` is not `type: module` or `dist-cjs/package.json` is not
  `type: commonjs`;
- native `import` or `require` of a runtime target fails. Run the import check
  once with normal Node and once with `--no-experimental-detect-module` so the
  marker—not syntax detection—owns classification. Fail specifically on
  `MODULE_TYPELESS_PACKAGE_JSON`; report unrelated stderr without turning this
  package-format gate into a generic dependency-warning policy.

Use OS temporary directories if extraction is needed and remove them in
`finally`. `npm pack --dry-run --ignore-scripts` must not run lifecycle hooks or
leave a tarball. Reject unknown CLI options rather than silently accepting
them. Print a short stable success receipt including packed file and target
counts, not absolute paths.

Add root script:

```json
"check:date-adapters:pack": "node ./scripts/checkDateAdaptersPackageDryRun.mjs"
```

**Verify:** Date build followed by `yarn check:date-adapters:pack` exits 0 and
reports exactly 18 unique export targets.

### Step 4: Put the Date gate before every publish path

Add a root `release:verify:after-build` composite that runs the Date package
gate and then the unchanged MCP after-build composite. Change normal `release`
to build, run this root composite, then publish. Change the snapshot workflow's
post-build verification step to call the same root composite before its
publish step. Leave `release:verify:mcp` available as the MCP-only developer
command.

Update `releaseVerificationScripts.spec.ts` to assert:

- normal release is `build -> release:verify:after-build -> publish`;
- the root after-build composite contains Date then MCP exactly once;
- MCP-only commands retain their present composition;
- no verifier publishes, versions, or performs post-publish work.

Do not parse the workflow as text in the unit test. Review the snapshot step
directly and rely on the workflow diff plus CI YAML parsing.

Update the existing Date changeset bullet in past tense without changing its
patch level or the other five package levels.

**Verify:** run the release wiring test and `yarn changeset status`; both exit
0, with MCP major, Core minor, and Theme/Date/Icons/Lab patch.

### Step 5: Run Date and release-focused verification

Run all commands in the command table plus scoped
`yarn exec prettier --check <changed files>` and
`yarn biome check <changed files>` checks on the changed
JS/TS/JSON/YAML/Markdown files. Do not run `yarn release`,
`changeset version`, or `changeset publish`.

## Test plan

- Build-projection checks for all six current entrypoints and a synthetic
  duplicate/escaping descriptor if the projection is extracted as a pure
  helper.
- Executable post-build checks for 18 packed targets, source exclusion,
  root-license equality, module markers, import, and require.
- Root script composition test; snapshot workflow receives the same command.
- Existing Date runtime tests remain unchanged and green.

## Done criteria

- [x] One `saltSourceEntrypoints` map determines source and published targets.
- [x] Packed output contains root LICENSE and both module-format markers.
- [x] Every export target exists, is packed, and loads under native Node without
      typeless-module fallback or warnings.
- [x] Published metadata omits source-only fields and packed output omits `src`.
- [x] Standard and snapshot workflows run the Date gate after build and before
      publish.
- [x] Date remains a patch in the existing six-package Changeset.
- [x] Focused tests, typechecks, package gate, formatting, and lint pass.
- [x] No file outside scope changed; this plan's index row is `DONE`.

## STOP conditions

Stop and report if:

- any current export target cannot be derived without changing its public path;
- native import requires changing a runtime API or peer-dependency contract;
- the release fix requires a generic package framework rather than the narrow
  Date gate;
- the workflow/root-script hunks conflict with unexplained user work;
- a verifier would install, publish, version, or leave repository artifacts; or
- verification fails twice after one focused correction.

## Maintenance notes

Any future Date adapter addition should require one source-map entry and make
the package gate report 21 targets automatically. Keep source-only catalog
metadata separate from published metadata, and keep Node format boundaries
explicit even if a current runtime can infer ESM syntax.
