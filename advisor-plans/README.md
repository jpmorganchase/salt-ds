# MCP and AI implementation plans

Reconciled on 2026-08-10 against branch `mcp`, commit `cfa29d6e3`, and the
complete dirty working tree. These are advisor handoffs. An executor must read
the selected plan completely, preserve every tracked/untracked change, honor
STOP conditions, and update only that plan's row and completion receipt.

The tracked `plans/AI_MCP_*.md` deletions are intentional historical cleanup.
Those Phase-numbered remediation records and the retired evaluation/Skills
subsystems are not an active queue. Git history preserves them; do not restore
or replay them.

## Queue

| Plan                                                      | Title                                           | Priority | Effort | Depends on | Status                                                          |
| --------------------------------------------------------- | ----------------------------------------------- | -------- | ------ | ---------- | --------------------------------------------------------------- |
| [001](./001-finish-mcp-cleanup.md)                        | Finish the MCP cleanup and release              | P1       | L      | —          | DONE — historical cleanup verified; artifact receipt superseded |
| [002](./002-bound-and-fail-close-project-discovery.md)    | Make project discovery bounded and fail closed  | P1       | M      | —          | DONE — implemented and verified 2026-08-10                      |
| [003](./003-guarantee-advertised-resource-readability.md) | Guarantee every advertised resource is readable | P1       | L      | 002        | DONE — implemented and release-verified 2026-08-10              |
| [004](./004-finalize-date-adapters-publication.md)        | Finalize the Date Adapters publication contract | P1       | M      | —          | DONE — implemented and package-verified 2026-08-10              |
| [005](./005-reduce-sealed-catalog-build-surface.md)       | Reduce MCP catalog and validation complexity    | P3       | L      | 006        | DONE — safe reductions verified; input narrowing rejected       |
| [006](./006-close-final-mcp-date-release-findings.md)     | Close final MCP and Date release findings       | P1       | L      | —          | DONE — implemented and release-verified locally 2026-08-11      |

Status values are `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED — <reason>`,
`REJECTED — <reason>`, and `STALE — <reason>`.

## Recommended sequence

Plans 001–006 are complete. Require the clean-checkout Node 22/24 and React
16/17/18 CI matrices before publication; local status is
`ready for release after CI`. Plan 005 completed the safe dead-surface and test
fidelity work, while its inventory-narrowing experiment correctly stopped and
was backed out when public source provenance changed.

Plans 001–004 are historical records, not dependencies to replay. Their checked
criteria describe work already completed; later findings are owned explicitly
by Plans 005 and 006.

## Preserved guarantees

- Exactly three MCP tools, one resource, and two resource templates.
- Whole-catalog integrity/cross-reference validation before server creation
  returns, including stored/decoded aggregate limits and bounded decompression.
- Restricted-by-default project inspection and reauthorization of retained
  context.
- Read-only MCP behavior with no repository editing or network access at
  runtime.
- Deterministic catalog generation with source/dependency inventories,
  mutation detection, double-bundle checks, staged publication, and package
  byte agreement.
- Node 22+, ESM, CJS, and TypeScript compatibility; Date's dual ESM/CJS emit is
  intentional.
- Installed-consumer checks for declarations, MCP behavior, rendering, real
  Tab traversal, activation, and Axe before publication.
- No repository-local comparative evaluator, evidence archive, private Skills
  workspace, or retired Phase-number release authority.
- No reset, clean, silent overwrite, or traversal of preserved
  `.salt-eval-cache` user data.

## Explicitly deferred decisions

- **Catalog writer orphan reclamation:** a failed root-manifest rename after a
  new immutable generation is installed can leave an unreferenced generation.
  Immediate deletion is unsafe with concurrent writers and manifest-pinned lazy
  readers. Create a separate plan only after choosing serialized-writer locking
  or lease/grace-aware garbage-collection ownership. This is a low-severity
  storage/recovery issue, not a release-gate bypass.
