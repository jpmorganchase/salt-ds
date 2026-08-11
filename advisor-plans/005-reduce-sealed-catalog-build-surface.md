# Plan 005: Reduce MCP catalog and validation complexity

> **Executor instructions:** This is a post-release P3 maintenance plan. Do not
> begin until Plan 006 is `DONE`; it owns the correctness fix for token evidence.
> Follow the characterization gates before deleting or excluding anything.
> Preserve every catalog integrity, mutation, containment, reproducibility, and
> publication guarantee. Update only this plan's row in
> `advisor-plans/README.md` when complete.
>
> **Drift check (run first):** inspect the complete dirty diff for every in-scope
> path and rerun caller searches. This plan was written at `cfa29d6e3` against
> uncommitted work. Stop if Plan 006 has changed ownership or made a proposed
> deletion reachable.

## Status

- **Plan status:** DONE — safe reductions implemented and release-verified;
  inventory narrowing rejected by the provenance STOP gate
- **Priority:** P3
- **Effort:** L
- **Risk:** MEDIUM
- **Depends on:** Plan 006
- **Category:** maintainability / build performance / test fidelity
- **Planned at:** commit `cfa29d6e3`, 2026-08-10, including the dirty working tree

## Why this matters

The branch has necessary integrity machinery, but it also retains several
thousand lines that do not protect a production path. The sealed catalog
inventories test-shaped files that should not affect catalog semantics, two
generated-artifact validators and a registry cache are reachable only from
their own tests, a dead build-info implementation has its own dead test, and
the stability tests call a smaller detached helper instead of the production
orchestration. `CatalogStoreV2` also ships a process-global, never-evicted read
counter solely to support tests.

This plan removes demonstrated dead surface and moves tests onto observable
production behavior. It does not remove defensive checks or attempt the much
larger V2/legacy registry-model migration.

## Current state

- `core/build/catalogInputPatterns.json:9-12` includes broad package `src` and
  `stories` trees. The reviewed inventory contained 222 test-shaped inputs.
  Treat that count as a baseline to recompute, not a frozen assertion.
- `core/build/buildRegistryTokens.ts:221-298` formerly admitted test/story text
  into token applicability. Plan 006 fixes that semantic defect first. This
  plan may narrow the canonical inventory only after proving which excluded
  bytes are no longer consumed by any producer.
- `core/generatedArtifactValidation.ts:1-984` and
  `core/generatedArtifactSurface.ts:1-89` have no runtime, build, package, or
  public-export caller. Their consumers are
  `core/__tests__/generatedArtifactValidation.spec.ts` and two assertions in
  `src/__tests__/tokenPolicyBuild.spec.ts`.
- `core/registry/runtimeCache.ts:1-366` exports four lookup/index helpers at
  lines 189, 210, 261, and 357. Repository-wide caller search finds no caller
  outside that file.
- `core/build/buildRegistryBuildInfo.ts:1-137` is called only by its 105-line
  test. Real construction sets `build_info: null` in `buildRegistry.ts:281-285`,
  and the packed projection returns null in
  `catalogRegistryProjection.ts:1493-1495`.
- `core/catalog/catalogStoreV2.ts:72-105,165-174` owns a global file-read map
  and exports test-only reset/read functions. Production re-exports them through
  `core/registry/lazyRegistry.ts:1-16`; tests use them to infer lazy loading.
- `packages/mcp/scripts/buildRegistry.mjs:733-758` exports
  `captureStableCatalogInventory` only for
  `src/__tests__/packagePublishBoundary.spec.ts:196-252`. Production performs a
  richer source/dependency/tool/two-bundle/metafile sequence at lines
  1168-1230, so a removed production guard can leave the detached tests green.
- TypeScript `core/catalog/catalogPortablePath.ts:1-39` and JavaScript
  `scripts/catalogBuildIdentity.mjs:26-75` independently define portable path
  rules and already differ on Windows superscript device-name aliases. They
  cannot import one implementation across the sealed generator boundary, but
  they can share a conformance corpus.

## Target outcome

- Only bytes capable of changing catalog or package output are sealed inputs.
- Dead validation/cache/build-info modules and their self-justifying tests are
  removed after caller proof.
- Lazy-load tests assert behavior without permanent process-global test state.
- Mutation/reproducibility tests execute the exact production orchestration.
- Cross-runtime path classifiers remain separate implementations but are bound
  to one data corpus.
- Expected net reduction is roughly 1,500 production lines and 1,700–2,000 test
  lines before any smaller test rewrites.

## Commands you will need

