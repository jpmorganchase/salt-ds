# Plan 001: Finish the MCP cleanup and release

> **Historical completion record:** Do not execute this plan again. Its source
> cleanup is complete. The artifact receipt below was valid when recorded but
> has since been superseded by later source changes. Plans 002–006 own the
> follow-up findings and current release readiness. Preserve this file as the
> rationale and verification record for the cleanup already performed.
>
> **Working-tree preflight:** Run `git branch --show-current`,
> `git rev-parse HEAD`, `git rev-parse origin/main`,
> `git status --porcelain=v1 --untracked-files=all`, `git diff --stat`, and
> `git diff --cached --stat`. Expect branch `mcp`, HEAD
> `cfa29d6e3743c6c45cb0fadccc67ec7411bfbcee`, and base
> `fecd97223921677010447397f656aed4ab382866` unless the operator deliberately
> advanced them. Save the full initial status and `yarn.lock` diff outside the
> repository. Reconcile every existing in-scope hunk before editing; STOP on an
> unexplained overlap. Do not reset, clean, checkout, stage, commit, or switch
> branches.

## Status

- **Plan status:** DONE — historical cleanup implemented and verified on
  2026-08-10; its artifact receipt is superseded and is not current release
  evidence
- **Priority:** P1
- **Effort:** L
- **Risk:** MEDIUM
- **Depends on:** none
- **Category:** correctness / integrity / release / maintainability
- **Planned at:** `cfa29d6e3`, 2026-08-09

### 2026-08-10 reconciliation

Do not replay any phase. The source, test, documentation, cleanup, and
package-boundary outcomes were verified and remain a completed historical unit.
Later follow-up work changed canonical catalog inputs after the receipt below;
the current release verifier correctly detects that the ignored catalog and
distribution are no longer source-current. Plan 006 owns the final source fixes,
artifact refresh, and current release receipt. Plans 002–005 are separate
follow-up units, not unfinished steps from this plan.

### 2026-08-10 historical completion receipt (superseded)

The narrow, non-publishing refresh completed against Node `v24.10.0` and Yarn
`4.17.0`:

```powershell
yarn workspace @salt-ds/mcp build:registry
yarn workspace @salt-ds/mcp build:package
yarn release:verify:mcp:after-build
```

The first registry publication attempt encountered a transient Windows
`EPERM` at the final generation-directory rename. It left the previous root
manifest intact and no staging, tooling, or manifest-publication debris. One
clean retry succeeded. The verified receipt is:

- active generation:
  `2b0d12c42625947a3280515c4784aff1ec4d1d76d26588a37a836edfa0afb018`;
- semantic digest:
  `sha256:b1c67223f701b53f071c70a909705cee99690ea30ad4bcb3d51da9f872906c5c`;
- input inventory digest:
  `sha256:08cb47267b9364ebd044fb955f995680498a0100c7accad043c1a0f060bb37ca`;
- workspace/distribution root-manifest SHA-256:
  `295dd393557802073b75dc217929137fc611ef363003c35c3a0ba7892ca085cb`;
- packed MCP: 34 files, SHA-256
  `454a9704d93adb31df321bf9f173eaa1968581270290001de9f1e6358ee3bb6b`;
- MCP tests: 59 files and 900 tests passed;
- public surface: 3 tools, 1 resource, and 2 templates;
- production-runtime-reachable physical lines: 22,188;
- package byte comparisons, isolated installation, declarations, real MCP
  behavior, rendering, Tab focus, activation, and Axe all passed.

No dependency install/update, publication, branch/history operation, or source
cleanup was run. Tracked and nonignored source was byte-identical across the
artifact publication steps; the final Git status retained the same 126 tracked
entries and 15 untracked paths. No transient generator debris remains, and the
preserved `.salt-eval-cache` was not traversed. Node 22 and React 16/17/18
matrices remain clean-checkout CI gates before publication.

## Outcome

After this plan, the branch contains a small read-only Salt MCP product and its
normal release safeguards. Repository-local comparative evaluation, evidence
transactions, the unpublished skill, skill installation verification, frozen
archives, and phase-number ownership are gone. The remaining concrete file and
catalog integrity gaps are closed, affected public packages are correctly
versioned, and final built/packed/installed bytes pass the release gates.

## Historical pre-implementation state