- **Legacy/V2 registry-model bridge:** build creates a legacy `SaltRegistry`,
  normalizes it to V2, and runtime projects V2 back to the legacy review model
  through the 1,576-line `catalogRegistryProjection.ts`. Replacing that bridge
  could remove substantial code, but it is a high-risk review-rule migration,
  not release cleanup. Require a dedicated design and equivalence corpus before
  scheduling it.
- **Catalog input identity versus public source provenance:** package-directory
  source records intentionally bind every inventoried byte, including tests.
  Excluding test-shaped files therefore changes public provenance even when no
  fact/content producer reads them. Plan 005 rejected a silent narrowing. Any
  future reduction requires a dedicated contract decision that separates build
  identity from published directory evidence without weakening mutation or
  reproducibility guarantees.
- **A single generic package verifier:** still disproportionate. Plan 006
  strengthens the demonstrated Date boundary using the existing narrow verifier
  and isolated-consumer conventions.
- **Dependency advisory churn without a reachable path:** the audit found no
  branch-introduced exploitable advisory. Do not mix unrelated lockfile upgrades
  into these plans; handle dependency hygiene separately with current audit
  evidence and immutable-install verification.
- **Competitor-parity feature additions:** external MCP comparisons did not
  establish a missing release requirement. Keep the surface small unless a
  supported consumer need justifies a new tool/resource contract.

## Rejected approaches

- Restoring repository-local comparative evaluation or the unpublished Skills
  package: intentionally retired and not release-authorizing.
- Raising public byte limits instead of bounding producers: Plan 003 fixed the
  actual producer/read contract.
- Claiming pre-2025-06 protocol support because initialization succeeds: tool
  result schemas are the compatibility boundary.
- Treating QA/test text as implementation evidence: producer globs exclude it.
  Removing the same bytes from sealed inventory was separately rejected because
  public package-directory provenance binds them.
- Removing defensive catalog identity, mutation, containment, budget, or eager
  validation checks to reduce line count: Plan 005 targets only dead or
  behaviorally replaceable surface.
- Root `yarn build` in the dirty worktree: Icons/Countries regeneration and CSS
  bundling can touch tracked source. Exercise it in a clean checkout or
  disposable worktree.

## Current artifact state

Plan 006 records the current Date receipt: its 37-file tarball and 18 export
targets passed six isolated consumers. Plan 005 records the latest MCP receipt.
The MCP 34-file tarball SHA-256 is
`2e5bffc4dc7fc79e567c0a6d5cb8a9880ad382b6dff4f29da66c585b6b36ab8c`;
the catalog manifest SHA-256 is
`ad54cc0b39e286aa87204ebb4efe62ec9fd8cddce6715deb11bc54cd7f469476`.
All 4,158 manifest inputs match the current worktree, semantic digest remains
`110af09596bf3046f0ac731f0c502c9d2e88583cf1d58a1fc68310d01eeabb7d`,
and the MCP after-build release verifier passed. Clean-checkout CI remains the
only publication gate.

### Safe future refresh gate

Use this sequence after any future catalog-relevant source change:

```powershell
yarn workspace @salt-ds/date-adapters build
yarn check:date-adapters:pack
yarn workspace @salt-ds/mcp build:registry
yarn workspace @salt-ds/mcp build:package
yarn release:verify:after-build
```

Before running it, require all of the following:

- Node 24 and the repository Yarn are already installed; do not bootstrap or
  update dependencies.
- No generator-influencing environment variable rejected by
  `packages/mcp/scripts/buildRegistry.mjs` is set.
- `packages/mcp/generated`, `dist/salt-ds-mcp`, and
  `dist/salt-ds-date-adapters` are ordinary contained directories, not links or
  reparse points, with no tracked or unexpected user files.
- No `.registry-tools-*`, generation-staging, or manifest-publishing debris is
  present before or after a build step.
- Hash and length for every tracked and nonignored untracked file are captured
  before the artifact phase and byte-identical afterward. Exclude ignored
  output, dependencies, and `.salt-eval-cache`; do not traverse the cache.

Do not delete old catalog generations: readers may still be pinned to them.
Record new hashes only in the latest completed artifact-owning plan receipt
after every check passes.