| Purpose               | Command                                                                                                                                                                                                      | Expected on success                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ---------------------------------- | --------------------------------- | ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Caller proof          | `rg -n "validateGeneratedArtifactRegistryEvidence                                                                                                                                                            | validateGeneratedSaltArtifactSurface     | findCanonicalPackageExportEvidence | findCanonicalComponentExportOwner | getRegistryIndexes | buildRegistryBuildInfo" packages/mcp/src packages/mcp/scripts scripts` | only documented in-scope definitions/tests before deletion; no matches after cleanup except compatibility types deliberately retained |
| Inventory/build tests | `yarn vitest run packages/mcp/src/core/__tests__/catalogInputInventory.spec.ts packages/mcp/src/__tests__/packagePublishBoundary.spec.ts packages/mcp/src/__tests__/registryCoverage.spec.ts --maxWorkers=1` | exit 0                                   |
| Catalog behavior      | `yarn vitest run packages/mcp/src/core/__tests__/catalogV2.spec.ts packages/mcp/src/core/__tests__/lazyRegistry.spec.ts packages/mcp/src/__tests__/tokenPolicyBuild.spec.ts --maxWorkers=1`                  | exit 0                                   |
| Typecheck/suite       | `yarn typecheck:mcp` then `yarn test:ai-tooling`                                                                                                                                                             | both exit 0                              |
| Final bytes           | `yarn workspace @salt-ds/mcp build:registry`, `yarn workspace @salt-ds/mcp build:package`, then `yarn release:verify:mcp:after-build`                                                                        | fresh/workspace/dist/tarball bytes agree |

Run artifact commands only after the operator permits ignored-output refresh.
Do not install dependencies, publish, version, or run the destructive root
build in the dirty worktree.

## Scope

**In scope:**

- `packages/mcp/src/core/build/catalogInputPatterns.json`
- the production enumerators and focused tests proven to admit excluded inputs,
  especially `buildRegistryTokens.ts` and `buildRegistryDeprecations.ts`
- `packages/mcp/src/core/__tests__/catalogInputInventory.spec.ts`
- `packages/mcp/src/core/generatedArtifactValidation.ts` (delete if still dead)
- `packages/mcp/src/core/generatedArtifactSurface.ts` (delete if still dead)
- `packages/mcp/src/core/__tests__/generatedArtifactValidation.spec.ts`
  (delete with the dead subsystem)
- detached assertions in `packages/mcp/src/__tests__/tokenPolicyBuild.spec.ts`
- `packages/mcp/src/core/registry/runtimeCache.ts` (delete if still dead)
- `packages/mcp/src/core/build/buildRegistryBuildInfo.ts` and its dedicated
  test (delete if still dead)
- `packages/mcp/src/core/catalog/catalogStoreV2.ts`,
  `packages/mcp/src/core/registry/lazyRegistry.ts`, and their existing tests
- `packages/mcp/scripts/buildRegistry.mjs` and
  `packages/mcp/src/__tests__/packagePublishBoundary.spec.ts`
- the two portable-path implementations, their existing tests, and one small
  shared JSON conformance corpus if required

**Out of scope:**

- `CatalogStoreV2` integrity, schema, cross-reference, decompression, stored or
  decoded byte bounds, eager server validation, or public result budgets.
- The public `build_info` compatibility field/type or its null runtime value.
- Evidence types and validators that still have a production producer/consumer.
- Removing production docs, examples, stories, manifests, generator files, or
  any byte actually consumed by generation or package building.
- Weakening undeclared-read/glob checks, link/file-identity checks,
  before/after snapshots, dependency snapshots, double-bundle equality,
  metafile equality, or first-party-input binding.
- Replacing `CatalogStoreV2` with the legacy `SaltRegistry`, removing
  `catalogRegistryProjection.ts`, or redesigning review rules. That migration is
  a separate high-risk architecture decision.
- A generic dependency-injection or validation framework.

## Steps

### Step 1: Re-characterize inputs after Plan 006

Enumerate every test-, fixture-, story-, and QA-shaped path in the active input
manifest and map each path to every production `globCatalogInputs` call that can
read it. Use mutation tests in temporary fixtures to distinguish:

- a byte that changes a catalog fact/content object;
- a byte used only to build/test the generator;
- a byte not read by generation at all.

Plan 006's token regression must already prove that QA stories do not become
token applicability evidence. Do not assume all stories are dead: retain any
story or example used for published documentation/evidence. If a test-shaped
file intentionally contributes a fact, carve it out and document the owner
instead of excluding it wholesale.

**Verify:** focused producer tests identify production/test mutations by
semantic output, not merely by undeclared-input rejection.

### Step 2: Make canonical inventory and producer globs agree

Add portable negative inventory patterns only for the characterized dead set,
and apply matching ignores to every broad producer glob that could otherwise
enumerate those paths. Keep `assertCompleteCatalogInputSet` fail closed: no
special exemption may let a producer read a non-inventoried file.