- `package.json:19` runs two repository evaluation steps in every MCP release
  verification: `eval:archive-contract` and `validatePhase5Candidate.mjs`.
- Seven evaluation scripts, three evaluation/archive tests,
  `packages/mcp/eval-fixtures/`, four `plans/AI_MCP_*.md` operational records,
  and a duplicate Core consumer test remain. None is imported by published MCP
  runtime code; MCP package allowlists already exclude `eval-fixtures`.
- `packages/skills/package.json:2-4` defines private version `0.0.0`. Consumer
  smoke nevertheless installs it through `npx skills@1.5.16` and maintains a
  separate canonical tree hash. `yarn.lock` contains one dependency-free
  workspace stanza for it.
- `workflow-examples/consumer-repo/AGENTS.md` already holds the portable host
  workflow. Preserve it byte-for-byte.
- Public AI docs still say installation is paused, while the README copied into
  the MCP package has no supported install/configuration section.
- `boundedProjectFile.ts:154-200` reads through a descriptor but reuses its
  opening stats after the read, so same-inode changes can pass its final check.
- `catalogStoreV2.ts:1161-1175` eagerly decodes every content record. Stored
  artifacts and individual decoded objects are bounded, but their aggregate
  declared decoded bytes are not.
- `catalogWriterV2.ts:357-385` follows an existing hash-named generation child
  after a rename collision without first rejecting a link/junction or
  non-directory.
- `createServer.ts:21-25` requests whole-catalog prefetch, but no corrupt
  late-family regression reaches the real `createSaltMcpServer` boundary.
- Date Adapters retains two divergent declaration sources and spreads
  `saltSourceEntrypoints` into its built manifest even though `src` is not
  packed.
- `ValidationStatusValues` is exported through the Core barrels, but the only
  branch regression reads its defining source file as text.
- `.changeset/quiet-catalogs-search.md` lists only MCP and Core, although Theme,
  Date Adapters, Icons, and Lab have changed public output or declarations.

## Scope

The executor may modify or delete only the following owners and their explicit
rename destinations:

- `.changeset/quiet-catalogs-search.md`
- `.gitignore`, `package.json`, `yarn.lock`, `biome.jsonc`, and `tsconfig.json`
- `packages/mcp/tsconfig.test.json`
- the seven evaluation scripts listed in Phase 1
- `packages/mcp/eval-fixtures/` in full
- the evaluation/archive tests and four operational reports listed in Phase 1
- `packages/skills/` in full
- `scripts/consumerRepoSmoke.mjs`
- `scripts/consumer-smoke/{shared,fixture,skillTreeHash}.mjs`
- the three Phase-5-named Cypress files and their semantic rename destinations
- `packages/mcp/src/__tests__/consumerSmokeReleaseSupport.spec.ts`
- `packages/mcp/src/__tests__/releaseVerificationScripts.spec.ts`
- `packages/mcp/src/__tests__/{phase2Outcome,phase2Residue}.spec.ts` and the
  semantic rename/merge destinations described below
- `packages/core/src/__tests__/__e2e__/phase5-consumer-artifact/` (delete after
  its unique keyboard assertion is preserved)
- `packages/mcp/src/server/__tests__/phase4Inspection.spec.ts` and its semantic
  rename destination
- `packages/mcp/src/__tests__/packagePublishBoundary.spec.ts`
- `packages/mcp/src/core/build/buildRegistryDeprecations.ts` and its focused test
- `packages/mcp/src/core/types.ts`
- `packages/mcp/src/core/catalog/catalogRegistryProjection.ts`
- `packages/mcp/README.md`, `site/docs/getting-started/ai.mdx`, and
  `workflow-examples/consumer-repo/README.md`
- `packages/mcp/src/core/project/boundedProjectFile.ts` and its test
- `packages/mcp/src/core/catalog/catalogStoreV2.ts`
- `packages/mcp/src/core/catalog/catalogSchemaV2.ts` only if an internal alias
  of the existing runtime-total bound is genuinely needed
- `packages/mcp/src/core/__tests__/{catalogPublicBounds,catalogV2}.spec.ts`
- `packages/mcp/src/core/build/catalogWriterV2.ts` and its test
- `packages/mcp/src/__tests__/createServer.spec.ts`
- `packages/date-adapters/src/types/index.d.ts` (delete)
- `packages/date-adapters/src/types/DateFrameworkTypeMap.d.ts` (delete)
- `packages/date-adapters/scripts/build.mjs`
- `packages/core/src/status-indicator/ValidationStatus.spec.ts` (new)
- ignored generated catalog and `dist` output produced by the final build
- `advisor-plans/README.md` for the final status update