Tests must prove:

- an excluded test-only edit leaves inventory, generator, semantic, and
  publication identity unchanged;
- a production edit changes the appropriate identity;
- an undeclared production read/glob still rejects;
- included case/NFC/link collisions remain rejected; and
- excluded linked directories cannot route an included production path.

If catalog records/content change, stop and identify the producer before
continuing.

### Step 3: Delete the four dead subsystems after fresh caller proof

Run caller searches including source, scripts, package exports, declaration
entrypoints, and tests. If the reviewed call graph remains true:

1. Delete `generatedArtifactValidation.ts`, `generatedArtifactSurface.ts`, and
   `generatedArtifactValidation.spec.ts`; remove only their detached assertions
   from `tokenPolicyBuild.spec.ts`.
2. Delete `registry/runtimeCache.ts`.
3. Delete `buildRegistryBuildInfo.ts` and
   `buildRegistryBuildInfo.spec.ts`; retain `build_info: null` and compatibility
   types/projections.

Do not replace any deleted module with a compatibility barrel or new facade.
Run typecheck after each deletion group so a real erased or dynamic boundary is
found immediately.

### Step 4: Remove the process-global catalog read counter

Delete `fileReadCounter`, `countRead`, the two `__*ForTests` exports, and the
lazy-registry re-exports. Rewrite lazy-load tests around observable behavior:

- construct a store with one family not yet loaded;
- mutate/remove that unread artifact and prove first access reaches it;
- prove an already loaded family remains available from the store cache after
  its backing file becomes unavailable; and
- use a fresh store for every case so no process-global reset exists.

Keep all production descriptor, digest, identity, and eager-server-validation
paths unchanged. Do not add a callback, injectable filesystem, or alternative
test-only counter to production.

### Step 5: Test the real sealed-bundle orchestration

Remove `captureStableCatalogInventory`. Extract only the existing production
sequence into a named internal function that production itself calls and that
the mutation tests can invoke with the narrowest necessary temporary-fixture
seams. Preserve in that function:

- source inventory equality before/between/after both bundles;
- dependency inventory and verified tool snapshot stability;
- first/final bundle bytes, SHA-256, and metafile equality;
- first-party bundle-input binding to source inventory; and
- runtime/tool identity checks before generation.

The tests must fail when the corresponding production guard is removed. If
testing requires a public API or a general DI container, stop and keep the
orchestration inline rather than adding more production surface.

### Step 6: Bind portable path implementations to one corpus

Create a small JSON corpus of accepted and rejected repository-relative paths,
including NFC, case, trailing dot/space, control characters, drive/UNC forms,
ordinary device names, and superscript COM/LPT aliases. Run the TypeScript and
JavaScript classifiers against the same corpus in their existing tests.

Keep both implementations because the sealed root build script cannot depend
on compiled MCP runtime code. Align their behavior; do not create a package or
runtime abstraction just to share executable code.

### Step 7: Prove semantic equivalence and refresh once

Before the build, retain the active manifest and canonical decoded record/content
projection outside the output directory. After source checks pass and refresh
is authorized:

1. build the registry;
2. compare semantic records/content to the retained projection;
3. confirm only characterized dead inputs disappeared;
4. build the MCP package;
5. run the full after-build release composite and public budgets; and
6. compare tracked and nonignored untracked hashes before/after.

Expected differences are smaller input/generator/publication identity and
fewer source/test lines. Tool/resource counts, runtime facts, search/review
behavior, integrity checks, and package byte agreement remain unchanged.

## Test plan

- Producer mutation tests for excluded and retained source classes.
- Inventory identity and undeclared-read fail-closed tests.
- Typecheck-driven dead-module removal plus retained evidence compatibility.
- Behavioral lazy/cache tests without counters.
- Production-orchestration mutation and ABA regressions.
- Shared portable-path conformance corpus on Windows and POSIX CI.
- End-to-end catalog semantic comparison and four-way package byte agreement.

## Done criteria

- [ ] REJECTED — narrowing the sealed inventory changes published
      `repository_directory` source provenance, so test-shaped bytes remain
      inputs until that public provenance contract is redesigned explicitly.
- [ ] REJECTED — for the same reason, test-only edits still rotate source and
      publication identity even though they cannot create token applicability.
- [x] Dead validation, runtime-cache, and build-info modules/tests are gone.
- [x] Lazy loading is tested behaviorally with no process-global test counter.
- [x] Stability tests execute the exact production orchestration.
- [x] Both path classifiers pass one cross-platform conformance corpus.
- [x] Every integrity/reproducibility/publication guard remains fail closed.
- [x] Rebuilt semantic catalog is equivalent and package verification passes.
- [x] Production/test line reduction and the rejected inventory experiment are
      recorded below; the index row is `DONE`.