Do not change public MCP tool/resource names or schemas, catalog schema version,
project authorization policy, dependencies or dependency versions, package
versions/changelogs, release workflows, `workflow-examples/consumer-repo/AGENTS.md`,
or unrelated site rollout terminology. Do not add a replacement evaluator,
evidence status, archive command, skill, generic filesystem framework, catalog
record-count policy, lookup index, publication lock, changed-package detector,
or permanent package/prose verification subsystem.

## Phase 1: Retire repository evaluation and the unpublished skill

### 1. Preserve the normal release and consumer contract

In `package.json`:

- remove `yarn eval:archive-contract` and
  `node scripts/validatePhase5Candidate.mjs` from
  `release:verify:mcp:after-build`;
- retain exactly, in order: root typecheck, MCP typecheck, AI/MCP tests, runtime
  LOC, public surface, package dry-run, and installed consumer smoke;
- delete `eval:deterministic` and `eval:archive-contract`;
- make `test:ai-tooling` run only `packages/mcp/src --maxWorkers=4`, without
  skill inputs or exclusions for tests that this phase deletes; and
- leave `release`, `release:verify:mcp`, package checking, and all normal
  consumer-smoke commands otherwise intact.

Update `releaseVerificationScripts.spec.ts` to own only root-script
composition. Assert the seven retained steps once and that evaluation,
provider, post-publish, and publish work is absent. Remove its branch-specific
Changeset/Core source-text assertion. Do not parse `.github/workflows/release.yml`
from a unit test; review once that standard release still calls `yarn release`
and snapshot release still builds, verifies, then publishes.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/__tests__/releaseVerificationScripts.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Release-composition test failed." }
```

Expected: exit 0; the release composite contains seven normal gates and no
evaluation step.

### 2. Remove skill installation without weakening MCP smoke

Rename:

- `scripts/consumer-smoke/phase5-cypress.config.mjs` to
  `isolated-consumer-cypress.config.mjs`;
- `scripts/consumer-smoke/phase5-cypress-support.mjs` to
  `isolated-consumer-cypress-support.mjs`; and
- `scripts/consumer-smoke/phase5-consumer-artifact.cy.mjs` to
  `isolated-consumer-artifact.cy.mjs`.

Update `fixture.mjs` to use those names, rename its generated
`phase5-browser-entry.tsx` string to `consumer-browser-entry.tsx`, rename the
Cypress task to `readAxeSource`, and use a behavioral describe label. Move the
Core duplicate's real keyboard guarantee into the retained installed-consumer
test: visit, press Tab, assert the Save button has focus, then press Enter.
Preserve rendering, activation, and Axe assertions.

Remove `verifySkills`, `hashCanonicalSkillTree`, the Skills CLI invocation,
skill default/source/hash fields, and `--skills-source` /
`--expected-skill-tree-hash` handling from the consumer runner and helpers. In
`shared.mjs`, accept only `published`, `keep-temp`, `skip-build`, `mcp-spec`,
`expected-version`, and `expected-git-head`; reject any other `--...` option.
Update `consumerSmokeReleaseSupport.spec.ts` by deleting skill-only cases and
adding one generic unknown-option failure. Preserve all MCP identity, package
path, Windows command, and standalone consumer cases.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/__tests__/consumerSmokeReleaseSupport.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Consumer-smoke support test failed." }
```

Expected: exit 0; unknown options fail and no skill installation/hash case is
collected.

### 3. Delete the closed owners atomically

Delete these scripts:

- `scripts/buildPhase5RuntimeCapabilityLock.mjs`
- `scripts/phase5ArtifactHarness.mjs`
- `scripts/phase5EvaluationContract.mjs`
- `scripts/phase5ExternalFile.mjs`
- `scripts/rebindPhase5Candidate.mjs`
- `scripts/validatePhase5Candidate.mjs`
- `scripts/validatePhase5Evaluation.mjs`

Delete:

- `packages/mcp/src/__tests__/phase5EvaluationContract.spec.ts`
- `packages/mcp/src/__tests__/phase5ExternalFile.spec.ts`
- `packages/mcp/src/__tests__/remediationBaselineArchive.spec.ts`
- `packages/mcp/eval-fixtures/` in full
- `packages/core/src/__tests__/__e2e__/phase5-consumer-artifact/` in full
- `plans/AI_MCP_PHASE0_BASELINE.md`
- `plans/AI_MCP_PHASE0_SDK_V2_INVENTORY.md`
- `plans/AI_MCP_REMEDIATION_LEDGER.md`
- `plans/AI_MCP_REMEDIATION_REPORT.md`
- `packages/skills/` in full
- `scripts/consumer-smoke/skillTreeHash.mjs`

Remove deleted-owner exclusions/includes from `biome.jsonc`, `tsconfig.json`,
and `packages/mcp/tsconfig.test.json`. Remove the orphaned
`.salt-eval-cache` rule from `.gitignore` while retaining the generated-catalog
rule. Remove exactly the dependency-free
`@salt-ds/skills@workspace:packages/skills` stanza from `yarn.lock`; preserve
every other existing lockfile hunk and do not run dependency resolution yet.
The complete stanza to remove is:

```yaml
"@salt-ds/skills@workspace:packages/skills":
  version: 0.0.0-use.local
  resolution: "@salt-ds/skills@workspace:packages/skills"
  languageName: unknown
  linkType: soft
```

Keep package allowlists/deny-lists that prevent `eval-fixtures` from being
published: they remain useful defense against accidental reintroduction. Do
not remove `semver`; MCP production code still uses it.

**Verify:** search `package.json`, `yarn.lock`, `scripts`, `packages/mcp/src`,
`packages/mcp/tsconfig.test.json`, `.gitignore`, and consumer support files for the deleted
script names, `@salt-ds/skills`, `packages/skills`, skill-tree hash symbols,
Skills CLI version, and retired CLI flags. Require no content or filename
matches. Treat ripgrep exit 1 as success and any exit greater than 1 as an
error. Confirm `git diff -- workflow-examples/consumer-repo/AGENTS.md` is empty
and the added `yarn.lock` delta is only the one removed workspace stanza.

### 4. Give surviving owners durable names and documentation

- Rename `phase2Outcome.spec.ts` to `outcomeBoundaries.spec.ts` and its describe
  label to `MCP negative outcome boundaries`.
- Move the SDK-v2 dependency assertion from `phase2Residue.spec.ts` into
  `packagePublishBoundary.spec.ts`, then delete `phase2Residue.spec.ts`.
- Rename `phase4Inspection.spec.ts` to
  `projectInspectionTrustBoundaries.spec.ts` and remove the phase number from
  its describe label. Preserve its untrusted-policy-data regression unchanged.
- In deprecation diagnostics/tests, replace `Phase 1 public identity` and
  `Phase 1 public-member identity` with `single-hop public identity` and
  `single-hop public-member identity`; replace `Phase 1 deprecation contract`
  with `single-declaration deprecation contract`.
- Rewrite the corresponding `types.ts` comment behaviorally and replace
  `remaining Phase 1 consumers` in `catalogRegistryProjection.ts` with
  `legacy catalog projection consumers`.

In `packages/mcp/README.md` and `site/docs/getting-started/ai.mdx`, add concise,
version-agnostic local-stdio onboarding using Node 22+, installation with
`yarn add --dev @salt-ds/mcp`, command `node`, and argument
`./node_modules/@salt-ds/mcp/bin/salt-mcp.js`. State that the host must launch
from the intended project and that the local process has that account's
filesystem permissions. Retain remote/shared-host cautions. Remove paused
release/evaluation-prerequisite wording; do not add a Phase-number tombstone or
claim remote hosting, mutation, automatic setup, or skill installation.

Update `workflow-examples/consumer-repo/README.md` to distinguish its exact
local-tarball test fixture from normal released-package installation. Remove
the paused-release text and deleted skill link while retaining the warning
against mutable branch URLs.

**Verify:** run the renamed focused tests and MCP typecheck:

```powershell
yarn vitest run packages/mcp/src/__tests__/outcomeBoundaries.spec.ts packages/mcp/src/__tests__/packagePublishBoundary.spec.ts packages/mcp/src/server/__tests__/projectInspectionTrustBoundaries.spec.ts packages/mcp/src/core/__tests__/buildRegistryDeprecations.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Renamed/merged MCP tests failed." }
yarn typecheck:mcp
if ($LASTEXITCODE -ne 0) { throw "MCP typecheck failed." }
```