## Completion receipt (2026-08-11)

- Fresh caller proof found no production, package, declaration, dynamic-import,
  or public caller for the generated-artifact validators/surface, registry
  runtime cache, or build-info implementation. Those four production modules,
  their two self-justifying test files, and the detached token-policy assertions
  were deleted. A final repository search found zero retired-name callers.
- The six deleted files removed exactly 1,576 production lines and 1,720 test
  lines; deleting the detached token-policy block removed another 100 test
  lines. Across the complete tracked in-scope path set, the current branch diff
  is 830 additions and 3,750 deletions, plus the 40-line shared path corpus: a
  net reduction of 2,880 physical lines. Some rewritten files also contain
  earlier Plan 006 work, so the exact deletion totals above are the clean
  plan-local accounting.
- `CatalogStoreV2` no longer ships the process-global file-read counter or its
  test-only exports. Lazy-loading, cache retention, whole-catalog prefetch, and
  corruption behavior are asserted through real artifact reads and fresh store
  instances.
- Production now calls `verifySealedGeneratorBundleStability`; its tests cover
  stable success, source mutation, an ABA-style bundle mutation, and mutation
  after the final bundle. The detached `captureStableCatalogInventory` helper
  is gone.
- TypeScript and root-build JavaScript portable-path classifiers share
  `scripts/fixtures/catalogPortablePath.cases.json`. Both reject leading
  whitespace and superscript COM/LPT device aliases consistently while
  remaining separate implementations across the sealed generator boundary.
- Producer globs for token, deprecation, and pattern evidence exclude
  test/story inputs, so QA text cannot become published evidence. The attempted
  canonical-inventory exclusion removed exactly 227 inputs, but changed eight
  public `repository_directory` source records because those records bind all
  package-directory bytes. The STOP condition fired; the inventory negatives
  and their tests were backed out. No broadened or weakened identity contract
  was accepted implicitly.
- The corrected build contains 4,158 inputs: exactly the previous 4,164 inputs
  minus the six deleted dead files, with zero unexpected additions or removals.
  Its semantic digest exactly matches the pre-plan baseline:
  `110af09596bf3046f0ac731f0c502c9d2e88583cf1d58a1fc68310d01eeabb7d`.
- Root and MCP typechecks passed. Focused suites passed 151 tests before the
  provenance decision and 34 tests after the inventory rollback. The final
  `yarn release:verify:mcp:after-build` passed in 566.4 seconds with 58 files
  and 832 tests, 22,734 runtime-reachable physical lines, and exactly three
  tools, one resource, and two resource templates.
- The final MCP tarball contains 34 files: 3,027,430 compressed bytes,
  12,309,690 unpacked bytes, and 11,099,519 generated bytes. Tarball SHA-256:
  `2e5bffc4dc7fc79e567c0a6d5cb8a9880ad382b6dff4f29da66c585b6b36ab8c`.
  Installed package-tree SHA-256:
  `b31e79d982321ea36ab1362d86a801dfc4a47c101b82d822ac4cf2dfea434f6b`.
- Catalog manifest SHA-256:
  `ad54cc0b39e286aa87204ebb4efe62ec9fd8cddce6715deb11bc54cd7f469476`;
  input inventory digest:
  `2e13d6d8999144eae2a7c0a98282e8cb86966811df8a1bc033c5dc07d8e3dec1`.
  Workspace and packaged manifests are byte-identical; no build debris remains.
- The release composite preserved the exact pre-verification Git status: 173
  entries with normalized SHA-256
  `dfc9a24ccb71babb13e336079be8c8055d42b5eb143d2c50df4874dbd0cf3ebe`.
  It did not stage, publish, install/update dependencies, or inspect
  `.salt-eval-cache`. Local readiness remains **ready for release after CI**.

## STOP conditions

Stop and report if:

- an excluded byte contributes a published fact, content object, declaration,
  example, build artifact, or package byte;
- any proposed deletion gains a production, package, dynamic-import, or public
  declaration caller;
- a simplification weakens identity, mutation, containment, budget,
  reproducibility, rollback, or eager-validation behavior;
- semantic records/content change rather than identity metadata only;
- real orchestration cannot be tested without adding a public/test-only runtime
  hook; or
- verification fails twice after one focused correction.

## Maintenance notes

Every new generator glob must be a subset of the canonical inventory and have a
mutation-stability test. Production-only helpers require a production caller;
tests must not keep an abandoned subsystem alive. Prefer behavioral cache tests
and shared data corpora over global counters or duplicated test logic.