Expected: both commands exit 0. Confirm both public docs contain the install
command and binary path, and stale pause wording is absent.

## Phase 2: Close the remaining concrete integrity gaps

### 5. Detect in-place project-file changes

In `boundedProjectFile.ts`, call `handle.stat({ bigint: true })` after the final
read. Compare opening and final descriptor snapshots for regular-file status,
device, inode, link count, size, `mtimeNs`, and `ctimeNs`. Pass the final stats
to the last named-path identity check and map any change to the existing
`changed_during_inspection` result. Preserve containment, the cap-plus-one read,
single-link policy, public result union, and diagnostic wording.

Add one deterministic production-path regression to
`boundedProjectFile.spec.ts`: wrap the real opened handle so a same-inode,
same-length write occurs after bytes are read but before the final descriptor
stat. Assert the existing changed-during-inspection reason. Do not add a
production injection parameter or a generic filesystem helper.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/core/project/__tests__/boundedProjectFile.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Bounded project-file tests failed." }
```

Expected: exit 0, and the new case fails if the post-read descriptor comparison
is removed.

### 6. Bound total decoded catalog content and test the real server boundary

In `CatalogStoreV2.prefetch`, after runtime families (including `content`) have
passed artifact digest/schema parsing and before content-pack verification or
eager decoding, sum each content record's declared decoded `bytes`. Reject as
soon as the sum exceeds the existing
`MAX_CATALOG_RUNTIME_TOTAL_BYTES` ceiling. Reuse that ceiling directly or via a
clearly named internal alias; do not introduce a new compatibility number,
record-count policy, schema version, or duplicate writer implementation. The
writer already validates staged output through `CatalogStoreV2`.

Add one aggregate regression where every record is individually within the
64-KiB decoded limit but the verified declarations exceed the total. Assert the
aggregate error occurs before content-pack/decompression errors.

In `createServer.spec.ts`, copy a valid test catalog, rebind a logically invalid
late-access family using the existing registry fixture helpers, and assert
`createSaltMcpServer({ registryDir, projectAccess })` rejects before returning a
server. Use a test-specific copy and clean it in `finally`; do not expose a
production test hook.

Update the MCP README safety text to distinguish per-object and aggregate
declared decoded bounds. Do not claim a heap, CPU, timing, or adversarial
directory sandbox.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/core/__tests__/catalogPublicBounds.spec.ts packages/mcp/src/core/__tests__/catalogV2.spec.ts packages/mcp/src/__tests__/createServer.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Catalog/server integrity tests failed." }
```

Expected: exit 0; over-budget declarations and late logical corruption reject
before the server factory returns.

### 7. Reject linked generation reuse after rename collision

Only in `installCatalogGeneration`'s rename-collision branch, `lstat` the
existing `generationDir` before constructing `CatalogStoreV2`. Require a normal
directory, reject a symbolic link/junction or non-directory, and confirm its
realpath is the expected direct hash-named child of the already-verified real
`catalog-generations` parent. Do not add a directory-identity state machine,
publication lock, historical-generation cleanup, or hard-link rule for normal
installed runtime artifacts.

Add one Windows/POSIX-aware regression using a valid external generation behind
a hash-named symlink/junction. It must reject, leave the previous root manifest
byte-identical, and leave an external sentinel unchanged. Skip only documented
link-creation privilege errors.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/core/__tests__/catalogWriterV2.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Catalog writer tests failed." }
```

Expected: exit 0; the linked-child case rejects without modifying prior or
external data.

## Phase 3: Finish public package ownership

### 8. Clean Date sources and publish metadata

Confirm no direct import references either physical declaration filename, then
delete:

- `packages/date-adapters/src/types/index.d.ts`
- `packages/date-adapters/src/types/DateFrameworkTypeMap.d.ts`

Canonical types remain in `packages/date-adapters/src/types/index.ts`; do not
copy divergent declarations into it or change the public adapter API.

In `packages/date-adapters/scripts/build.mjs`, destructure
`saltSourceEntrypoints` for source-entry selection and keep a rest object for
publication, following the omission pattern in root `scripts/build.mjs`.
Spread the rest object—not the complete source manifest—into built
`package.json`. Preserve exports, dependencies, peers, provenance,
main/module/typings, and workspace dependency transformation. Do not add a
manifest helper or permanent fixture test.

**Verify:**

```powershell
$dateDeclarationMatches = & rg -n -e "DateFrameworkTypeMap.d.ts" -e "src/types/index.d.ts" packages/date-adapters .github scripts
$dateDeclarationExit = $LASTEXITCODE
if ($dateDeclarationExit -eq 0) {
  $dateDeclarationMatches
  throw "Deleted Date declaration paths are still referenced."
}
if ($dateDeclarationExit -gt 1) { throw "Date declaration reference search failed." }
yarn typecheck
if ($LASTEXITCODE -ne 0) { throw "Root typecheck failed after Date cleanup." }
```

Expected: the search finds no references (ripgrep exit 1) and typecheck exits 0. Do not build yet.

### 9. Add the Core public-root regression and complete Changesets

Create `packages/core/src/status-indicator/ValidationStatus.spec.ts`. Import
`ValidationStatusValues` and `VALIDATION_NAMED_STATUS` from `../index`, which
crosses the Core root barrel. Assert exact values
`["error", "warning", "success", "info"]` and deprecated-alias object identity.

Update `.changeset/quiet-catalogs-search.md` once, after the implementation
scope is stable. Retain MCP major and Core minor. Add patch entries for
`@salt-ds/theme`, `@salt-ds/date-adapters`, `@salt-ds/icons`, and
`@salt-ds/lab`. Use past-tense, non-overclaiming bullets for Theme token
alias/replacement metadata, Date declaration/publish metadata, resolvable
deprecated Icon replacement links, and Lab migration metadata. The retained
Core minor note must cover both the `ValidationStatusValues` replacement export
and the public migration/deprecation metadata added across Core. The Date patch
note must cover its retained adapter migration metadata as well as declaration
and publish-manifest cleanup.

**Verify:**

```powershell
yarn vitest run packages/core/src/status-indicator/ValidationStatus.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Core ValidationStatus root test failed." }
yarn changeset status
if ($LASTEXITCODE -ne 0) { throw "Changesets status failed." }
```

Expected: the test exits 0 and Changesets lists the six intended packages at
MCP major, Core minor, and four patch levels. STOP if prerelease policy yields
an unexpected stable Lab release.

## Phase 4: Build final bytes and verify release readiness

### 10. Run the final integration sequence

Reconcile full status/diff against the preflight. Confirm every change is
planned or preserved user work. Then run, in order:

```powershell
$lockBefore = (Get-FileHash -LiteralPath yarn.lock -Algorithm SHA256).Hash
yarn install --immutable --mode=skip-build
if ($LASTEXITCODE -ne 0) { throw "Immutable installation failed." }
$lockAfter = (Get-FileHash -LiteralPath yarn.lock -Algorithm SHA256).Hash
if ($lockAfter -ne $lockBefore) { throw "Immutable installation changed yarn.lock." }

yarn prettier:ci
if ($LASTEXITCODE -ne 0) { throw "Prettier check failed." }
yarn biome ci --reporter=summary
if ($LASTEXITCODE -ne 0) { throw "Biome CI check failed." }
yarn lint:style
if ($LASTEXITCODE -ne 0) { throw "Stylelint check failed." }
yarn workspace @salt-ds/site spellcheck
if ($LASTEXITCODE -ne 0) { throw "Site spellcheck failed." }

$sourceImportMatches = & rg -n '@salt-ds/.*/src' packages -g '*.ts' -g '*.tsx'
$sourceImportExit = $LASTEXITCODE
if ($sourceImportExit -eq 0) {
  $sourceImportMatches
  throw "TypeScript files import another Salt package through src/."
}
if ($sourceImportExit -gt 1) { throw "Source-import search failed." }

yarn build
if ($LASTEXITCODE -ne 0) { throw "Root build failed." }
```

The last successful root build is authoritative. Do not intentionally run a
second registry build; if a genuine failure requires an edit and rebuild,
report the correction and treat only the final successful output as evidence.

After the build, run these executable package assertions:

```powershell
$mcpSourceReadme = 'packages/mcp/README.md'
$mcpBuiltReadme = 'dist/salt-ds-mcp/README.md'
if ((Get-FileHash -LiteralPath $mcpSourceReadme -Algorithm SHA256).Hash -ne
    (Get-FileHash -LiteralPath $mcpBuiltReadme -Algorithm SHA256).Hash) {
  throw "Built MCP README differs from source."
}
$mcpReadmeText = Get-Content -Raw -LiteralPath $mcpBuiltReadme
foreach ($marker in @('yarn add --dev @salt-ds/mcp', './node_modules/@salt-ds/mcp/bin/salt-mcp.js')) {
  if (-not $mcpReadmeText.Contains($marker)) { throw "Built MCP README is missing: $marker" }
}

$dateRoot = (Resolve-Path -LiteralPath 'dist/salt-ds-date-adapters').Path
$dateManifest = Get-Content -Raw -LiteralPath (Join-Path $dateRoot 'package.json') |
  ConvertFrom-Json -ErrorAction Stop
if ($dateManifest.PSObject.Properties.Name -contains 'saltSourceEntrypoints') {
  throw "Built Date manifest exposes saltSourceEntrypoints."
}
$dateTargets = @($dateManifest.exports.PSObject.Properties.Value | ForEach-Object {
  $_.types
  $_.import
  $_.require
} | Where-Object { $_ } | ForEach-Object { $_ -replace '^\./', '' })
foreach ($target in $dateTargets) {
  $targetPath = [IO.Path]::GetFullPath((Join-Path $dateRoot $target))
  if (-not $targetPath.StartsWith($dateRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Date export target escapes the package: $target"
  }
  if (-not (Test-Path -LiteralPath $targetPath -PathType Leaf)) {
    throw "Date export target is missing: $target"
  }
}

$datePackLines = & npm pack --json --dry-run --ignore-scripts "./dist/salt-ds-date-adapters"
$datePackExit = $LASTEXITCODE
if ($datePackExit -ne 0) { throw "Date Adapters dry-run failed." }
$datePackJson = $datePackLines -join [Environment]::NewLine
$datePack = @($datePackJson | ConvertFrom-Json -ErrorAction Stop)
if ($datePack.Count -ne 1) { throw "Expected one Date dry-run record." }
$datePackedFiles = @($datePack[0].files.path | ForEach-Object { $_ -replace '\\', '/' })
$missingDateTargets = @($dateTargets | Where-Object { $_ -notin $datePackedFiles })
if ($missingDateTargets.Count) {
  throw "Date package omits export targets: $($missingDateTargets -join ', ')"
}
if ($datePackedFiles | Where-Object { $_ -like 'src/*' }) {
  throw "Date package contains source files."
}

node --input-type=module -e "import assert from 'node:assert/strict'; import fs from 'node:fs'; const checks=[['dist/salt-ds-core/package.json',['@salt-ds/core','@salt-ds/lab']],['dist/salt-ds-icons/package.json',['@salt-ds/icons','@salt-ds/core','@salt-ds/lab']],['dist/salt-ds-lab/package.json',['@salt-ds/lab']]]; for(const [file,forbidden] of checks){const p=JSON.parse(fs.readFileSync(file,'utf8'));const fields=['dependencies','peerDependencies','optionalDependencies'];const keys=new Set(fields.flatMap((field)=>Object.keys(p[field]??{})));for(const name of forbidden)assert.equal(keys.has(name),false,file+': '+name)} console.log('Built dependency boundaries passed.')"
if ($LASTEXITCODE -ne 0) { throw "Built dependency-boundary check failed." }
```

Do not publish or create a tarball in the workspace.

Run non-MCP tests once, then the authoritative MCP composite once:

```powershell
yarn vitest run --exclude "packages/mcp/src/**"
if ($LASTEXITCODE -ne 0) { throw "Non-MCP Vitest partition failed." }
yarn release:verify:mcp:after-build
if ($LASTEXITCODE -ne 0) { throw "MCP release composite failed." }
yarn changeset status
if ($LASTEXITCODE -ne 0) { throw "Final Changesets status failed." }
git diff --check
if ($LASTEXITCODE -ne 0) { throw "Git diff whitespace check failed." }
git status --porcelain=v1 --untracked-files=all
if ($LASTEXITCODE -ne 0) { throw "Final Git status failed." }
```

After Phase 1, the release composite's `test:ai-tooling` owns all
`packages/mcp/src` tests, so do not separately rerun its typechecks, AI test
suite, runtime/public-surface budgets, package check, or consumer smoke here.

Confirm from output and final inspection:

- MCP remains 3 tools, 1 resource, and 2 templates;
- the package checker reproduces and byte-compares catalog output across its
  temporary build, workspace, distribution, and extracted tarball;
- installed consumer checks cover package identity, TypeScript, real MCP
  behavior, rendering, Tab focus, activation, and Axe;
- no evaluator, evidence receipt, Skills CLI, skill source/hash, or retired
  phase-named owner runs;
- Date packed metadata/targets and MCP onboarding are correct;
- Changesets still lists all six affected packages; and
- final status contains only this plan's edits plus the preflight user work.

The local sequence deliberately does not run CI's Node 22 consumer job or its
React 16/17/18 Cypress resolution matrix in this dirty workspace: the latter
mutates dependency resolutions and the lockfile. Before publication, require
those GitHub Actions jobs to pass, or reproduce them in disposable worktrees.
If neither receipt is available, report those matrices as unverified and do not
claim full release authorization.

## Done criteria

- [x] Repository evaluation scripts, fixtures, archive tests, operational
      reports, and release calls are gone.
- [x] The private skill workspace, tree-hash/installation logic, arguments,
      tests, and exact lock stanza are gone.
- [x] Consumer smoke rejects unknown options and retains installed MCP, types,
      UI, keyboard, activation, and accessibility coverage.
- [x] Public MCP/site docs provide tested local-stdio onboarding without stale
      pause, evaluation-prerequisite, or skill-install wording.
- [x] Retained diagnostics/tests use durable behavioral names.
- [x] Project reads compare opening and post-read descriptor state through a
      production-path regression.
- [x] Aggregate declared decoded catalog content is bounded before pack work or
      eager decoding, and the real server factory rejects late corruption.
- [x] Writer collision reuse rejects linked/non-directory generation children
      while preserving prior and external data.
- [x] Dead Date declarations are gone and built/packed Date metadata excludes
      source-only fields while retaining every export target.
- [x] The Core root-barrel regression passes with exact values and alias
      identity.
- [x] Changesets lists MCP, Core, Theme, Date Adapters, Icons, and Lab at the
      intended levels.
- [x] Immutable installation leaves `yarn.lock` byte-identical.
- [x] Local CI-aligned static checks, non-MCP tests, and the authoritative MCP
      release composite pass against the final successful build.
- [x] Node 22 consumer and React 16/17/18 Cypress CI receipts are green, or are
      explicitly reported as outstanding before publication. They are
      outstanding locally and remain mandatory clean-checkout CI gates.
- [x] No unplanned or user-owned worktree change was lost or overwritten.

## STOP conditions

Stop and report rather than improvising if:

- a module selected for deletion is imported by published code or a retained
  normal package/consumer gate;
- a supported public consumer or production installation path for
  `@salt-ds/skills` is discovered;
- product/compliance owners require the evidence artifacts in the current
  checkout, or require a machine-readable evaluation pass/release authority;
- product owners still intend to withhold MCP publication, which would make the
  proposed public onboarding inaccurate;
- preserving MCP consumer behavior would require losing installed type, MCP,
  render, keyboard, interaction, or accessibility checks;
- lock reconciliation changes any resolution, checksum, version, or stanza
  other than the exact skill workspace entry;
- a supported filesystem cannot provide stable descriptor metadata or identify
  the linked/junction child used by the focused regressions;
- the current catalog exceeds the existing aggregate runtime ceiling;
- a fix requires a public MCP schema/error change, a catalog schema bump,
  dependency change, publication lock, or a new generic framework;
- Changesets computes an unexpected stable release for Lab;
- built/temporary/packed catalog bytes diverge, package output contains
  evaluation/build-only artifacts, or installed consumer behavior changes;
- verification requires publication, versioning, changelog generation, or
  destructive cleanup; or
- an unexplained in-scope hunk overlaps pre-existing user work.

## Maintenance notes

Future comparative evaluation belongs in an independently trusted external
system and must not grant release authority from mutable repository files. If
measured cross-host demand later justifies automatic Salt-task activation,
design a separately versioned opt-in skill with its own compatibility and
release gate. Keep future project-file stability checks local to the project
reader; do not generalize catalog build reads without a demonstrated failure.
Profile catalog startup before adding record policies, indexes, workers, or
timing budgets.
