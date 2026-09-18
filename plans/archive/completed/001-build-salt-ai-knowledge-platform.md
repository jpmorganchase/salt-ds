# Plan 001: Build the Salt AI knowledge platform release candidate, CLI scanner, documentation channels, samples, and optional thin MCP adapter

> **Archived complete:** This is closed Plan 001 ancestry, preserved for
> provenance only. It dispatches no work. Use the
> [current plan index](../../README.md) for active authority.

> **Scope amendment — 2026-08-29:** This plan ends at the Unit 07 locally
> verified release-candidate boundary. Unit 07 was reopened and repaired for
> clean-checkout and cross-line-ending reproducibility after its original
> evidence proved dependent on mixed working-tree line endings. Units 08a
> through 09c below are
> retained as publication design history, but ownership of version
> materialization, npm/registry authority, trusted publishing, live web
> deployment, promotion, rollback, and post-publication activation has moved to
> [Plan 003](../../003-publish-salt-ai-release-candidate.md). Do not execute those
> units under Plan 001. A local `npm pack`, clean-room tarball install, consumer
> smoke test, or web-artifact build is verification rather than publication and
> remains in Plan 001. Plan 001 authorizes no registry or deployment mutation.

> **Successor amendment — 2026-08-30:** Plan 001 is closed historical ancestry.
> Do not reopen one of its units for product correction, new evaluation, user
> research, competitor work, scanner hardening, or release preparation. The sole
> tracked successor for those decisions is
> [Plan 004](../../004-validate-salt-ai-product-wedge.md). Plan 003 remains
> ineligible until Plan 004 records a final PASS bound to exact candidate bytes.
> A Plan 004 `CUT` or `DEFER` is a valid product decision and does not reopen
> Plan 001.

> **Executor instructions:** This is a program plan made of ordered execution
> units. Implement one code-bearing execution unit per branch and pull request,
> subject only to the explicitly bounded Unit 08c release-state refs and Unit
> 09a→09b→09c launch lifecycle described
> under **Git and pull-request workflow**; never attempt
> the entire plan as a single change. Read this file completely before starting
> any unit. Run every unit's verification commands and confirm the expected
> result before moving to the next unit. Preserve all existing integrity,
> applicability, filesystem-boundary, package, and offline guarantees unless
> this plan explicitly replaces them. If any STOP condition occurs, stop and
> report it rather than improvising.
>
> **Drift check (run before every execution unit):** Read the checkpoint SHA for
> the unit from `plans/README.md`. The header's `Planned at` SHA is audit evidence,
> not an executable checkpoint. Unit 00a starts only after a plan-control commit
> has landed this complete plan set and replaced its tracker placeholder with a
> concrete default-branch SHA. After each unit merges, update each newly eligible
> successor's checkpoint to the latest default-branch commit containing all of
> its dependencies. Do not keep comparing later units with the original plan
> commit. Replace
> `<checkpoint-sha>` below with the tracker value. If the tracker still says
> `set after...`, or the value is not a commit, STOP instead of falling back to
> `8c3bd5f1b`.
>
> PowerShell:
>
> ```powershell
> $planCheckpoint = "<checkpoint-sha>"
> if ($planCheckpoint -eq "<checkpoint-sha>") { throw "Set the Plan 001 unit checkpoint from plans/README.md" }
> git rev-parse --verify "$planCheckpoint^{commit}"
> if ($LASTEXITCODE -ne 0) { throw "Invalid Plan 001 unit checkpoint" }
> git merge-base --is-ancestor $planCheckpoint HEAD
> if ($LASTEXITCODE -ne 0) { throw "Plan 001 checkpoint is not an ancestor of HEAD" }
> git diff --stat "$planCheckpoint..HEAD" -- plans package.json yarn.lock .gitignore .yarn .changeset .github/workflows packages tooling scripts site README.md CONTRIBUTING.md AGENTS.md docs workflow-examples examples evals skills templates
> git status --short --untracked-files=all
> ```
>
> POSIX shell:
>
> ```sh
> plan_checkpoint="<checkpoint-sha>"
> test "$plan_checkpoint" != "<checkpoint-sha>" || { echo "Set the Plan 001 unit checkpoint from plans/README.md" >&2; exit 1; }
> git rev-parse --verify "${plan_checkpoint}^{commit}" >/dev/null
> git merge-base --is-ancestor "$plan_checkpoint" HEAD
> git diff --stat "${plan_checkpoint}..HEAD" -- plans package.json yarn.lock .gitignore .yarn .changeset .github/workflows packages tooling scripts site README.md CONTRIBUTING.md AGENTS.md docs workflow-examples examples evals skills templates
> git status --short --untracked-files=all
> ```
>
> Compare the current files with the evidence and contracts below. Expected
> changes from already completed units are not a failure, but unplanned overlap
> or a changed public contract is a STOP condition until this plan is
> reconciled. Never reset, restore, stash, clean, or overwrite user work.
> Expected preflight result: the checkpoint resolves and is an ancestor; every
> dependency's completion SHA in the tracker is also an ancestor; and the only
> expected post-checkpoint plan edit is the tracker transition that dispatched
> this unit. Any unrelated public/package/release change requires reconciliation.
> An implementation PR cannot know its merge SHA: after merge, the merge
> operator or automation lands a plan-control-only update that marks it done,
> records the completion SHA, and sets each newly eligible successor checkpoint
> to the latest default-branch commit containing all dependencies. Do not
> dispatch or guess a successor checkpoint before that update lands.

## Status

- **Status:** DONE — local release candidate complete through Unit 07
- **Priority:** P1
- **Effort:** L — multi-phase program; do not execute in one PR
- **Risk:** HIGH — moves a large internal package boundary and creates the first
  long-lived public Knowledge, CLI, and optional MCP contracts
- **Depends on:** none
- **Category:** direction / architecture / DX / docs / tests
- **Planned at:** commit `8c3bd5f1b`, 2026-08-26

## Why this matters

Salt currently places its normalized documentation, examples, API facts,
project inspection, deterministic review, and distribution inside
`@salt-ds/mcp`. That implementation contains valuable integrity and
applicability work, but it makes one protocol the centre of Salt's AI product.
Consumers without an MCP-capable host have no first-party fallback, public
guidance explicitly says MCP is canonical, and pattern consumers are still sent
to Storybook for many examples.

After this plan, Salt has one immutable, version-aware knowledge and analysis
source that works offline. A general `salt-ds` CLI is the primary consumer
surface, with `scan` as its first flagship workflow. Web Markdown, `llms.txt`,
an Agent Skill, sample applications, and MCP are projections or adapters over
the same bytes and result contracts. No consumer needs Storybook or MCP to learn
or validate Salt.

This is a clean-slate product decision. `@salt-ds/mcp` has no stable release;
Plan 001a ratifies its unused `0.0.0-snapshot-*` test artifacts as creating no
compatibility obligation. Its current command names, exports, resource
identities, Roots behavior, and Catalog-v2 packaging are implementation
evidence only. Reuse the deterministic catalog, integrity, applicability, and
filesystem work where characterization proves it still serves the new
architecture; publish only the contracts defined by this plan.

## Executive decisions

These decisions are part of the plan. An executor must not silently substitute
another architecture.

1. Prepare `@salt-ds/knowledge` as the only owner of the generated bundle,
   bundle reader, deterministic query layer, applicability resolver, submitted
   artifact analyzer, and the protocol-neutral project facts shared by CLI and
   MCP.
2. Prepare `@salt-ds/cli` with the executable `salt-ds`. Do not use the binary
   name `salt`, which collides with the established Salt infrastructure CLI.
3. Ship `scan`, `info`, `help`, and `version` first. Add `docs` and `context`
   only after the bundle projection and retrieval quality gates pass.
4. Build one clean, current-spec `@salt-ds/mcp` candidate as an optional thin
   adapter, not the knowledge owner. Nothing in the current prototype or
   ratified unused test snapshots is a public compatibility requirement.
   Plan 003 may publish MCP only if a pre-release outcome gate recommends
   `mcp_candidate_disposition: ship` and independently confirms the exact final
   packed bytes; otherwise it remains omitted without a deprecation or migration
   path.
5. Make Storybook maintainer-only. Stories may wrap canonical example modules
   for visual QA, but no published knowledge, public sample, CLI command, or
   public documentation journey may require a Storybook process or URL.
6. Start with exact current-version compatibility. Broaden a package range only
   when source-bound or matrix-tested evidence supports it. Never silently use
   `latest` or the nearest version.
7. Keep ordinary `info`, `scan`, `docs`, and `context` read-only, deterministic,
   and offline. No model calls, telemetry, runtime package installation, or
   network fetches occur on those paths.
8. One analyzer produces one complete internal result. CLI, SARIF, prompt,
   JSON, and MCP renderers must not reimplement rules or infer different facts.
9. Do not put embeddings in the canonical bundle. Any future embedding index is
   a replaceable derived cache keyed by bundle digest, embedding model identity,
   and index schema.
10. Treat executable rules as signed package code. A remotely synchronized
    knowledge bundle may contain facts, Markdown, examples, and declarative rule
    metadata, but never remotely supplied JavaScript or commands.
11. Close knowledge identity over knowledge-owned inputs only. A CLI-only or
    MCP-only source change must leave the knowledge manifest, selected bytes,
    and `bundle_digest` unchanged. Track semantic sources, compiler/ruleset
    sources, and release-tool inputs as separate explicit inventories; adapter
    sources and manifests belong to none of them.
12. Name the knowledge identity fields `semantic_source_digest` and
    `compiler_digest`; do not overload either with Git provenance. The release
    receipt separately records the exact clean source commit/tag that produced
    the package cohort. Catalog-v2 fields may exist only in temporary internal
    characterization fixtures and must not ship. For every release-candidate or
    published identity, the same knowledge package version must always pack the
    same manifest and artifact bytes, regardless of unrelated repository commits.
    Before version materialization, a private build is explicitly
    `publishable: false`, carries a digest-derived `candidate_build_id` and
    `package_version_state: "unversioned-candidate"`, and cannot represent its
    placeholder manifest version as `bundle_version` or satisfy a publisher.

## Decision history and supersession

- Archived `advisor-plans/archive/019-keep-mcp-primary-and-model-applicability.md`
  recorded the prior MCP-primary decision and deferred a CLI and second
  knowledge distribution. The maintainer has now deliberately reopened that
  decision. Execution unit 00b must add a current ADR that supersedes that
  direction without rewriting the historical archive.
- Archived `advisor-plans/archive/018-publish-package-versioned-core-knowledge.md`
  contains useful integrity ideas but is explicitly stale and split. Do not
  execute or revive it. This plan uses one cross-package knowledge bundle rather
  than embedding separate documentation in every Salt component package.
- Local `advisor-plans/016-retire-legacy-registry-projection.md` and
  `advisor-plans/017-run-salt-delivery-experiment.md` are rejected historical
  evidence and are not dependencies. No ignored advisor plan is active. Plan
  004 owns the tracked post-Unit-07 decision path.
- Do not edit `advisor-plans/`. It is locally excluded historical evidence,
  not dispatch authority.

## Current state

### Repository and release shape

- Root workspaces already include `packages/**`: `package.json:8-12`.
- Yarn 4.17 and the repository's generic builder produce CJS, ESM, declarations,
  explicit exports, exact transformed workspace dependencies, and executable
  wrappers: `scripts/build.mjs:161-303` and `scripts/build.mjs:675-787`.
- `workspace:*` becomes an exact published version:
  `scripts/transformWorkspaceDeps.mjs:1-29`.
- The current build special-cases MCP first:

  ```json
  "build": "yarn workspace @salt-ds/mcp build && yarn workspaces foreach --exclude @salt-ds/site --exclude @salt-ds/mcp -Apt run build && yarn bundle:css"
  ```

  This is at `package.json:16`. The new graph must build knowledge first.

- Changesets publishes packages independently and updates internal dependencies
  with patch releases: `.changeset/config.json:3-8`.
- Release and snapshot workflows use Node 24 and npm provenance; consumer smoke
  covers Node 22 and 24: `.github/workflows/release.yml:31-43`,
  `.github/workflows/release.yml:228-247`, and
  `.github/workflows/test.yml:122-142`.
- The same current release workflow still mixes main-branch Changesets PR
  maintenance/publication and retains an `issue_comment` path that checks out
  PR-head code and can publish with OIDC, without one named protected
  environment: `.github/workflows/release.yml:3-46`, `:102-115`, and
  `:211-247`. Unit 00a immediately removes the PR-head path and installs an AI
  release embargo before any new package or Changeset exists; Unit 08b then
  replaces the remaining publication authority instead of layering another
  workflow beside it.

### MCP and protocol-neutral core

- `packages/mcp/CORE_ARCHITECTURE.md:3-18` already separates deterministic
  catalog/analysis code from MCP schemas, response envelopes, registration, and
  transport.
- Architecture tests enforce that core has no MCP SDK dependency and that MCP
  enters core only through its runtime facade:
  `packages/mcp/src/__tests__/architectureBoundary.spec.ts:155-303`.
- The architecture document explicitly says a separate package should be
  reconsidered when a second production consumer exists:
  `packages/mcp/CORE_ARCHITECTURE.md:158-161`. The CLI is that consumer.
- The unreleased MCP package is currently configured to publish one `salt-mcp`
  binary and copies a manifest-selected generated catalog:
  `packages/mcp/package.json:19-63`.
- Its current package-root API is only `runCli` and `createSaltMcpServer`:
  `packages/mcp/src/index.ts:18-27`.
- Its CLI accepts `serve`, `help`, and `version`:
  `packages/mcp/src/cli.ts:10-31` and `packages/mcp/src/cli.ts:220`.

### Existing knowledge and analysis

- Catalog v2 already has a strict schema version, exact package facts, legacy
  `source_revision`, input inventory, per-artifact hashes/bytes, semantic digest,
  and content-addressed generations:
  `packages/mcp/src/core/catalog/catalogSchemaV2.ts:33-45`,
  `:163-174`, `:2270-2288`, and `:2392-2402`.
- At the planned commit, the active manifest has schema `2.0.0`, catalog
  `0.1.0`, 4,173 inventoried inputs, 20 runtime artifacts, 26,117 records, and
  9,189,361 runtime artifact bytes. The manifest itself is 653,954 bytes because
  it embeds the input list. Reproduce rather than trust these numbers:

  ```powershell
  $manifest = Get-Content -Raw packages/mcp/generated/catalog-manifest.json | ConvertFrom-Json -Depth 100
  ($manifest.inputs | Measure-Object).Count
  ($manifest.artifacts | Measure-Object -Property record_count -Sum).Sum
  ($manifest.artifacts | Measure-Object -Property bytes -Sum).Sum
  (Get-Item packages/mcp/generated/catalog-manifest.json).Length
  ```

- The catalog store verifies the manifest and artifacts and supports a
  whole-catalog integrity barrier:
  `packages/mcp/src/core/catalog/catalogStoreV2.ts:722-907` and
  `:1165-1205`.
- Applicability is intentionally exact-or-unknown and historically incomplete:
  `packages/mcp/src/core/applicability/knowledgeApplicability.ts:3-19` and
  `:66-108`.
- Current submitted analysis supports JS, JSX, TS, TSX, and CSS, produces
  imports, JSX facts, CSS declarations, and token uses, and applies parser and
  traversal budgets:
  `packages/mcp/src/core/review/submittedArtifactFacts.ts:12-84`.
- Only five official rules exist today, registered at
  `packages/mcp/src/core/review/reviewRuleRegistry.ts:1188-1230`. The public
  product must describe its coverage honestly rather than imply a full design,
  accessibility, or repository review.
- Current review accepts at most eight submitted artifacts and divides budgets
  by batch size: `packages/mcp/src/core/review/reviewSaltCode.ts:129-233`.
  CLI must not use arbitrary batching that changes results.
- The reusable bounded project-file reader and its containment/replacement
  protections are already heavily tested:
  `packages/mcp/src/core/project/__tests__/boundedProjectFile.spec.ts:29-337`.
- MCP intentionally performs no recursive source crawl:
  `packages/mcp/CORE_ARCHITECTURE.md:117-141`. Recursive discovery belongs only
  to CLI.

### Consumer documentation and examples

- `site/docs/getting-started/ai.mdx` currently defines MCP as the AI product and
  says another knowledge distribution is unnecessary.
- `workflow-examples/consumer-repo/README.md:63-73` says MCP is canonical and
  there is no public CLI fallback.
- The release fixture is not a runnable reference app and pins Core 1.67/Theme
  1.43 while the current source packages are Core 1.69/Theme 1.44:
  `workflow-examples/consumer-repo/package.json:12-16`,
  `packages/core/package.json:2-3`, and `packages/theme/package.json:2-3`.
- Pattern pages detect Storybook URLs and render a “View Example” CTA:
  `site/src/layouts/DetailPattern/DetailPattern.tsx:45-69`.
- Pattern examples are semantic catalog inputs extracted from story source:
  `packages/mcp/src/core/catalog/catalogSemanticSource.ts:1-21` and
  `packages/mcp/src/core/build/buildRegistryPatterns.ts:821-909`.
- Component examples are normal files under `site/src/examples`, but “Show
  code” loads only the entry file:
  `site/src/components/components/fetchExample.ts:1-21`. Published copy-ready
  examples need their local dependency and CSS closure, not one code string.
- The root README still demonstrates the legacy provider/theme path while the
  current developing guide recommends `SaltProviderNext`, `global.css`, and
  `theme-next.css`: `README.md:43-58` and
  `site/docs/getting-started/developing.mdx:138-174`.

## Competitor and consumer precedent translated into requirements

The target deliberately combines proven parts of several ecosystems rather than
copying any one product:

| Precedent                                                                                                                                                                                | Copy into Salt                                                                                                                                                                                                                    | Deliberately reject or defer                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Shadscan](https://www.shadscan.com/docs)                                                                                                                                                | CLI-first deterministic/read-only source scan; one engine behind human, JSON, prompt, CI, Skill, and later MCP surfaces; stable rules/report versions; evidence, applicability, remediation, acceptance criteria, and rescan loop | shadcn-specific rules, hosted source upload, automatic `--apply`, roast language, broad generic quality/SEO scoring, a premature 0–100 score, or rendered URL/browser checks in scanner v1                                           |
| [shadcn CLI/registry](https://ui.shadcn.com/docs/registry/getting-started)                                                                                                               | Extensible umbrella CLI, JSON-Schema-validated data, explicit version resolution, programmatic library boundary, thin Skill and optional MCP over the same registry                                                               | Source-file installation/merge ownership, mandatory project config, mutable `latest` as truth, or private-registry/auth complexity                                                                                                   |
| [Next.js AI guidance](https://nextjs.org/docs/app/guides/ai-agents)                                                                                                                      | Lockfile/version-matched local Markdown, a tiny passive `AGENTS.md` pointer, offline access, and static knowledge outside MCP                                                                                                     | Duplicating the corpus in every independently versioned Salt package or assuming every host reads `AGENTS.md`                                                                                                                        |
| [Angular AI guidance](https://angular.dev/ai/develop-with-ai)                                                                                                                            | Umbrella CLI, Skills for workflow instructions, optional MCP for bounded project actions, explicit local/read-only posture                                                                                                        | A large default tool catalogue, unpinned `npx`, dev-server orchestration, or mutating/experimental actions in v1                                                                                                                     |
| [MUI MCP](https://mui.com/material-ui/getting-started/mcp/), [`llms.txt`](https://mui.com/material-ui/llms.txt), and [templates](https://mui.com/material-ui/getting-started/templates/) | Official-source retrieval with citations, broad AI-client setup guidance, generated Markdown discovery, and complete framework/use-case starters                                                                                  | `@latest` as the version authority, MCP-only access, or breadth without exact Salt-vector/applicability evidence; Salt must match the onboarding/template convenience while adding offline exact-version scan and measured MCP value |
| [Context7 versioned docs](https://context7.com/versioned-library-documentation)                                                                                                          | Exact installed-version lookup, source/version/coverage provenance, retrieval test questions, clean tagged Markdown suitable for a secondary mirror                                                                               | Third-party/network retrieval as the canonical or CI path, default-latest fallback, or retrieval as a substitute for validation                                                                                                      |

Architecture trade-off:

| Delivery option            | Reach and project awareness                                                  | Ongoing complexity                                                              | Decision                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Plain Markdown/`llms.txt`  | Broadest reach; little automatic project/version state                       | Lowest, but easy to consume the wrong release and cannot validate code          | Generated GA web-discovery convenience, never a canonical or independently authored corpus |
| Skill/`AGENTS.md`          | Many but not all hosts; can direct use of local tools                        | Low, but activation and host support vary                                       | Small workflow/pointer only                                                                |
| Versioned npm bundle + CLI | Any Node/terminal workflow; exact local versions and bounded repository scan | Two new package surfaces, no service or protocol host                           | Primary product boundary                                                                   |
| MCP                        | MCP-capable hosts; strong roots/resources/tool discovery                     | SDK/wire compatibility, host configuration, transport budgets and duplicated UX | Optional adapter where measured value exceeds cost                                         |
| Hosted API/vector database | Networked clients; potentially rich retrieval                                | Highest operations, privacy, freshness, auth, model/index lock-in               | Reject as canonical; possible derived mirror later                                         |
| Storybook                  | Browser and maintainer workflows; no consumer project context                | Existing visual-build stack                                                     | Maintainer-only evidence/QA                                                                |

Next.js is the closest knowledge-distribution model; Shadscan is the closest
scanner product model; shadcn is the closest CLI/schema extensibility model;
MUI is the closest direct design-system benchmark for MCP/docs/template reach.
The Salt-specific conclusion is:

As reviewed on 2026-08-26, Shadscan also exposes a separate
[`--check-ui <url>` rendered mode](https://www.shadscan.com/docs#check-rendered-ui)
against an already-running local or public page. Salt scanner v1 deliberately
defers that surface: it does not start a server, install or launch a browser,
execute page JavaScript, navigate URLs, or access the network. Reconsider
rendered-UI checks only after current-version GA in a separate privacy- and
threat-modelled plan, opt-in and coverage-distinct from offline source scan.

```text
local exact knowledge + salt-ds CLI = default
clean Markdown + Skill/AGENTS pointer = broad discovery
MCP = optional roots-bounded adapter
Context7 or other indexers = secondary mirrors
Storybook = maintainer visual tooling
```

Salt intentionally uses `salt-ds`, not `salt`, despite the umbrella-CLI
precedent, because `salt` is already an established infrastructure command.
The initial CLI also omits an overall score and automatic fixing. Findings gate
known high-confidence violations; users and agents apply and verify changes
through their normal workflow.

Unit 00b must snapshot the linked primary-source behavior and record the date,
because competitors evolve. Unit 09a evaluates outcomes rather than treating
precedent as proof. Unit 06d may make versioned Salt Markdown easy for Context7
or another indexer to consume, but registering or depending on an external
service requires separate approval and is not a GA dependency.

## Target architecture

```text
Salt packages + site MDX + TS declarations + tokens + examples + migrations
                                  |
                        deterministic compiler
                                  |
                                  v
                        @salt-ds/knowledge
             immutable bundle + reader/query/analyzer API
                                  |
            +---------------------+----------------------+
            |                     |                      |
            v                     v                      v
     @salt-ds/cli          @salt-ds/mcp             Web/Skill
  scan/info/docs/context   optional adapter       Markdown/llms
            |                     |                      |
            +---------------------+----------------------+
                                  |
                       one version/result identity
```

Required dependency direction (`depends on`, not data-flow arrows):

```text
@salt-ds/cli ───────depends on──────> @salt-ds/knowledge
@salt-ds/mcp ───────depends on──────> @salt-ds/knowledge
```

`@salt-ds/knowledge` must not depend on CLI or MCP. CLI and MCP each declare
`"@salt-ds/knowledge": "workspace:*"` and do not depend on each other. Salt UI
packages are compiler inputs, not runtime dependencies of the knowledge
package.

## Package ownership

| Surface              | Owns                                                                                                                                                                                                                                                      | Must not own                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@salt-ds/knowledge` | Bundle schema/store, generator, explicitly scoped semantic/compiler inventories, manifest-bound records/content/examples/rules/Skill, evidence, deterministic query, exact-current compatibility, submitted-artifact parsing/rules, bounded project facts | CLI/MCP source as identity input, MCP SDK/envelopes, recursive workspace crawl, network/cache reads or writes, CLI formatting/exit codes, model calls |
| `@salt-ds/cli`       | `salt-ds`, root selection, bounded discovery, config, orchestration, aggregation, pretty/JSON/SARIF/prompt renderers, exit codes                                                                                                                          | Knowledge copies, MCP SDK, independent rules, Storybook, network/cache paths                                                                          |
| `@salt-ds/mcp`       | Ratified v1 MCP schemas, tools/resources, response envelopes, explicitly configured project authority, stdio lifecycle and supported-host interoperability                                                                                                | Generated bundle copy, compiler, recursive crawl, CLI UX, dependency on deprecated MCP Roots                                                          |
| Site/Skill           | Current and digest-bound Markdown projections, onboarding, small procedural Skill/managed instruction block                                                                                                                                               | Independent API facts, unversioned copied examples, Storybook consumer links                                                                          |
| Public sample apps   | Copyable Vite/Next/workflow integrations and real compile/interaction/a11y checks                                                                                                                                                                         | Release-fixture internals, Storybook imports, unpublished monorepo paths                                                                              |

The knowledge package exposes a narrow supported runtime API. Use these names as
the design target, adjusting only through the ADR before implementation:

```ts
loadKnowledgeBundle(options?)
getKnowledgeManifest(bundle)
resolveKnowledgeCompatibility(manifest, observedPackages)
searchKnowledge(bundle, input)
readKnowledgeRecord(bundle, ref)
renderKnowledgeContext(bundle, input)
inspectSaltProjectFacts(root, options)
analyzeSaltArtifacts(bundle, input)
```

Generator/build APIs remain private and excluded from published runtime
exports. Do not expose the transitional `SaltRegistry` projection or any
Catalog-v2 compatibility API.

## Versioned knowledge bundle contract

The first extraction must not rewrite more than 26,000 records and move packages
in the same PR. Use the current catalog only as a temporary internal
characterization baseline across Units 01–02. Unit 03 emits one clean Knowledge
v1 manifest/record contract and removes MCP-only fields before any package is
published. No Catalog-v2 compatibility subtree or public reader ships.

Target published layout:

```text
@salt-ds/knowledge
├── manifest.json
├── index.json
├── indexes/
│   ├── artifacts/
│   │   ├── root.json
│   │   └── shards/...
│   └── search/...
├── records/
├── content/
├── examples/
│   └── <example-id>/
│       ├── manifest.json
│       └── files/...
├── markdown/
│   ├── components/
│   ├── patterns/
│   ├── guides/
│   └── migrations/
├── rules/
├── skills/
│   └── salt-design-system/
│       ├── SKILL.md
│       └── references/
│           └── managed-agents-block.md
├── compatibility/
│   └── item-applicability.json
├── support/
│   ├── semantic-source-inventory.json
│   ├── compiler-inventory.json
│   └── generation-receipt.json
└── schemas/
```

The small outer manifest must contain no searchable corpus and no embedded
4,000-file input list. It commits one bounded artifact-tree root; that root
transitively commits the complete distribution inventory. `index.json` is a
bounded search-directory artifact pointing to separately hashed search shards,
not a flat record or file inventory. Values and the single rule implementation below are
illustrative and the package array is abbreviated for readability; schema
fixtures and real output contain all 13 frozen family entries and every required
rule implementation. This is the release-complete shape after Unit 06d.
`agent_support` is schema-optional only
for pre-release Unit 03–06c fixtures because its two artifacts do not exist yet;
Unit 06d makes it a release-policy requirement and Unit 08c rejects a candidate
that omits it:

```json
{
  "$schema": "https://www.saltdesignsystem.com/ai/schemas/knowledge-manifest-1.json",
  "schema_version": "1.0.0",
  "record_schema_version": "1.0.0",
  "bundle_version": "0.1.0",
  "semantic_digest": "sha256:...",
  "bundle_digest": "sha256:...",
  "semantic_source_digest": "sha256:...",
  "compiler_digest": "sha256:...",
  "reader_contract": "salt-knowledge-reader/1",
  "analyzer_contract": "salt-artifact-analyzer/1",
  "ruleset": {
    "id": "salt-rules-current",
    "version": "1.0.0",
    "digest": "sha256:...",
    "required_rule_implementations": ["salt/navigation-target@1"]
  },
  "operation_capabilities": {
    "search": "supported",
    "docs": "supported",
    "context": "supported",
    "project_facts": "supported",
    "scan": "supported",
    "review": "supported"
  },
  "agent_support": {
    "skill": {
      "artifact": "skills/salt-design-system/SKILL.md"
    },
    "agents_pointer": {
      "artifact": "skills/salt-design-system/references/managed-agents-block.md"
    }
  },
  "compatibility": {
    "packages": [
      {
        "name": "@salt-ds/core",
        "tested_version": "1.69.0",
        "supported_range": "1.69.0",
        "required": true
      },
      {
        "name": "@salt-ds/theme",
        "tested_version": "1.44.0",
        "supported_range": "1.44.0",
        "required": false
      },
      {
        "name": "@salt-ds/lab",
        "tested_version": "1.0.0-alpha.102",
        "supported_range": "1.0.0-alpha.102",
        "required": false
      }
    ]
  },
  "artifact_tree": {
    "contract": "salt-artifact-tree/1",
    "path_codec": "salt-posix-relative-path/1",
    "root": {
      "file": "indexes/artifacts/root.json",
      "media_type": "application/json",
      "bytes": 12345,
      "sha256": "sha256:..."
    },
    "node_count": 123,
    "tree_bytes": 1234567,
    "artifact_count": 1234,
    "artifact_bytes": 1234567,
    "max_node_bytes": 65536,
    "max_leaf_entries": 256,
    "max_internal_children": 256,
    "max_nodes": 512,
    "max_tree_bytes": 8388608,
    "max_artifacts": 40000
  },
  "support_artifacts": [
    {
      "kind": "semantic_source_inventory",
      "artifact": "support/semantic-source-inventory.json"
    },
    {
      "kind": "compiler_inventory",
      "artifact": "support/compiler-inventory.json"
    },
    {
      "kind": "generation_receipt",
      "artifact": "support/generation-receipt.json"
    }
  ],
  "limitations": {
    "historical_completeness": false
  }
}
```

Version axes are deliberately separate:

| Axis                   | Rule                                                                                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manifest schema        | SemVer for the outer reader/data contract                                                                                                                                                     |
| Record schema          | Knowledge record schema v1 is frozen before first publication; later incompatible meanings require a new schema ID and reader                                                                 |
| Bundle/package version | Must equal the published `@salt-ds/knowledge` version; docs-only corrections create a new bundle patch                                                                                        |
| Salt package vector    | Exact tested versions initially; packages remain independently versioned                                                                                                                      |
| Semantic digest        | Identity of normalized facts/records for extraction parity and semantic-change detection                                                                                                      |
| Bundle digest          | Identity of the complete outer manifest metadata and the transitively committed artifact-descriptor tree; used for immutable routes/distribution and, only in Plan 002, cache keys/pins       |
| Item applicability     | Mandatory for every runtime-selectable record, rule, example, and projection/index entry through manifest-bound `compatibility/item-applicability.json`; missing declarations fail generation |

`semantic_source_digest` is the SHA-256 identity of the sorted, normalized
semantic-source inventory. `compiler_digest` and the sealed generator receipt
identify compiler/ruleset inputs separately. The release receipt—not the bundle
manifest—records `build_source_commit`, clean/dirty state, tag, workflow
identity, and npm subjects. This keeps an adapter-only commit from silently
repacking different bytes under an existing knowledge version while retaining
auditable source provenance.

The in-bundle `support/generation-receipt.json` is a digest-neutral,
pre-finalization descriptor of normalized input inventories, compiler/ruleset
identity, deterministic-generation parameters, and output counts. It must not
contain `bundle_digest`, finalized outer-manifest bytes/hash, package/web release
identity, or a hash of itself. Only the external pack/release receipt binds the
final manifest bytes and `bundle_digest`; tests reject either direction of a
digest cycle.

The knowledge build owns three non-overlapping input closures:

| Closure          | Included                                                                                                                                                                         | Excluded                                                                                                                                        | Identity effect                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Semantic sources | Salt package public source/types/tokens/migrations, allowlisted public site MDX, `docs/ai/migrations/records/**`, canonical examples, authored Skill/AGENTS projection, metadata | `site/docs/integrations/mcp.mdx`, `packages/knowledge/**`, `packages/cli/**`, `packages/mcp/**`, generated output, tests/evals, release tooling | Changes `semantic_source_digest`, selected content, and normally the bundle/package   |
| Compiler/ruleset | Knowledge generator/runtime source, schemas, executable rule source, declared compiler dependencies                                                                              | CLI/MCP adapters, release workflows, sample-app harnesses                                                                                       | Changes sealed generator/ruleset identity and requires a knowledge version review     |
| Release tooling  | Generic pack/copy/provenance scripts and workflow definitions                                                                                                                    | Consumer content                                                                                                                                | Recorded in the release receipt; changes bundle bytes only if selected output changes |

Use separate validated pattern files with explicit allowlists/package metadata,
not a broad `packages/*` or `packages/*/src/**` glob, for the first two
closures. Add negative build fixtures that mutate only synthetic CLI, MCP,
test, and release-tool files and prove manifest bytes, artifact bytes,
`semantic_source_digest`, `compiler_digest`, semantic digest, and
`bundle_digest` remain identical; only the release-tool fixture may change the
release receipt. A
semantic/compiler input change that alters any selected or identity field must
require a new knowledge version. Through Unit 07, cumulative version intent is
recorded in pack receipts while all AI packages remain private and embargoed;
Unit 08a creates the reviewed cumulative initial Changesets and the pack gate
then fails unless they include knowledge, CLI, and MCP only when selected.

Unit 00b freezes the complete current package-family universe from the generated
catalog: `@salt-ds/ag-grid-theme`, `@salt-ds/core`, `@salt-ds/countries`,
`@salt-ds/date-adapters`, `@salt-ds/date-components`,
`@salt-ds/embla-carousel`, `@salt-ds/highcharts-theme`, `@salt-ds/icons`,
`@salt-ds/lab`, `@salt-ds/react-resizable-panels-theme`, `@salt-ds/styles`,
`@salt-ds/theme`, and `@salt-ds/window`. Every item declares the exact subset
of this universe that controls its applicability. A family that is not yet
supported is explicitly `unknown`; it never inherits Core compatibility.
Adding or removing a public family changes the frozen inventory and requires a
reviewed applicability, fixture, docs, and release update.

Bundle rules:

- Manifest and every artifact are JSON-Schema validated and hash/byte checked.
- Compute `bundle_digest` as SHA-256 over
  [RFC 8785 canonical JSON](https://www.rfc-editor.org/rfc/rfc8785.html) of the
  complete outer manifest with only `bundle_digest` omitted. The outer manifest
  hashes exactly one artifact-tree root. Canonical internal nodes hash sorted,
  non-overlapping child nodes; canonical leaf nodes contain each ordinary
  artifact's normalized path, media type, byte count, and SHA-256. The root
  therefore commits every content, search shard, Markdown, example, rule,
  compatibility, limitation, and support artifact without placing the flat
  inventory in the outer manifest. Verify the complete tree and artifact bytes
  before trusting or publishing the descriptor set.
- The outer manifest is not listed as one of its own artifacts; that would make
  identity circular. Artifact-tree node files are integrity metadata: each
  non-root node is named and hashed by exactly one parent, the root is named and
  hashed only by the outer manifest, and no node lists itself as an ordinary
  artifact. Package/web integrity may additionally hash the finalized manifest
  bytes in its release receipt.
- `salt-artifact-tree/1` is a strict tree, not a general graph. Generation and
  reading reject cycles, repeated node hashes/paths, dangling children, empty
  internal nodes, overlapping prefixes, duplicate Unicode-normalized or
  case-folded paths, non-canonical ordering, depth beyond 4, more than 256
  children per internal node, more than 256 entries per leaf, any node above 64
  KiB, more than 512 descriptor nodes, more than 8 MiB total canonical
  descriptor-node bytes, more than 40,000 ordinary artifacts, root
  node/tree/artifact count or byte totals that disagree with traversal, and any
  packaged/web byte not represented exactly once. Enforce these maxima before
  allocation and incrementally during traversal; never trust manifest counts as
  limits.
  Descriptor-node filenames and the outer `manifest.json` are the only
  structural exceptions to the ordinary-artifact inventory.
- `index.json` is at most 512 KiB and contains only search-shard descriptors and
  routing metadata. Search shards are ordinary artifacts in the artifact tree;
  their key ranges are disjoint and complete, their own byte/hash descriptors
  are verified before use, and no record may occur in two shards. Readers may
  traverse only the needed search shards after validating the complete bounded
  descriptor tree, but a release verifier must read and hash every artifact.
- `semantic_digest` identifies the canonical normalized facts/records only. It
  deliberately excludes projection-only bytes and package version metadata;
  `bundle_digest` remains the complete distribution identity. Unit 01 computes
  the temporary Catalog-v2 baseline only for internal comparison and Unit 03
  deletes it from publishable output.
- Publication uses content-addressed paths and never rewrites released bytes.
- Publish the full semantic input inventory as a manifest-bound ordinary support artifact so the
  outer bootstrap target is at most 32 KiB. Do not duplicate the inventory in a
  second manifest or compatibility subtree.
- Target the machine-readable bootstrap index at most 512 KiB uncompressed, default
  `context` output at most 16 KiB, individual content artifacts at most 64 KiB
  unless allowlisted, and the initial npm package at most 10 MiB compressed and
  25 MiB unpacked. Record baselines and require maintainer approval before
  changing these policy budgets.
- Markdown and example files are committed by exactly one artifact-tree leaf.
  No unlisted file is copied.
- When `agent_support` is present, every path selects exactly one ordinary
  artifact descriptor. It is absent only from pre-release Unit 03–06c fixtures;
  Unit 06d generates it and every beta/GA package must contain it. Npm and
  immutable web distributions contain byte-identical Skill/AGENTS artifacts.
  Their binding is the descriptor plus immutable route/package version; neither
  embeds `bundle_digest`, avoiding circular identity.
- Examples carry entry file, supporting-file closure, dependencies, CSS,
  providers, package vector, copy-ready/contextual status, source provenance,
  and compile/render/a11y receipts.
- Accessibility guidance, implementation signals, and verification receipts
  remain separate claim kinds. An axe pass is not a WCAG-conformance claim.
- No embeddings, install scripts, postinstall mutations, remote tool
  instructions, secrets, absolute local paths, or executable downloaded rules.
- Every stable item key (`record:<family>:<id>`, `rule:<id>`, `example:<id>`, or
  `projection:<path>`) has exactly one entry in manifest-bound
  `compatibility/item-applicability.json`: package ranges with evidence;
  explicitly version-independent with authored rationale/evidence; `unknown`
  with a stable limitation reason; or inheritance from immutable source item
  keys. Inheritance resolves as an intersection and can never broaden support.
  Generation fails for missing, dangling, or cyclic entries and attempted
  broadening. Unknown items are always excluded and disclosed as partial
  coverage. Compatibility filtering occurs before ranking, rules, examples,
  or projection rendering. Temporary Catalog-v2 `applies_to` values may inform
  Unit 01 characterization but are not accepted as published authority.

Digest representation is also explicit:

- JSON/config/API form is exactly lowercase `sha256:<64 lowercase hex>`.
- URI and filesystem segment form is exactly `sha256-<64 lowercase hex>`.
- One shared codec performs strict round-trip conversion. It rejects uppercase,
  percent-encoded, truncated, slash-containing, or non-canonical forms.
- Web paths, MCP resource segments, temporary paths, and any future Plan-002
  cache directories use only the segment form; reports/config retain the JSON
  form. On Windows no directory name contains `:`.

### Canonical migration records

Author migration knowledge; do not infer normative upgrade guidance from
changelog prose. The non-generated source of authority is
`docs/ai/migrations/records/<migration-id>.json`, frozen with owner and initial
inventory in `tooling/ai/migration-records-v1.json`. The knowledge package owns
`schemas/migration-record-1.schema.json` and emits normalized selected copies;
no normative record is authored under `packages/knowledge/**`. Each record
contains:

- stable migration ID, title, summary, owner, source/provenance and status;
- every affected package family plus exact supported `from` and `to` ranges;
- related breaking-change/deprecation IDs and ordered prerequisites;
- dependency-complete before/after example artifact references;
- `manual`, `advisory-automatable`, or `codemod-available` classification,
  without embedding or executing a command from knowledge data;
- verification steps, known limitations, and applicability evidence.

Generation rejects missing ranges, packages outside the frozen family universe,
dangling example/change references, overlapping contradictory migrations, or a
claim of automation without separately packaged and tested code. `docs` and
`context` retrieve these records in v1; mutating `salt-ds migrate` remains out
of scope. Plan 002 may later add a read-only from/to delta query only after at
least one historical vector is supported.

## Compatibility and bundle resolution

CLI and any MCP candidate or release exact-pin the same knowledge package
through `workspace:*`. The executing adapter imports only its own exact
transitive knowledge reader. It never dynamically imports JavaScript from a
consumer project's `@salt-ds/knowledge`. Project-installed Salt package
manifests and lockfiles are untrusted data inputs, not executable extensions.

The current-version local resolver follows this order:

1. Read exact resolved Salt package manifests and lockfile/workspace facts.
2. Use only the data bundle shipped in the executing adapter's exact transitive
   `@salt-ds/knowledge`; this plan has no compatibility lookup, public custom
   bundle override, or cache. Tests inject fixtures through private test APIs,
   never through a shipped `--registry-dir` contract.
3. Rank an exact tested package vector above a declared compatible range.
4. Treat prerelease packages as compatible only when the prerelease is
   explicitly declared.
5. Resolve every relevant package family independently across the frozen
   thirteen-family universe. A Core match may remain usable when optional Lab
   knowledge is incompatible; Lab records/rules are disabled with a limitation.
   Selection uses the mandatory applicability map; an unclassified item is never
   treated as version-independent and an omitted family never inherits another
   family's result.
6. If no bundle matches, run only version-independent rules, label the result
   incomplete, and exit with the incomplete-coverage code. Never use latest or
   nearest silently.

Manifest capability declarations are descriptive data, never authority to run
code. The executing provenance-backed package owns a closed allowlist of
supported `reader_contract`, `analyzer_contract`, and ruleset implementation
IDs/digests for each operation. An unknown combination disables that operation
with a stable limitation; `scan`/`review` becomes failed coverage and exits 3.
Never apply current executable rules to declarative metadata that names an
older or unknown ruleset. This current release's build proves every declared
operation against its exact bundled implementation; Plan 002 must repeat that
proof independently for historical bytes.

`@salt-ds/knowledge` owns manifest validation and the exact-current bundled
resolver API. CLI and MCP resolve the same exact transitive package bytes and
perform no network or shared-cache access. Plan 002 may extend this contract
with explicit historical pins and a data-only cache only after its independent
security and compatibility gates pass; no Plan 002 command or config field is
reserved by the Plan 001 implementation.

`salt.config.json` is tool configuration. Existing `.salt/team.json` and
`.salt/stack.json` remain optional, repo-owned, untrusted policy and must not be
merged into the trusted bundle/config identity.

Current-version GA has an explicit package-manager/layout matrix. “Detected” is
not the same as “exactly resolved”:

| Consumer layout                               | V1 status                                                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| npm physical `node_modules`                   | GA exact: resolved package manifests plus supported package-lock/workspace/override evidence; release blocking                                  |
| Yarn Classic/Berry `nodeLinker: node-modules` | GA exact: resolved manifests plus supported yarn.lock/workspace/resolution evidence; release blocking                                           |
| pnpm isolated/hoisted `node_modules`          | GA exact only when each resolved manifest realpath is contained and supported pnpm lock/workspace/catalog evidence is unique; otherwise partial |
| Bun physical `node_modules`                   | Detected but not GA-exact in v1; do not infer authority from Bun markers/lockfile alone; partial                                                |
| Yarn Plug'n'Play                              | Detected but not GA-supported in v1. Never execute `.pnp.cjs`, Yarn plugins, loaders, SDKs, or package-manager commands; partial                |
| Unknown/custom install layout                 | Detected and reported, never guessed; version-dependent knowledge/rules disabled and coverage partial                                           |

Unit 00b records the supported package-manager and lockfile versions. Unit 03
adds positive, ambiguous, override, multiple-locator, corrupt, and out-of-root
fixtures for every row. `info` reports the evidence source and stable limitation
reason. `scan` may still run version-independent rules for a partial layout, but
the ordinary default exits 3 unless `--allow-incomplete` is explicit.

Historical support is a separate gated follow-on in
`plans/002-add-secure-historical-salt-knowledge.md`, not an execution unit of
this current-version GA plan:

- This plan ships no sync command, mutable resolution index, or historical
  compatibility claim.
- Exact-current bundled operation remains fully offline and independent of that
  follow-on.
- The follow-on must separately prove data-reader, analyzer-contract, and
  executable-ruleset compatibility; matching data bytes alone is insufficient.

## CLI public contract

Package and binary:

```text
package: @salt-ds/cli
binary:  salt-ds
engine:  Node >=22
```

Initial commands:

```shell
salt-ds help
salt-ds version
salt-ds -h | --help
salt-ds --version
salt-ds info [root] --json
salt-ds scan [root] --format pretty|json|sarif|prompt --fail-on error|warning|info|never [--allow-incomplete]
```

`-h` and `--help` are exact aliases of `help`; `--version` is an exact alias of
`version`. They accept no trailing arguments, preserve stdout/stderr/exit
semantics, and are packed-package compatibility requirements.

After projection/retrieval gates:

```shell
salt-ds docs <record-id-or-name> --format markdown|json
salt-ds context <query> --format markdown|json --limit <n>
```

After the manifest-bound Skill ships in subunit 06d:

```shell
salt-ds skill info --json
salt-ds skill print --kind skill|agents
```

Reserve but do not implement in the initial release: `doctor`, `init`, `mcp`,
`migrate`, `codemod`, `check-ui`, and browser/URL scanning. Historical
`knowledge trust initialize`, `knowledge status`, `knowledge sync`, and
`knowledge pin` belong only to Plan 002. Add any reserved command only through a
separate outcome-backed plan.

### Scan discovery

Unit 00b may lower these baseline-derived defaults before schema freeze, but it
must publish one numeric value for every dimension and may not leave “bounded”
undefined. Project config may lower a limit, never exceed its absolute ceiling:

| Dimension                       | Proposed v1 default | Absolute ceiling |
| ------------------------------- | ------------------- | ---------------- |
| Traversal depth                 | 32                  | 64               |
| Visited directories             | 10,000              | 50,000           |
| Directory entries               | 100,000             | 250,000          |
| Queued paths                    | 25,000              | 100,000          |
| Selected files                  | 5,000               | 20,000           |
| Selected aggregate bytes        | 50 MiB              | 200 MiB          |
| Individual source bytes         | 1 MiB               | 5 MiB            |
| Discovery elapsed time          | 15 seconds          | 60 seconds       |
| JS/TS AST nodes per file        | 250,000             | 1,000,000        |
| CSS nodes per file              | 100,000             | 500,000          |
| Rule evidence candidates/file   | 25,000              | 100,000          |
| Findings per file               | 500                 | 2,000            |
| Worker concurrency              | 2                   | 4                |
| Per-file worker deadline        | 5 seconds           | 10 seconds       |
| Worker old-generation heap      | 128 MiB             | 256 MiB          |
| Forced worker restarts/scan     | 8                   | 32               |
| Cumulative worker-job wall time | 15 minutes          | 60 minutes       |
| Whole-scan elapsed time         | 10 minutes          | 30 minutes       |
| Canonical result bytes          | 2 MiB               | 8 MiB            |

The ADR records how each limit is measured before allocation, the stable reason
code when hit, and whether the result is partial or failed. Performance tuning
requires fixtures and an ADR amendment; environment variables do not bypass
ceilings.

- Default root is the current working directory; explicit root is resolved once.
- Walk only canonical files inside that root. Do not follow links outside it.
- Respect VCS ignores plus `salt.config.json` includes/excludes.
- Default-exclude `.git`, `node_modules`, package caches, `dist`, `build`,
  `.next`, coverage, generated knowledge, and `storybook-static`.
- Initial languages are JS, JSX, TS, TSX, and CSS. Unsupported languages and
  constructs are coverage limitations, not clean results.
- Sort portable repository-relative paths before analysis. Never use absolute
  paths in finding IDs or ordinary output.
- Model heterogeneous monorepos explicitly. Discovery emits stable
  `workspace_units[]`, keyed by normalized relative package root. Each unit
  carries its classification, exact relevant Salt package vector and evidence,
  compatibility result, owned files, findings, coverage, and limitations.
  Every selected file belongs to exactly one unit; overlapping workspace
  ownership is failed coverage. Hoisted dependency evidence is resolved for the
  owning unit, never copied from a sibling. Root-level summary/coverage is a
  deterministic aggregation and cannot hide a partial or failed unit.
- Use fixed per-file parser/rule budgets and separate workspace file/byte caps.
  Analyze files independently in v1 so batch size cannot change findings.
- Traverse incrementally with explicit maximum depth, visited-directory count,
  directory-entry count, queued-path count, selected-file count, and selected
  bytes. Apply limits while enumerating rather than materializing an unbounded
  path list; a limit produces a stable partial-coverage reason.
- Run synchronous Babel/PostCSS parsing and rule evaluation behind a CLI-owned,
  killable worker boundary with fixed concurrency, per-job deadline, and Node
  resource limits. A traversal/selection ceiling yields `partial`; a timeout,
  OOM, worker crash, protocol violation, or inability to enforce isolation
  discards that file, yields `failed`, exits 3, and is never overridable. The
  worker imports only the built knowledge package root, receives
  bounded bytes over a schema-validated message, cannot spawn children or use
  network modules, and is restarted after forced termination.
- Discovery/whole-scan/cumulative-worker time or restart-budget exhaustion
  terminates remaining workers, discards in-flight file outputs, reports one
  stable failed-coverage reason, and exits 3. It never loops/restarts
  indefinitely or downgrades a time/resource failure to a clean partial scan.
- Update the offline module guard deliberately: MCP/runtime closures continue
  to reject `worker_threads`; the packed CLI may reach only the named scanner
  worker entry. A boundary test proves that worker closure still cannot reach
  HTTP/DNS/TLS, child processes, MCP, Storybook, or consumer code.
- Do not claim cross-file analysis in v1. Add it only with explicit rules and
  fixtures later.
- Do not execute project code, config JS, examples, package-manager scripts, or
  downloaded content.

### Scan result

One versioned result feeds every renderer:

```text
contract
tool version
engine/ruleset version and digest
knowledge version, bundle digest and semantic digest
normalized relative root and root-level discovery facts
workspace units with stable relative ID, classification, exact relevant package
vector/evidence, compatibility, owned-file coverage and limitations
summary by severity
findings with stable rule ID, severity, applicability, location, message,
confidence, evidence, remediation, acceptance criterion and workspace unit ID
coverage: evaluated/skipped/unsupported files and rule categories
coverage status: complete, partial or failed, with stable reason codes
limitations
```

Finding order is workspace-unit ID, normalized path, start location, severity,
then rule ID.
Ordinary JSON contains no timestamps, durations, absolute paths, or source text.
Optional timing/debug output goes to stderr or an explicitly requested
non-deterministic metrics field. SARIF coordinates must be converted from the
analyzer's UTF-8 byte offsets/columns to SARIF's character coordinate
convention; never copy byte columns directly.

Prompt rendering labels all repository-derived names/text as quoted untrusted
evidence, escapes delimiter/control sequences, and never turns comments,
configuration, or source strings into agent instructions.

The ruleset identity is explicit even if it initially changes in lockstep with
the knowledge package. Pretty and prompt renderers end each actionable finding
set with an exact local rescan command. Do not compute an overall quality score
until a separate calibrated scoring contract proves that aggregation is useful
and does not hide applicability or coverage.

Exit codes:

| Code | Meaning                                                                                                                                                                                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | Scan completed and no finding met `--fail-on`                                                                                                                                                   |
| `1`  | One or more findings met `--fail-on`                                                                                                                                                            |
| `2`  | Usage or configuration error                                                                                                                                                                    |
| `3`  | Partial coverage without an explicit override, failed required evaluation, incompatible installed package vector, bundled-knowledge integrity failure, parser/system failure, or internal error |

Coverage is:

- `complete` when every selected supported input and applicable rule family was
  evaluated;
- `partial` for a disclosed unsupported construct/package family, an
  unsupported Salt version, or a workspace cap that leaves selected
  input unevaluated;
- `failed` for missing/corrupt packaged knowledge, unsafe/replaced or unreadable
  required input, worker/parser/analyzer/system failure, or internal invariant
  error.

By default both partial and failed coverage exit 3, so a no-finding result
cannot look complete. `--allow-incomplete` is an initial explicit v1 option:
it lets disclosed `partial` coverage use the normal 0/1 finding threshold, but
never overrides `failed`. The result, pretty warning, JSON/SARIF invocation,
and prompt all retain coverage status/reason codes. `--fail-on never` alone
does not hide exit 3.

Intentionally configured/default-excluded paths are counted and reported but
do not make coverage partial unless a required workspace unit is thereby left
unevaluated. Pretty diagnostics go to stdout, operational errors to stderr, and
JSON/SARIF stdout contains only the requested document.

For non-scan commands: `help`, `version`, `skill info`, `skill print`, and a
completed `info` (including a truthful non-Salt result) exit 0; `docs`
missing/ambiguous exits 1 with a
machine-readable choice/not-found result; an empty but completed `context`
query exits 0 with zero matches; usage/config errors exit 2; and bundle
integrity or internal failures exit 3. Plan 001 has no cache or network-sync
command; any future behavior is defined only by Plan 002. Machine formats
remain stdout-clean under the same rules.

### Rule rollout

- Start with the five existing deterministic rules and publish a coverage
  matrix. Until broader categories pass the same gates, describe v1 as a Salt
  compatibility/deprecation scan, not a general UI-quality or design-system
  audit.
- Version confidence semantics in the result schema. Initial gateable findings
  are authored `high` confidence only; lower-confidence experimental signals
  remain non-gating diagnostics and never distort a future aggregate score.
- Split pure parsing/rule evaluation from current MCP result truncation before
  the CLI calls it.
- A no-finding result says only that evaluated rules found nothing.
- Add composition/accessibility/design rules only when a deterministic rule has
  positive and negative fixtures and meets the ratified precision gate.
- Maintain a public, evidence-led coverage roadmap for provider/theme setup,
  accessible names and labels, form composition, navigation/overlay structure,
  deprecated/hard-coded token usage, and approved-wrapper policy. Prioritize
  from pilot failures and support evidence; do not chase a competitor rule count
  or introduce an aggregate quality score.
- Detect unsupported static CommonJS/dynamic-import forms as unevaluated until
  conservative extraction exists; never report a misleading clean result.

## MCP adapter contract

MCP is a new, local stdio, read-only candidate in this plan. Target the
[`2026-07-28` MCP specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
through stable v2 of the Tier-1 TypeScript server SDK.
Do not add remote HTTP, authentication, prompts, sampling, elicitation,
mutation, or a dependency on deprecated MCP Roots.

The proposed v1 surface, ratified in Unit 00b before it becomes public, is:

- package `@salt-ds/mcp`, binary `salt-mcp`, and package-root factory
  `createSaltMcpServer(options)` with one exported, schema-derived options type;
- tools `search_salt`, `inspect_salt_project`, and `review_salt_code`, with
  strict Zod input/output schemas and names free to change until the Unit 00b ADR;
- immutable Resources for exact knowledge reads using one new digest-bound URI
  grammar derived from `bundle_digest`; no unpublished `salt://` URI alias ships;
- bounded discovery rather than record enumeration: `resources/list` exposes at
  most eight manifest/index/guide bootstrap Resources per page and sixteen
  total, while `resources/templates/list` exposes at most four digest-bound URI
  Templates for exact record, example, migration, and Markdown reads. Neither
  method lists the ~26,000 records. Each discovery response is at most 16 KiB;
  cursors are deterministic, stateless, opaque, contract-versioned, and bundle-
  bound, with no fallback for malformed, stale, or cross-bundle cursors;
- deterministic tool/resource lists and cache hints where the selected SDK/spec
  supports them; immutable resources need no subscriptions or change notices.

Project authority comes only from repeatable startup `--root <path>` arguments
or the equivalent explicit `projectRoots` embedder option. Resolve and validate
those roots once, contain every project read within them, and expose static
knowledge without a root. A project-aware call with no configured root fails
with a stable actionable error. Do not infer authority from process cwd,
repository files, model arguments, client-provided paths, or `roots/list`.

Use stable v2 `@modelcontextprotocol/server` and its `serveStdio` entry, with
`legacy: "reject"` because Salt has no released 2025-era contract to carry.
Stdout is protocol only and logs use stderr. Preserve bounded
MCP result/resource envelopes, snapshot-handle isolation where measurement
justifies it, actionable errors, and accurate read-only/idempotent/closed-world
annotations. MCP and CLI import only the knowledge package root; MCP contains no
compiler, generated bundle copy, recursive crawler, custom public bundle path,
or CLI implementation. If the effective disposition is `omit`, retain the
immutable decision evidence, not a supported product: delete the candidate workspace and
remove it from build, pack, Changesets, docs, and release inventories. Publish
no package, binary, metadata, or setup docs.

## Documentation, Skill, and web projections

The knowledge compiler generates normalized Markdown from the same MDX,
examples, APIs, and facts used elsewhere. Do not maintain a second hand-written
AI corpus.

Projection rules:

- Resolve `LivePreview` to prose plus fenced entry source and supporting-file
  links.
- Render `PropsTable`, keyboard controls, diagrams, image switchers, and Mosaic
  fragments into ordinary accessible Markdown.
- Preserve image alt text/captions and convert relative links to canonical Salt
  links.
- Resolve every document, fragment, resource, and link destination to explicit
  `public` or `internal` visibility through item metadata or the exact reviewed
  source-root/destination inventory. Per-item overrides beat root policy;
  basename, domain-string, and path-substring heuristics are forbidden. Reject
  an unclassified restricted destination and require authored public fallback
  prose when removing normative content.
- Fail generation for unsupported interactive constructs instead of silently
  omitting them.
- Include applicability, source provenance, and bundle digest.
- Ship `llms.txt` only as a small generated, noncanonical web-discovery
  convenience. It can improve inference-time discovery for consumers that look
  for it; it does not train a model or guarantee host activation. Generate Salt
  web projection v2 H1/summary/H2 link-list indexes, following the
  [llms.txt v2 proposal](https://llmstxt.org/), at
  `/llms.txt`, `/ai/current/llms.txt`, `/ai/beta/llms.txt`, and immutable
  `/ai/v1/<digest-segment>/llms.txt`; the most-specific index describes its
  subtree. Each index is at most 64 KiB. If a family breaches that limit,
  mechanically segment by existing components/patterns/guides/migrations
  families. Do not publish `llms-full.txt`, concatenated contexts, a second
  taxonomy, or hand-authored duplicate facts.
- For every indexed public HTML record route, expose the same manifest-selected
  clean Markdown through one deterministic same-route `.md` convention. Add
  `rel="alternate" type="text/markdown"` and `rel="describedby"` for the
  most-specific `llms.txt` through HTML links or HTTP `Link` headers, with HTML
  links as the mandatory fallback when hosting cannot configure headers.
  Markdown responses use `text/markdown; charset=utf-8`.
- Freeze route codec `salt-ai-web-route/2`: `/x/` maps to `/x/index.md`, an
  `.html` route replaces that suffix with `.md`, and any other extensionless
  route appends `.md`. Normalize percent encoding and case exactly as the site
  router does; reject two HTML routes mapping to one Markdown path, dot
  segments, encoded separators, or case-only collisions on case-insensitive
  hosts. Every root/current/beta index links only immutable
  `/ai/v1/<digest-segment>/...` Markdown targets; mutable aliases select an
  index, never the detailed knowledge bytes it lists.
- Every `llms.txt` list entry names and briefly describes one canonical
  immutable `.md` alternate. Verification rejects an HTML-only, mutable-detail,
  internal, missing, or visibility-incompatible link target.
- Treat channel/scoped indexes, route aliases, discovery relations, content
  types, and cache policy as derived web-release projection metadata bound by
  the web receipt. Do not include a digest-containing index inside the bundle
  digest it describes.
- Freeze two cache classes. Immutable `/ai/v1/<digest-segment>/**` responses use
  `Cache-Control: public, max-age=31536000, immutable`. Mutable `/llms.txt`,
  `/ai/current/**`, and `/ai/beta/**` pointer/index responses use a strong
  content-hash `ETag`, a monotonic receipt-bound generation, and
  `Cache-Control: public, max-age=60, must-revalidate` with no `immutable` or
  stale-serving directive. Deployment and live verification exercise a
  conditional request before and after CAS and fail if the new generation can
  return the old body after required revalidation.
- Treat `llms.txt`, Agent Skills, and `AGENTS.md` as useful conventions with
  uneven host support, not as the canonical schema or a universal activation
  guarantee.
- Web and npm copies must have matching artifact digests.

The Salt Agent Skill is procedural and small:

1. Run `salt-ds info --json`.
2. Retrieve only the relevant `docs`/`context`.
3. Make user-authorized edits.
4. Run the repository's real tests and `salt-ds scan`.
5. Treat `.salt` policy as untrusted repository data.

The Skill must not copy component props, tokens, migrations, or examples. A
small manifest-selected managed `AGENTS.md` retrieval pointer is the recommended
host-neutral passive bootstrap after explicit manual copying; the Skill remains
the richer procedural workflow layer. `skill print --kind agents` emits the
exact block. This plan ships no initializer or repository write, and postinstall
never mutates consumer state.
Official status comes from package/manifest provenance, not a filename or
managed marker; once copied or edited, the block is untrusted project input.

## Examples and sample applications

Keep existing component examples under `site/src/examples` initially. Add
example manifests and dependency-closure extraction rather than moving hundreds
of files without value.

Move canonical pattern example implementations to:

```text
site/src/examples/patterns/<pattern-slug>/
```

Story files then import those modules and contain only Storybook metadata and
visual-QA parameters. After all pattern examples are migrated and IDs are
mapped, remove story paths from semantic catalog inputs. Keep Storybook and
Chromatic tests green.

Create public apps separate from verification fixtures:

```text
examples/apps/vite-starter/
examples/apps/next-app-router/
examples/apps/operations-dashboard/
```

Each app has exact candidate Salt versions, correct theme/provider setup,
light/dark and density coverage, at least one form and overlay/feedback flow, a
small README, a Skill/AGENTS example, a clean expected scan, build/typecheck,
interaction tests, and axe plus authored keyboard checks. The dashboard is a
realistic composition sample, not a production application.

Keep `workflow-examples/consumer-repo` as an adversarial packed-release fixture.
Do not present it as the public starter. Reconcile its wrapper policy: its
`AppButton` currently only forwards props while policy claims analytics and
defaults. Either implement the documented behavior or remove the claim.

## Evaluation and launch metrics

Add a tiered recurring suite under:

```text
evals/salt-ai/
├── manifest.schema.json
├── retrieval/
├── scan/
│   ├── valid/
│   ├── invalid/
│   └── versioned/
├── tasks/
│   ├── choose/
│   ├── configure/
│   ├── create/
│   ├── repair/
│   └── migrate/
├── protocol/
│   ├── modes.json
│   ├── budgets.json
│   ├── attempt-policy.json
│   ├── metric-definitions.json
│   ├── adjudication.md
│   └── bootstrap/
├── fixtures/
└── graders/
```

Every case records a stable ID, exact starting repository and Salt package
vector, user goal, delivery mode, allowed variants, deterministic checks,
non-goals, and an optional human rubric.

“No Salt context” means none supplied by the evaluation; it cannot erase model
pretraining. Compare the same 12–15 tasks in three always-required cumulative
modes plus one conditional candidate mode:

1. base repository/file/edit/test tools only—no supplied Salt Markdown, Skill,
   CLI, or MCP;
2. mode 1 plus the manifest-selected normalized Markdown corpus;
3. mode 2 plus project-local `salt-ds` and the frozen bootstrap profile selected
   by the activation experiment: managed `AGENTS.md`, registered Skill, or both;
4. mode 3 plus the unpublished or released MCP candidate over the identical
   bundle digest. Unit 07/08c run this candidate mode for the ship/omit decision;
   Unit 09a reruns it only when the final disposition is `ship`. For final
   `omit`, the frozen schema records mode 4 as closed `not_selected`, never as a
   missing score or a required GA cell.

Before freezing mode 3, run a small bootstrap activation experiment comparing
managed-AGENTS-only, registered-Skill-only, and combined activation on the
separate activation-only corpus. Predeclare selection as highest unaided
discovery/setup success with no deterministic correctness regression, breaking
ties in favor of fewer artifacts/tokens. Its fixtures and assertions are
disjoint from the gated outcome tasks. Record the winning `bootstrap_profile_id`
and use it in every mode-3/4 cell; losing profiles remain diagnostic only.

Run a separate non-GA web-discovery probe from only the public site/base URL.
Record whether each supported host requests the scoped `llms.txt`, follows the
correct immutable Markdown link, and retrieves the exact current version. Do
not feed this result into the mode-2 corpus or claim causal task uplift:
`llms.txt` is retained on generated marginal cost, deterministic correctness,
and bounded size, with usage/discoverability reviewed after GA.

Also retain two diagnostic, non-cumulative references outside the four gated
modes: `legacy_docs_reference`, a frozen local snapshot of today's public
site/Storybook-oriented journey, and `prototype_mcp_reference`, the current
unreleased MCP where useful. They are evidence about improvement, never public
compatibility baselines.

Every paired trial uses a fresh checkout, session, and cache; identical starting
repository hash, package vector, host/model/settings, bootstrap-template hash,
network policy, token/context/output limits, turn/tool-call/wall-time budgets,
and deterministic graders. Only the Salt delivery surface changes. Counterbalance
mode order. GA requires at least three independent repetitions for every
task/mode/host-model cell and at least two predeclared host/model pairs. A
missing cell makes the cohort incomplete; timeout, tool failure, empty output,
or budget exhaustion is a failed scheduled trial, never an exclusion.

`attempt-policy.json` freezes temperature, `top_p`, seed and other sampling
parameters where supported, records explicit `unsupported` fields otherwise,
and derives a counterbalanced mode-order schedule from a committed cohort seed.
No quality-based rerun or selective replacement is allowed. Each cell has one
initial attempt and at most one retry only for preclassified transient provider
transport/rate-limit/5xx failure that occurs before any model output or tool
action. Budget timeout, host/tool failure, invalid output, partial response, or
grader failure is final and not retryable. Retain/hash every attempt; if the
sole eligible retry completes, its result is the cell result and the initial
infra failure remains in operational metrics; if not, the cell fails. The
receipt proves attempt count, classifications, ordering seed, selection rule,
sampling parameters, and provider/model revision for every cell.

Model credentials and raw output are never committed. Raw prompts, traces, and
outputs remain in the ignored access-controlled evaluation workspace for the
ratified retention period; the sanitized receipt records their content hashes,
retention/disposal state, mode configuration hash, and adjudication IDs so an
authorized reviewer can audit the cohort without leaking proprietary content.
Use explicit cadence tiers: PRs run deterministic validation only; a small
frozen weekly smoke runs representative task/mode cells; R2/GA, a major
architecture change, or a predeclared material model/host change runs the full
cohort. Unit 00b ratifies per-tier cell counts, token/cost/time ceilings, and the
maximum monthly budget. The controlled model cohort is a beta/GA decision gate,
not a flaky PR test.

Required task families include Button versus Link, provider/theme setup,
labelled forms, navigation/overlay composition, deprecated props/tokens,
invalid imports, project wrappers, migration fixtures, partial package
mismatch, Lab prereleases, non-Salt controls, and valid no-op cases.

Metric definitions and denominators are fixed in Unit 00b before later modes run:

- `task_success = successful scheduled trial cells / all scheduled trial
cells`, reported overall and case-macro. Failures/timeouts remain in the
  denominator.
- `version_correctness = passed ratified version-sensitive assertions / all
ratified version-sensitive assertions`, reported micro and case-macro.
- `retrieval_recall_at_5 = eligible gold queries with at least one declared
applicable gold record in the first five results / all eligible gold
queries`, on at least 40 queries with each retrieval category represented;
  report category-macro as well as micro.
- Scan precision is `TP/(TP+FP)` and recall is `TP/(TP+FN)`, reported per rule
  and macro. Every gateable rule has at least 20 positive and 20 negative
  independent fixtures; partial/failed scans never count as clean negatives.
- `unsupported_claim_rate = unsupported atomic Salt-specific claims / all
assessable atomic Salt-specific claims` across answer prose, rationale, and
  code. Two mode-blind reviewers adjudicate disagreement. Report numerator,
  denominator, reviewer agreement, and interval. The below-2% gate activates
  only with at least 200 assessable claims per gated mode; an underpowered mode
  blocks the claim and GA rather than receiving a zero. Empty/nonresponsive
  output also fails task success.
- Report provider-recorded input/output tokens, actual tool calls, wall
  duration, time to first valid result, setup/activation success, estimated list
  cost, and cost per successful task. These are paired efficiency metrics within
  one host/model, not cross-provider price claims, and cannot compensate for a
  correctness failure.
- Comparative deltas are paired by task, repetition, and host/model. Before any
  post-baseline run, Unit 00b records the mode-2 minus mode-1 Markdown effect and
  ratifies the required CLI+selected-bootstrap mode-3 uplift of at least 10
  percentage points in task success over mode 2 with no regression in version
  correctness, and defines “material MCP increment” as at least five
  percentage points on the predeclared MCP-eligible subset or two additional
  successful paired task cells per host/model, with no regression in version
  correctness or unsupported-claim rate versus mode 3. Changing either threshold later
  invalidates and reruns the cohort. Unit 07 runs the frozen MCP-eligible subset
  against its exact candidate and records `mcp_candidate_disposition: ship |
omit`. Before R2, Unit 08c runs mode 3 versus mode 4 for every MCP-applicable
  cell in the full frozen 12–15-task corpus, with all hosts, repetitions,
  setup/security/surface checks, and final non-regression criteria, against the
  final version-applied tarballs and records
  `mcp_final_disposition: ship | omit` before credentials are exposed. The
  final value may preserve `omit`, preserve `ship`, or demote `ship` to `omit`;
  it may never promote an omitted or unevaluated candidate. Failure records
  `omit`; MCP is not published and no deprecation or migration is required. It
  does not falsify the knowledge/CLI launch.

Provisional gates, ratified with the baseline ADR before GA:

- 100% of public components/patterns have a source-backed example or approved
  waiver.
- 100% of published copy-ready examples include and compile their local
  dependency closure against the declared package vector.
- Zero unresolved MDX constructs and zero consumer-facing Storybook URLs in
  generated/public AI documentation.
- Zero `@storybook/*` dependencies in knowledge, CLI, or sample-app runtime
  closures.
- Two clean builds from the same source produce identical outer-manifest bytes,
  bundle digest, semantic digest, and selected artifact bytes.
- Repeated/supported-OS scanner runs produce identical normalized results.
- At least 95% precision and 90% recall both per gateable rule and macro on the
  ratified, minimum-sized scan fixture set.
- At least 95% retrieval recall@5 both micro and category-macro on the ratified
  minimum-sized gold set.
- Unsupported Salt claims below 2% in every gated supplied-context mode, with
  the minimum denominator and adjudication contract above.
- CLI plus the selected bootstrap profile meets the pre-ratified incremental
  mode-3-over-mode-2 uplift and does not regress exact version correctness.
- MCP is published only when the pre-release subset demonstrates incremental
  value for project inspection, tool discovery, or iterative repair. If shipped,
  the full R2 cohort must confirm the result before R3.
- Measure cold/warm scan and package sizes before setting hard time budgets;
  then fail regressions beyond the ratified threshold.

`metric-definitions.json` gives every gate a stable ID and a predeclared
`waivable` boolean. Bundle/package integrity, deterministic identity, official
provenance, privacy/security/path isolation, exact-version correctness, failed
coverage, complete modes 1–3 execution, the ratified
CLI+selected-bootstrap uplift, and the
unsupported-claim-rate gate are non-waivable for GA. No waiver can permit
`latest`, remote code, missing provenance, nondeterministic package/web bytes,
or a skipped required cell. Only product-quality/performance metrics explicitly
marked waivable in the Unit 00b ADR before the cohort begins may use a named,
dated, expiring waiver; changing eligibility invalidates the cohort.

## Delivery phases

| Gate | Outcome                                                                                                       | Effort | Requires |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| G0   | ADR, contracts, owners, current baselines and lean eval corpus approved                                       | M      | none     |
| G1   | Pure analyzer/project seams characterized in place; verification is load-insensitive                          | M      | G0       |
| G2   | `@salt-ds/knowledge` owns one clean deterministic Knowledge-v1 bundle                                         | L      | G1       |
| G3   | `@salt-ds/cli` ships `info` and deterministic `scan` through three reviewable packed-artifact units           | L      | G2       |
| G4   | Code-complete Markdown, Skill, docs, pattern migration and public apps work without Storybook/MCP             | L      | G3       |
| G5   | A thin exact-pinned MCP v1 candidate passes host/security tests and receives a recorded ship/omit disposition | M      | G2–G4    |
| G6   | Selected package set, pilot/evals, current-version GA, rollback, ownership and support pass                   | M      | G3–G5    |

## Commands you will need

Run commands from the repository root unless a unit says otherwise. The first
column is valid at the planned commit; the target command is introduced only by
the unit named in the final column.

| Purpose                  | Current command                                    | Target command                                                                                                                                                                                                                                                                   | Introduced        |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Build current AI surface | `yarn workspace @salt-ds/mcp build`                | `yarn build:ai-tooling` (knowledge then every live exact dependant; add CLI in 04a and follow the provisional/final MCP graph thereafter)                                                                                                                                        | 02/04a/07/08c     |
| AI tests                 | `yarn test:ai-tooling`                             | Same name, expanded to knowledge, CLI, and the MCP candidate or selected adapter                                                                                                                                                                                                 | 02/04/07          |
| AI typecheck             | `yarn typecheck:mcp`                               | `yarn typecheck:ai-tooling`                                                                                                                                                                                                                                                      | 02                |
| Package boundary         | `yarn check:ai-tooling:pack`                       | Same name; knowledge/MCP extraction in 02, Knowledge-v1 thereafter, add CLI in 04a–04c, evaluate MCP in 07 and confirm the final graph in 08c                                                                                                                                    | 02/04a–04c/07/08c |
| Packed consumer          | `yarn smoke:consumer --skip-build`                 | Same lifecycle and selected package set as the pack report                                                                                                                                                                                                                       | 02/04a–04c/07/08c |
| Candidate receipt        | none                                               | `yarn candidate:salt-ai:seal -- --stage R1_PRE_AGENT --pack-report dist/salt-ai-r1/pack-report.json --output dist/salt-ai-r1/cohort-receipt.json`                                                                                                                                | 05                |
| Prior evidence acquire   | none                                               | `yarn acquire:salt-ai:evidence -- --unit <unit> --kind <kind> --tracker plans/README.md --output <new-path>`                                                                                                                                                                     | 06a               |
| Release-plan partition   | none                                               | `yarn partition:salt-release-plan -- --phase planned --selection-profile candidate --changeset-status <status.json> --mcp-candidate-disposition-receipt <receipt.json> --selected-graph-receipt <receipt.json> --version-intent-receipt <intent.json> --output <partition.json>` | 08a               |
| Final MCP disposition    | none                                               | `yarn eval:salt-ai:mcp-final ...` plus `yarn verify:salt-ai:mcp-final ...`                                                                                                                                                                                                       | 08a/08c           |
| Ordinary dependency      | none                                               | `yarn resolve:salt:ordinary-dependency ...`                                                                                                                                                                                                                                      | 08b               |
| Release receipt acquire  | none                                               | `yarn acquire:salt-ai:release-receipt -- --selector-from <schema-valid-selector.json> --selector <closed-name> --tracker plans/README.md --output <new-path>`                                                                                                                    | 08b               |
| Protected transition     | none                                               | `yarn release:salt:transition -- --operation <closed-operation> ...` and `yarn release:drill:salt ...`                                                                                                                                                                           | 08b               |
| Full AI release gate     | `yarn release:verify:mcp`                          | `yarn release:verify:ai-tooling`                                                                                                                                                                                                                                                 | 08b               |
| AI web artifact          | none                                               | `yarn build:salt-ai-web && yarn verify:salt-ai-web && yarn workspace @salt-ds/site build`                                                                                                                                                                                        | 06d               |
| Public sample apps       | none                                               | `yarn check:salt-sample-apps`                                                                                                                                                                                                                                                    | 06e–06g           |
| Focused tests            | `yarn vitest run <paths> --maxWorkers=4`           | Same                                                                                                                                                                                                                                                                             | any               |
| Formatting               | `yarn exec prettier --check <paths>`               | Same                                                                                                                                                                                                                                                                             | any               |
| Error lint               | `yarn biome lint --diagnostic-level=error <paths>` | Same                                                                                                                                                                                                                                                                             | any               |

Use `npm pack --json --dry-run` only for diagnostics. The repository pack
checker is the release authority because it validates file identities,
dependency boundaries, and generated-manifest membership. Do not publish from
an execution-unit branch.

## Suggested executor toolkit

- Use the `mcp-builder` skill for unit 07 and any earlier change that touches
  MCP wire contracts, annotations, resources, stdio, or the SDK boundary.
- Use the `agentic-eval` skill for units 00 and 09 to keep rubrics,
  deterministic graders, and model comparisons separate.
- Use `vercel-react-best-practices` while creating the Vite/Next sample apps and
  `web-design-guidelines` for their accessibility/consumer-journey review.
- Run `autoreview` before requesting review on every code-bearing unit. Treat
  findings as input; the unit's tests and contracts remain authoritative.

## Scope

### In scope

- `packages/mcp/**` characterization, neutral-core extraction, and one clean
  unpublished-or-optional-public MCP v1 adapter.
- New `packages/knowledge/**` and `packages/cli/**` packages.
- Root build/release scripts, pack verification, consumer smoke, changesets,
  and relevant GitHub workflows.
- Knowledge compiler inputs and explicit authoring metadata in Salt packages,
  site docs, migrations, tokens, examples, and pattern sources.
- Normalized Markdown, generated `llms.txt` v2 discovery, an Agent Skill,
  managed AGENTS pointer, public sample apps, all public package landing docs,
  contributor guidance, docs navigation, and the AI evaluation corpus.

### Out of scope

- A hosted or remote MCP server, OAuth, user accounts, analytics, telemetry, or
  model inference.
- Automatic code changes, codemods, migration execution, dependency installs,
  `salt-ds init`, or postinstall mutation.
- Embedding search as the canonical index.
- General linting, full WCAG conformance certification, cross-file semantic
  analysis, or support for languages beyond JS/JSX/TS/TSX/CSS in scanner v1.
- Replacing Storybook as a maintainer visual-development and regression tool.
- Promising historical compatibility before the support matrix and immutable
  hosting exist.
- Historical bundle download, pins, shared cache, mutable resolution index,
  signature/key rotation, or historical scan/review. Those belong only to
  `plans/002-add-secure-historical-salt-knowledge.md`.
- Refactoring unrelated Salt package APIs or redesigning the documentation
  site.
- GitHub issue templates or a GitHub-Issues-based support workflow. Tracking and
  pilot evidence in this plan is channel-neutral; the credentialed
  `issue_comment` publisher is still removed as release-security work.
- Figma API access, Code Connect publication, licensed design tooling, or design
  file mutation. A post-GA design-binding spike is recorded below only.

## Git and pull-request workflow

1. Branch each execution unit from the latest merged predecessor, for example
   `feat/salt-ai-00a-release-fence`, `feat/salt-ai-00b-contracts`, and
   `feat/salt-ai-01-pure-seams`, and
   `feat/salt-ai-02-knowledge-package`.
2. Keep one execution unit in one PR. Units 00, 04, 06, 08, and 09 are already split
   into explicit subunits in this plan and the tracker; each has its own
   dependency and checkpoint. If 07 is split later, first add tracker rows;
   never hide multiple independently merged PRs behind one stale status.
   Unit 08c is a narrow release-state-machine exception: it has one
   code-bearing implementation lineage, a generated Changesets version PR,
   plan-control-only receipt updates, and, only on `ship→omit`, one cleanup PR
   plus replacement version PR. Each ref and supersession receipt remains
   separately reviewed; this exception does not permit unrelated code changes
   or combining those refs into one unreviewable PR. Unit 09 is explicitly split:
   09a owns the evaluation/GA-decision PR, 09b is a source-free protected R3
   transition plus plan-control evidence update, and 09c is one bounded post-R3
   navigation/docs PR followed by the normal docs deployment/readback. No other
   source, package, immutable AI-web byte, or release target may change in 09c.
3. Use focused present-tense commits such as
   `feat(knowledge): publish deterministic bundle reader` or
   `refactor(mcp): consume the shared knowledge package`.
4. Add a Changeset normally when a unit changes an already published package.
   Unit 06d's README/manifest remediation is not an exception: every changed
   ordinary public package receives its normal package-scoped Changeset and may
   release through the ordinary workflow. The new AI packages are the only
   exception: keep Knowledge, CLI, and the unreleased MCP private and free of AI
   Changesets through Unit 07 while their pack receipts accumulate version
   intent. Unit 08a flips only the provisionally
   selected graph to release-candidate manifests and creates reviewed cumulative
   initial Changesets with every selected exact dependant. Split
   `.changeset/quiet-catalogs-search.md` in Unit 00a: preserve
   its valid Core/Theme/Date Adapters/Icons bump entries and corresponding notes
   in reviewed ordinary-package Changesets, but remove the unreleased MCP major
   entry and compatibility prose. The preserved pre-existing ordinary entries
   and Unit 06d documentation Changesets may release independently before 08a.
   The 06d docs receipt records each expected package/version/content identity.
   At 08a the materializer reads the live registry and classifies an exact match
   as `materialized_baseline`, records that live version as a dependency, and
   never recreates its consumed bump; a still-pending matching Changeset enters
   the ordinary partition. A published byte/version mismatch, missing pending
   intent, or partial match is a STOP condition.
   Never discard a valid ordinary package change while cleaning the MCP history.
   The Unit 00a embargo makes every pre-08b
   version-PR/publish attempt fail if it selects an AI package.
   Every applicable unit's required pack/migration receipt records its package-
   byte delta and intended bump/dependant treatment. In Unit 08a,
   `materialize:salt-package-version-intent` reacquires the tracker-bound Unit
   02–07 evidence, reconciles coalesced/superseded deltas, and emits one
   `saltPackageVersionIntentV1` receipt. Each entry records package, bump class,
   exact-dependant treatment, reason, source/pack digest, source unit, and closed
   state `pending`, `materialized_baseline`, or `cancelled_unreleased`; only
   `pending` entries are materialized into Changesets. Unit 08a is the only
   command allowed to materialize AI intent into Changesets.
5. Never commit `packages/mcp/generated`, `packages/knowledge/generated`,
   tarballs, raw model outputs, caches, credentials, or unsanitized/local eval
   reports. The only committed evaluation output is the schema-validated,
   sanitized cohort receipt and summary defined in unit 09. Update `.gitignore`
   so generated knowledge is ignored at its new owner.
6. Every PR description records its execution-unit number, contract decisions,
   before/after package sizes where relevant, commands run, and any deferred
   limitation. Generated-output changes are described by bundle and semantic
   digests plus the build receipt rather than checked-in bytes.
7. Merge in dependency order. Do not combine a schema redesign with a package
   move, CLI launch, or MCP v1 surface change.

## Execution dependency graph

```text
00a -> 00b -> 01 -> 02 -> 03 -> 04a -> 04b -> 04c -> 05 -> 06a -> 06b -> 06c -> 06d
06d -> 06e -> 06f -> 06g
06g -> 07 MCP v1 candidate + pre-release ship/omit decision
recorded 07 recommendation -> 08a graph/partition -> 08b publisher -> 08c final MCP/R2
08c final receipt -> 09a pilot/evaluation -> 09b current GA -> 09c public discovery
```

Unit 07 starts after 06g so it evaluates the complete CLI/Markdown/Skill/apps
baseline and can apply the final documentation/package disposition without
time-travelling across parallel sample work. Unit 08a depends on its recorded
candidate recommendation and provisional selected graph; 08c alone records the
effective final graph. Unit 09a depends on 08c; 09b and 09c follow in order.
Historical work is a separate Plan 002 that may begin only after 09c is
tracker-complete, public discovery is live, and the live authority is proven to
descend from 09b R3; it cannot delay this plan.

### Verification convention

Every command block below runs from the repository root with the exact spelling
shown after its introducing unit has added the command. Unless a line explicitly
says otherwise, expected result is exit 0, no stderr error, no publication or
deployment, and no new tracked/untracked generated bytes outside declared
ignored `dist` or temporary paths. Negative cases execute inside test runners,
so the runner still exits 0. Each unit's gate names its required receipt/output;
exit 0 without producing and schema-validating that output does not satisfy it.

### Fresh-checkout cohort rule

From Unit 02 onward, any verification block that packs or uses
`smoke:consumer --skip-build` first runs `yarn build:ai-tooling` in that same
clean job, or the stricter root `yarn build`. Unit 00a's baseline uses its shown
current MCP build before the new command exists. The AI build reconstructs every
unit-required AI package at that checkpoint in dependency order—MCP as a
separate candidate through Unit 07, provisionally after candidate `ship`, and
publicly only after Unit 08c final `ship`—and never
inherits ignored `dist` or generated output from a preceding unit/job. The pack
report inventories exact tarball hashes and internal dependency edges; smoke
consumes only that report.
Missing/stale output, an unreported package, a workspace link, or registry
fallback fails. Unit 07 evaluates and then re-closes the complete 06g cohort;
Unit 08a reacquires its provisional graph, while Unit 08c binds the effective
graph and final disposition.

Pack policy is a closed lifecycle, not an optional flag convention:

| Units        | Policy ID             | Release eligible | Required shape                                                                                          |
| ------------ | --------------------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| 02           | `extraction-parity@1` | no               | Knowledge plus MCP extraction/parity evidence before the outer manifest exists                          |
| 03–06c       | `pre-agent-support@1` | no               | Outer manifest may omit only `agent_support`; R2/R3 and every registry/web mutation remain blocked      |
| 06d–06g      | `release-complete@1`  | no               | Knowledge/CLI and both manifest-selected `agent_support` artifacts; release awaits Unit 07 decision     |
| 07 candidate | `mcp-candidate@1`     | no               | Separate exact-pinned MCP candidate plus Knowledge/CLI comparison identities                            |
| 07 final–08b | `release-complete@1`  | no               | Knowledge/CLI and both `agent_support` artifacts; MCP is only provisionally present on candidate `ship` |
| 08c onward   | `release-complete@1`  | yes              | Knowledge/CLI and both `agent_support` artifacts; MCP present exactly when final disposition is `ship`  |

The checker derives the only allowed policy from the unit contract. Unit 03
removes `extraction-parity@1`; Unit 06d permanently removes
`pre-agent-support@1`. A report always records the policy ID and digest, and no
later checker or publisher accepts a retired policy.

## Ordered execution units

### 00a — Fence publication, verify package namespaces, and seal the ordinary baseline

**Outcome:** unsafe prototype publication is fenced immediately, proposed public
package names and publisher authority are evidenced rather than assumed, and
legacy ordinary-package provenance exceptions are sealed before package work.

**Create in 00a:**

- `scripts/verifySaltAiReleaseEmbargo.mjs` plus root command
  `verify:salt-ai-release-embargo`
- `scripts/verifySaltAiPackageNamespaces.mjs`,
  `scripts/schemas/saltAiPackageNamespaceReceiptV1.schema.json`, and root command
  `verify:salt-ai:package-namespaces`. The schema has closed
  `preflight | release | protected_final` states; register both immutable
  `package-namespace-receipt` (preflight) and
  `package-namespace-release-receipt` (release/protected-final) kind validators
  with the generic evidence acquirer before Unit 08c can emit or reacquire them
- `scripts/schemas/saltPlanEvidenceIndexV1.schema.json`, tracker/index fixtures,
  `scripts/validateSaltAiTracker.mjs`, and root command
  `validate:salt-ai:tracker`, implementing the machine-readable evidence-index
  contract in `plans/README.md`
- `tooling/ai/ordinary-legacy-attestations-v1.json`,
  `scripts/schemas/saltOrdinaryBaselineV1.schema.json`, and
  `scripts/sealSaltOrdinaryBaseline.mjs` with root command
  `seal:salt-ordinary-baseline`

**Immediate release safety fence:** land this as part of Unit 00a before any
successor creates a package boundary. Remove the credentialed `issue_comment`
PR-head publisher completely. Set the unreleased MCP package `private: true`,
remove only its unreleased entry from `.changeset/quiet-catalogs-search.md`, and
preserve the valid ordinary-package entries and notes. Until Unit 08b lands,
every new Knowledge/CLI manifest is also `private: true`, no AI Changeset exists,
and the existing version/release workflow has an allowlist-based embargo that
fails before credentials if a Changeset, target list, or changed package
includes `@salt-ds/knowledge`, `@salt-ds/cli`, or `@salt-ds/mcp`. Version-PR
maintenance may continue for ordinary packages only. A workflow-policy test
proves no PR event can obtain publish credentials and no alternate root script
bypasses the embargo. Unit 08a may prepare release-candidate manifests and
Changesets, but the embargo remains until Unit 08b atomically replaces it with
the sole protected partitioned publisher.

The ordinary baseline is a one-time, path-sorted exception inventory for exact
already-published dependencies that predate usable npm provenance. Each entry
requires name/version, registry integrity, independently downloaded tarball
SHA-256, source tag/commit, repository, reason provenance is unavailable,
release/security approvers, and expiry. The sealing job reads back every public
tarball, rejects mutable/mismatched identities, and emits a tracker-bound
`saltOrdinaryBaselineV1` receipt. An empty inventory is valid. It cannot approve
a future version, substitute for available provenance, or be extended after
Unit 00a without a separately reviewed security decision.

The namespace verifier performs read-only registry and organization-access
checks for `@salt-ds/knowledge`, `@salt-ds/cli`, and `@salt-ds/mcp`; records
whether each name is absent or already owned, every existing version/dist-tag/
deprecation/repository identity, the controlling npm organization, and the
approved protected OIDC publisher identity; and emits an expiring immutable
receipt. An absent scoped package still requires evidence that the `@salt-ds`
scope and granular publish permission are controlled. Existing registry bytes
are never treated as equivalent merely because repository history once used the
name. If Knowledge or CLI has an incompatible prior public identity, or any name
is uncontrolled, STOP and ratify a new name (or a separately scoped major/
compatibility plan) before Unit 00b. Plan 001a is that approved compatibility
addendum: it allowlists only the exact unused CLI/MCP test snapshots and grants
no runtime compatibility. Re-run the check at the final publisher gate; Unit
00a reserves, deprecates, and publishes nothing.

**Verification (00a):**

```shell
yarn test:ai-tooling
yarn typecheck:mcp
yarn workspace @salt-ds/mcp build
yarn check:ai-tooling:pack
yarn smoke:consumer --skip-build
yarn verify:salt-ai-release-embargo
yarn verify:salt-ai:package-namespaces -- --mode preflight --output dist/salt-ai-baseline/package-namespace-receipt.json
yarn validate:salt-ai:tracker
yarn seal:salt-ordinary-baseline -- --inventory tooling/ai/ordinary-legacy-attestations-v1.json --output dist/salt-ai-baseline/ordinary-baseline-receipt.json
```

**00a gate:** the embargo/workflow tests pass; exact namespace-control and
ordinary-baseline receipts are tracker-bound; no registry/deployment write
occurred; and the public names are either proven safe or work stops for a naming
decision. Unit 00a can merge without waiting for product/evaluation consensus.

### 00b — Ratify contracts, ownership, support policy, and evaluation baselines

**Outcome:** maintainers agree what is being built before package boundaries
move, and future performance/quality claims have reproducible baselines.

**Create in 00b:**

- `docs/decisions/0001-salt-ai-knowledge-platform.md`
- `docs/ai/knowledge-bundle.md`
- `docs/ai/scan-result.md`
- `docs/ai/support-matrix.md`
- `docs/ai/evaluation.md`
- `docs/ai/release-runbook.md`
- `docs/ai/contributing.md`
- root `AGENTS.md` for contributors and executor agents; it links detailed
  contracts rather than duplicating them and is never a consumer artifact
- `evals/salt-ai/manifest.schema.json`
- `evals/salt-ai/report.schema.json`
- `evals/salt-ai/waiver.schema.json`
- `evals/salt-ai/scripts/validate.mjs`
- `evals/salt-ai/scripts/runDeterministic.mjs`
- `evals/salt-ai/scripts/buildReport.mjs`
- `scripts/validateSaltAiContracts.mjs` and root command
  `validate:salt-ai:contracts`, covering the 00b inventories/schemas before the
  richer Unit 06 docs verifier exists
- `scripts/retireSaltAiPremergeEvidence.mjs`, tracked registry
  `tooling/ai/premerge-evidence-pairs-v1.json`, hostile tracker fixtures, and
  root command
  `retire:salt-ai:premerge-evidence`. The initial closed registry contains the
  eight Plan-001/08c pairs enumerated in that unit and
  `001/09c: discovery-deployment-candidate-premerge-receipt ->
discovery-deployment-landed-candidate-receipt`; an unregistered plan/unit/kind
  pair, reuse across scopes, or partial batch is rejected
- `scripts/schemas/saltPublicPackageDocsV1.schema.json` and
  `scripts/schemas/saltPublicPackageDocsEffectiveV1.schema.json` plus
  `tooling/ai/public-package-docs-v1.json`, freezing every currently publishable
  package plus reserved `planned` Knowledge/CLI and `conditional` MCP entries,
  each with lifecycle state, README path, metadata fields, packed-byte status,
  owner, and approved channel-neutral support destination or explicit `none`
- `scripts/schemas/saltContentVisibilityV1.schema.json` and
  `tooling/ai/content-visibility-v1.json`, freezing exact public/internal source
  roots, item overrides, destination classes, current unclassified inventory,
  and the batched closure plan
- `tooling/ai/migration-records-v1.json`, freezing the initial canonical
  `docs/ai/migrations/records/**` inventory, accountable component owners, and
  required source evidence before Unit 03 authors records
- the smallest 12–15-case corpus under `evals/salt-ai/tasks/`,
  `evals/salt-ai/retrieval/`, and `evals/salt-ai/scan/`
- a separate activation-only corpus under `evals/salt-ai/activation/` with no
  task, fixture, or gold assertion reused by the gated outcome cohort
- root `package.json` scripts for `eval:salt-ai:validate`,
  `eval:salt-ai:baseline`, and `eval:salt-ai:report`

**Record in the ADR:**

- all twelve executive decisions above and the superseded MCP-primary direction;
- package/API ownership and exact public names;
- one clean Knowledge-v1 bundle/record contract, semantic/compiler/release input
  closures, mandatory item-applicability map, the frozen thirteen-family
  universe, operation-capability allowlist, digest/path codec, workspace-aware
  scan-result, finding-ID, renderer, CLI exit-code, migration-record, and config
  schemas;
- the exact package-manager/layout support table and stable limitation codes;
- concrete scanner defaults/absolute ceilings for traversal, selection,
  parsers, workers, heap/deadline, rules, and output, including which conditions
  are partial versus failed;
- the artifact-tree depth, internal/leaf fan-out, per-node, total-node,
  total-tree-byte, and artifact-count ceilings in the bundle contract, with
  measured current baselines and a reviewed change policy;
- the current-version-only GA boundary and explicit dependency/STOP handoff to
  separate Plan 002 for any historical support;
- support owners for knowledge compiler, CLI/scanner, the MCP candidate and any
  shipped adapter, docs/examples, release/hosting, and evaluation; record the
  approved non-GitHub support destination or explicit absence and the removal
  policy for existing GitHub-Issues links;
- the main-site storage/deployment owner and exact immutable upload, live
  readback, stable-pointer promotion, and rollback mechanism; record it as
  unresolved if unavailable, which blocks web beta/GA but not local package
  extraction;
- a review date, the MCP 2026-07-28/explicit-root v1 contract, and the exact
  candidate/final `ship | omit` decision protocol;
- closed `ORDINARY_RELEASE`, `SALT_AI_RELEASE`, and site-only
  `SALT_DOCS_RELEASE` publication modes, their deterministic target
  authorization, disjoint write sets, shared global lock, and cross-mode
  invocation rejection;
- generated `llms.txt` v2 routes, 64-KiB budget, Markdown alternate/discovery
  relation convention, exact route codec/collision policy, immutable link
  targets, content types, and live verification behavior;
- the three required cumulative evaluation modes, conditional mode-4 candidate
  with closed `not_selected`, diagnostic references, activation
  experiment, cadence tiers, cost/token/time ceilings, counterbalancing, three-run
  repetition rule, sampling/seed and one-retry transient-infrastructure policy,
  denominator/minimum-sample definitions, mode-blind
  adjudication, non-waivable metric IDs, recommended 10-point
  CLI+selected-bootstrap uplift,
  and five-point/two-cell material MCP decision threshold. Freeze these before
  modes 2–4 run.

**Baseline without changing production behavior:**

- Rebuild the current unreleased MCP catalog twice from clean generated
  directories and
  record manifest size, artifact count/bytes, record count, semantic digest,
  derived baseline bundle identity, cold/warm load, search, inspection, and
  review timings.
- Run the current pack and Node 22/24 consumer-smoke paths.
- Freeze a local `legacy_docs_reference` snapshot of the current public
  site/Storybook-oriented journey. Establish all four mode IDs, fixtures,
  graders, activation and efficiency fields, but baseline mode 1 only. Run the
  current MCP, if useful, as a separately labelled `prototype_mcp_reference`
  diagnostic, not as cumulative mode 4 because modes 2/3 do not exist yet. Mark
  modes 2–4 `not_available` with no fabricated score;
  unit 05 makes mode 2 runnable, 06d makes mode 3 runnable, Unit 07/08c evaluate
  mode 4 as a candidate, and unit 09a compares modes 1–3 plus mode 4 only after
  final `ship`. Store only sanitized summary metrics; no prompts, credentials,
  proprietary projects, or model transcripts.
- Characterize the three currently load-sensitive default-timeout tests. Add
  no generous timeout as a substitute for measuring them.

**Verification (00b):**

```shell
yarn workspace @salt-ds/mcp build
yarn test:ai-tooling
yarn typecheck:mcp
yarn check:ai-tooling:pack
yarn smoke:consumer --skip-build
yarn validate:salt-ai:contracts
yarn validate:salt-ai:tracker -- --require-plan 001 --require-unit 00a --require-kind package-namespace-receipt --require-kind ordinary-baseline-receipt
yarn eval:salt-ai:validate
yarn eval:salt-ai:baseline
yarn eval:salt-ai:report -- --cohort baseline-pre-platform
yarn verify:salt-ai-release-embargo
yarn exec prettier --check AGENTS.md docs/ai docs/decisions evals/salt-ai tooling/ai scripts/schemas
```

**00b gate:** every listed ADR decision, schema, owner, numeric scanner ceiling,
package-manager row, controlled-eval protocol, baseline receipt, task ID,
minimum denominator, waiver classification, frozen inventory, and threshold is
reviewed. The
verification commands exit 0 and produce a schema-valid
`evals/salt-ai/baselines/baseline-pre-platform.json`; unavailable modes are labelled,
not scored. If maintainers disagree on the CLI name, knowledge package boundary,
exact-version policy, evaluator controls, publication-mode split, or MCP
ship/omit decision protocol, STOP.

### 01 — Characterize behavior and split protocol-neutral seams in place

**Outcome:** the move in unit 02 is mechanically safe and semantic behavior can
be compared; CLI-sized inputs do not inherit prototype MCP truncation or
authorization concerns.

**Modify in place:**

- `packages/mcp/src/core/review/reviewSaltCode.ts`
- `packages/mcp/src/core/review/submittedArtifactFacts.ts`
- `packages/mcp/src/core/review/reviewRuleRegistry.ts`
- `packages/mcp/src/core/search/searchSalt.ts`
- `packages/mcp/src/core/project/boundedProjectFile.ts`
- `packages/mcp/src/server/inspectSaltProject.ts`
- `packages/mcp/src/server/projectContext/**`
- `packages/mcp/src/core/build/buildRegistry.ts`
- `packages/mcp/scripts/buildRegistry.mjs`
- `packages/mcp/src/core/build/catalogInputPatterns.json`
- `packages/mcp/src/core/registry/paths.ts`
- `scripts/catalogBuildIdentity.mjs`
- `scripts/build.mjs`
- `packages/mcp/package.json`

**Required changes:**

1. Introduce a pure complete analyzer result before MCP result budgets, textual
   truncation, and response envelopes. Characterize the five rule IDs,
   normalized messages, evidence, applicability, and findings as the semantic
   oracle; prototype MCP wire bytes are not a contract. Likewise remove
   `publicResourceBudget.ts` from the Catalog store/integrity path: the store
   enforces bundle/schema limits, while MCP enforces its smaller public resource
   envelope after reads.
2. Separate protocol-neutral installed-package/project facts and pure
   untrusted `.salt` policy parsing/evaluation from MCP root authorization,
   imported-policy authority, snapshot handles, policy resource identities,
   and transport errors.
3. Separate neutral knowledge references from prototype `salt://` resource
   rendering. Search returns an internal record reference; Unit 03 defines the
   clean published identity and Unit 07 defines its new MCP rendering.
4. Parameterize repository root, package root, output root, package version,
   and two separately validated semantic-source/compiler input-pattern files
   in `buildRegistry.ts`/`buildRegistry.mjs`. Characterize the current broad
   inventory and public exposure without narrowing it yet; catch-all
   `packages/*` patterns are forbidden in the target files activated by unit 03. Remove the
   hardcoded MCP-only tooling exclusion at `buildRegistry.ts:58-60`, output at
   `:162-166`, and script paths at `buildRegistry.mjs:8-25`. Replace the static
   MCP `catalogInputPatterns.json` import in
   `scripts/catalogBuildIdentity.mjs` with an explicit validated path supplied
   by package build metadata. Parameterize the temporary catalog generation,
   publication-inventory, schema, and `build_artifacts` paths in
   `scripts/build.mjs` while retaining the prototype's current output only as a
   Unit 01 comparison fixture.
5. Replace implicit default-timeout dependence with reusable verified test
   context and explicit, baseline-derived load bounds. Add a direct cold-start
   measurement before prototype server construction so it does not hide catalog
   initialization.
6. Add characterization fixtures for exact record reads/search, project facts,
   all five review rules, partial package compatibility, integrity failures,
   containment, and complete-versus-truncated analyzer results.
7. Emit a temporary internal baseline containing normalized record/fact/query/
   finding projections, package-family inventory, semantic input inventory, and
   integrity outcomes. Record prototype-only fields separately so Unit 03 can
   prove they were intentionally removed; do not freeze or publish them.

Do not move files or change schemas in this unit.

**Verification:**

```shell
yarn vitest run packages/mcp/src/core packages/mcp/src/server packages/mcp/src/__tests__/createServer.spec.ts packages/mcp/src/__tests__/architectureBoundary.spec.ts --maxWorkers=4
yarn workspace @salt-ds/mcp build
yarn typecheck:mcp
yarn test:ai-tooling
```

**Gate:** the normalized semantic baseline and characterization fixtures are
stable. Any unexplained record, fact, query, finding, applicability, integrity,
or containment change is a STOP condition; prototype wire/URI bytes are merely
inventoried for intentional removal.

### 02 — Create `@salt-ds/knowledge` and move the neutral core behind a temporary baseline

**Outcome:** one package owns the neutral implementation and temporary generated
baseline; no legacy MCP data contract becomes publishable.

**Create:**

```text
packages/knowledge/
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── scripts/buildKnowledge.mjs
├── src/index.ts
├── src/build/
├── src/catalog/
├── src/applicability/
├── src/project/
├── src/review/
├── src/search/
├── src/policy/
├── src/registry/
├── src/schemas/
└── generated/
```

Move the protocol-neutral `packages/mcp/src/core/**` implementation and its
tests into the corresponding knowledge directories using history-preserving
moves. Leave prototype MCP envelopes, URI rendering, snapshots, transport, and
CLI code in MCP until Unit 07 replaces them. Catalog-v2 schemas/readers and
`salt://` fields are temporary internal comparison code only: keep them under an
explicit `internal/prototype-catalog-v2` boundary excluded from package exports
and packed files, then remove that boundary in Unit 03.

Use this extraction boundary rather than moving `core/**` blindly:

| Destination                                 | Current files/symbols                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Knowledge                                   | `core/build/**`; catalog codecs/store/integrity/serialization and portable path/site-route primitives; `applicability/**`; `evidence.ts`; `types.ts`; `versionUtils.ts`; `tokenPolicyStructuralRoleRules.ts`; `project/boundedProjectFile.ts`; pure review facts/rules/analyzer; protocol-neutral search created in 01; registry store/fingerprint/path logic after parameterization |
| Knowledge, explicitly untrusted policy data | `policy/index.ts`, `policy/detection.ts`, `policy/layerDiagnostics.ts`, and `policy/projectPolicyIr.ts` parsing/evaluation; these return facts/diagnostics and grant no authority                                                                                                                                                                                                    |
| Stay in MCP until Unit 07                   | public result/resource envelopes and budgets, prototype URI/citation rendering, policy resource adapters, snapshots, response adapters, tool/resource definitions, transport and MCP CLI                                                                                                                                                                                             |
| Transitional internal only                  | prototype Catalog-v2 schema/reader/generator comparison code and `core/runtime.ts` facade; neither is exported or packed, and Unit 03/07 removes them                                                                                                                                                                                                                                |

Unit 01 must first remove MCP public-resource/result budget imports from the
neutral store and pure analyzer. This unit proves semantic equivalence through
normalized comparison receipts, not by shipping the old schema.

**Package/build requirements:**

- Use the repository generic builder for CJS, ESM, declarations, explicit root
  exports, and package metadata. Set Node `>=22`, `sideEffects: false`, and
  `publishConfig.directory` to `../../dist/salt-ds-knowledge`; keep
  `private: true` under the Unit 00a release embargo through Unit 07.
- Move analyzer/runtime dependencies from MCP to knowledge: Babel
  parser/traverse/types, `js-yaml`, `jsonc-parser`, `micromatch`, `postcss`,
  `semver`, and the shared `zod` contract. Move generator-only dependencies to
  knowledge dev dependencies.
- Make `buildKnowledge.mjs` the only bundle-generation entrypoint. Its inputs
  are explicit and its output is always a clean
  `packages/knowledge/generated` directory; never copy or reuse an existing
  MCP generation.
- Point the package-declared build identity introduced in Unit 01 at
  knowledge's separate semantic-source/compiler pattern files and the temporary
  comparison generator. Emit the prototype catalog only into an ignored test
  directory and emit a schema-valid `extraction-parity@1` receipt comparing
  normalized records, package facts, queries, findings, applicability, and
  integrity behavior with Unit 01. The receipt lists every intentionally dropped
  MCP-only field. No prototype manifest, URI, input inventory, generator label,
  or generated artifact is copied into the package tarball.
- Add `.gitignore` coverage for `/packages/knowledge/generated`.
- In root `package.json`, build knowledge first, then
  `yarn workspaces foreach --exclude @salt-ds/site --exclude @salt-ds/knowledge -Apt run build`,
  then CSS. Expand `test:ai-tooling`; rename `typecheck:mcp` to
  `typecheck:ai-tooling`; remove the old alias before the first public release
  unless a current repository workflow still uses it.
- Add root `build:ai-tooling` as the clean-checkout package-gate prerequisite.
  In Units 02–03 it rebuilds knowledge then MCP; Unit 04a expands it to rebuild
  knowledge, CLI, then MCP. It never assumes a prior unit's `dist` directory.
  Every later `check:ai-tooling:pack` or `smoke:consumer --skip-build` block must
  invoke it first in that same job unless the block already ran the stricter root
  `yarn build`.
- Change the AI-test catalog preparation at
  `.github/workflows/test.yml:119-121` to build knowledge, and update the
  relevant script-order characterization. A temporary internal MCP
  `build:registry` forwarding alias may exist only through Unit 03 for current
  CI; it must call knowledge's comparison generator and is removed before R2.
- Give MCP an exact `"@salt-ds/knowledge": "workspace:*"` dependency. Keep a
  temporary `packages/mcp/src/core/runtime.ts` facade that imports only the
  knowledge package root and adapts its stable API. Do not maintain duplicate
  implementation files or generated artifacts.
- Add architecture tests: knowledge cannot import MCP/CLI or the MCP SDK;
  CLI/MCP can import only the knowledge package root; runtime cannot reach
  generator dependencies; no package imports another package's `/src`.
- Extend `scripts/checkAiToolingPackageDryRun.mjs` with knowledge and MCP
  package-specific contracts, and extend `scripts/consumerRepoSmoke.mjs` plus
  `scripts/consumer-smoke/**` to pack/install the knowledge and MCP tarballs
  together. Assert exact dependency resolution, no workspace link, no
  generated MCP copy, and offline candidate workflows. Do not wait until Unit
  08 to test the new package boundary, but mark this profile nonpublishable.
- Add `scripts/schemas/saltAiPackReportV1.schema.json`. The pack checker writes
  an explicit `--report`, atomically creating its ignored parent directory,
  containing every tarball path/hash, exact first-party dependency edge,
  manifest/digest identity, and policy profile. Packed smoke
  requires `--pack-report` and consumes only those exact bytes; it fails a
  missing/stale report, unreported package, workspace link, or registry fallback.
- Add internal comparison fixtures for traversal, wrong-base, missing-file,
  unlisted-file, artifact-hash, record/fact/query/finding, and applicability
  failures. Package-boundary tests prove no prototype schema, generated tree,
  `salt://` field, or compatibility alias appears in exports or packed files.

**Verification:**

```shell
yarn build:ai-tooling
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn vitest run packages/knowledge/src packages/mcp/src/__tests__/architectureBoundary.spec.ts --maxWorkers=4
yarn check:ai-tooling:pack -- --profile extraction-parity --report dist/salt-ai-pack/unit-02.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-02.json
```

Build twice after removing the generated comparison directories and compare the
normalized extraction receipt, byte counts, hashes, and semantic result. Confirm
MCP contains no generated knowledge copy and neither tarball contains the
prototype catalog.

**Gate:** knowledge is the single future bundle owner, its implementation and
the dependent MCP candidate install together outside the monorepo, the neutral
integrity barrier still fails closed, the semantic comparison receipt passes,
and no prototype Catalog-v2 contract is publishable.

### 03 — Add the outer manifest, compatibility, and code-complete projections

**Outcome:** the knowledge package has a small stable bootstrap, explicit Salt
version support, and non-Storybook content projections over the same identity.

**Create or modify under `packages/knowledge`:**

- `src/schemas/knowledgeManifestV1.ts` plus published
  `schemas/knowledge-manifest-1.schema.json`,
  `schemas/artifact-tree-node-1.schema.json`,
  `schemas/search-index-1.schema.json`,
  `schemas/knowledge-record-1.schema.json`,
  `schemas/migration-record-1.schema.json`,
  `schemas/item-applicability-1.schema.json`, and
  `schemas/operation-capabilities-1.schema.json`.
- `src/manifest/**` for validation, the bounded sharded artifact tree, artifact
  identity, and deterministic serialization.
- `src/manifest/digestCodec.ts` for canonical digest/path segments.
- `src/compatibility/**` for independent package-family resolution, including
  `operationCapabilityRegistry.ts` for the code-owned closed allowlist.
- `src/examples/**` for entry/supporting-file dependency closure.
- `src/markdown/**` for supported MDX-to-Markdown projections.
- `src/index/**` for a compact deterministic discovery index.
- `scripts/buildKnowledge.mjs` and package-copy metadata.
- `scripts/build.mjs` and `scripts/catalogBuildIdentity.mjs` for the one
  Knowledge-v1 publication identity.

**Required behavior:**

1. Implement the outer manifest exactly as contracted above, with the one
   lifecycle exception that `agent_support` is absent until Unit 06d creates and
   binds its artifacts. The schema permits that absence for pre-release build
   fixtures. A temporary closed `check:ai-tooling:pack -- --profile
pre-agent-support` profile permits exactly that missing object in Units
   03–06c, stamps `publishable: false`, rejects any other omission, and refuses
   an R2/R3 stage. Unit 06d deletes the temporary profile and makes
   `agent_support` mandatory in the default/release pack contract. The manifest
   never embeds either input inventory; publish both as artifact-tree-bound
   support artifacts. Generate canonical Knowledge-v1 records from the Unit 02 neutral
   facts and compare their normalized meaning with the `extraction-parity@1`
   baseline. Remove the internal prototype Catalog-v2 generator/reader, legacy
   URI fields, generator labels, manifests, and runtime facade from exports,
   build inputs, generated output, and tarballs. The bootstrap remains at most
   32 KiB and there is exactly one published manifest/identity model.
2. Make `bundle_version` equal the knowledge package version at build and pack
   time. Keep manifest-schema, record-schema, Salt-package-vector, and digest
   axes separate.
3. Resolve exact installed package manifests and workspace/lockfile facts
   without executing consumer code. Cover the complete frozen thirteen-family
   universe and match independent relevant package families;
   prerelease only matches an explicit prerelease range. Use the executing
   adapter's trusted knowledge reader and data bundle; never import a
   project-installed knowledge implementation. Implement every ratified
   package-manager/layout row and stable partial/unsupported reason.
4. Generate Markdown, canonical migration records, and example manifests from
   canonical sources. Dependency
   closure includes local TS/JS imports, CSS imports, assets, provider/theme
   setup, and declared package vector. Fail unsupported dynamic dependencies or
   MDX constructs explicitly.
5. Add deterministic `searchKnowledge`, exact record read, and bounded
   `renderKnowledgeContext` tests. No embeddings or host-specific scoring.
6. Enforce the bootstrap, index, artifact, and package budgets in the bundle
   contract. An allowlist entry requires rationale, owner, and expiry/review.
7. Compare web-ready and npm-ready projection hashes from the same clean
   generation. Do not publish the web routes yet.
8. Teach the generic builder to recognize the package-declared knowledge
   manifest, validate the complete artifact tree, and copy only its leaf
   inventory plus reachable descriptor nodes,
   and produce build identity without hard-coded MCP paths. The knowledge pack
   gate must fail if any selected artifact, source inventory, or generator
   receipt is inconsistent, and must reject every prototype Catalog-v2 path or
   field.
9. Generate and validate mandatory `compatibility/item-applicability.json`.
   Resolve inheritance intersections before emitting runtime indices. Filtering
   precedes retrieval, rule execution, example selection, and projection
   output; coverage retains excluded/unknown counts.
10. Implement the strict canonical-digest/path-segment codec once in knowledge
    and use it for package paths and staged web paths. Add round-trip,
    uppercase, percent-encoding, truncation, traversal, URL, macOS/Linux, and
    Windows path fixtures.
11. Prove input-closure identity: CLI-only, MCP-only, test-only, and
    release-tool-only edits leave bundle bytes and semantic/compiler identities
    unchanged; a semantic-source edit changes `semantic_source_digest` and
    bundle identity; a compiler/ruleset edit changes `compiler_digest`, ruleset
    identity, and bundle identity. A release-tool edit changes only the release
    receipt when output bytes are unchanged.
12. Validate `reader_contract`, `analyzer_contract`, ruleset identity/required
    implementations, and per-operation capabilities. The executing current
    package allowlists its exact tuple; unknown reader/analyzer/ruleset and a
    missing required implementation disable the affected operation. `scan` or
    `review` returns failed coverage rather than applying another implementation.

**Compatibility tests:** every one of the thirteen frozen families; exact
multi-family vectors; a missing optional family; independently versioned and
mixed supported/unsupported families; unsupported older/newer versions;
explicit Lab prerelease; every package-manager/layout row; nested workspaces,
missing install, conflicting markers, multiple locators, and out-of-root pnpm
links; missing/unknown/inherited/cyclic applicability, dangling inheritance,
mixed-family intersection, and attempted broadening; malformed manifest; wrong
digest/bytes; unknown capability tuple; missing rule implementation; tree cycle,
duplicate or case-colliding path, repeated node, dangling child, overlapping
prefix, depth/entry/node-byte overflow, root count/byte mismatch, unlisted
artifact or descriptor node; search-shard overlap/gap/duplicate; deterministic rebuild; Windows path
normalization.

**Verification:**

```shell
yarn build:ai-tooling
yarn vitest run packages/knowledge/src --maxWorkers=4
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-ai-pack/unit-03.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-03.json
```

Validate `manifest.json` with both the runtime validator and its published JSON
Schema. Assert it is at most 32 KiB and contains no corpus/input-list data.
Recompute and compare `bundle_digest` independently by traversing its canonical
descriptor tree, and prove a projection-only fixture changes `bundle_digest`
without changing the normalized `semantic_digest`. Expected result: every
command exits 0, the manifest is at most 32 KiB, no prototype Catalog-v2 path or
field is packed, and the four negative adapter/release-tool identity fixtures
report no bundle delta.

**Gate:** one `bundle_digest` identifies all package/web-ready projections, one
Knowledge-v1 contract replaces the temporary prototype baseline, all published
examples are dependency-complete or explicitly contextual, and no consumer
projection contains a Storybook URL.

### 04a — Create the general CLI shell and version-aware `info`

**Outcome:** a packed Node 22+ `salt-ds` CLI installs with the knowledge package
and reports its own version, the exact project package vector, compatibility,
and knowledge identity without MCP, Storybook, network access, or a model.

**Create:**

```text
packages/cli/
├── package.json
├── bin/salt-ds.js
├── schemas/
│   ├── salt-config-1.schema.json
│   └── scan-result-1.schema.json
├── tsconfig.json
├── tsconfig.test.json
└── src/
    ├── index.ts
    ├── cli.ts
    ├── commands/info.ts
    ├── commands/scan.ts
    ├── config/
    ├── discovery/
    ├── scan/
    │   └── scannerWorker.ts
    └── renderers/
```

Use `publishBinEntrypoints` in the same generated-wrapper pattern as MCP.
Publish to `../../dist/salt-ds-cli`; exact-pin knowledge with `workspace:*`.
Keep `private: true` under the Unit 00a release embargo through Unit 07. Keep the
library export narrow: parsing/test seams may be exported only if they are
intentionally supported.

In this subunit, extend `scripts/checkAiToolingPackageDryRun.mjs`,
`scripts/consumerRepoSmoke.mjs`, and `scripts/consumer-smoke/**` again for the
CLI contract. Pack knowledge and CLI, install both local tarballs in isolation,
and exercise the packed CLI. The root build may continue compiling the
unreleased MCP prototype as regression input, but it is not part of this pack,
smoke, Changesets, or app cohort. Unit 07 replaces/evaluates it separately and
Unit 08a wires the provisionally selected graph into the release plan.

**Implement:**

1. `help`, `version`, `-h`, `--help`, and `--version`, with the flag forms
   exact aliases of their commands, no trailing arguments, and strict argument
   parsing with no implicit command. Test every form through the packed wrapper.
2. `info [root] --json`, using knowledge project facts and compatibility
   resolution. It reports exact observed versions, selected bundle
   version, bundle/semantic digests, disabled families, coverage, and
   limitations.
   Add packed-wrapper tests for all command and flag forms, exact dependency
   resolution, invalid arguments, and offline operation on Node 22 and 24.

**Verification:**

```shell
yarn build:ai-tooling
yarn vitest run packages/cli/src packages/knowledge/src/project --maxWorkers=4
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-ai-pack/unit-04a.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-04a.json
```

**Gate:** the knowledge and CLI tarballs install together outside the monorepo;
packed help/version aliases and `salt-ds info` meet their result, error, and
offline contracts with no workspace link or registry fallback.

### 04b — Add bounded workspace discovery and configuration

**Outcome:** every selected file belongs to one explicit workspace unit with an
independently resolved Salt vector, or is reported as skipped/ambiguous; project
discovery remains deterministic, contained, and resource-bounded.

**Modify:**

- `packages/cli/src/config/**`
- `packages/cli/src/discovery/**`
- `packages/cli/schemas/salt-config-1.schema.json`
- focused CLI discovery, workspace, filesystem-race, and configuration fixtures

**Implement:**

1. Bounded deterministic discovery: canonical root, VCS ignores plus
   `salt.config.json`, fixed exclusions, no out-of-root links, normalized
   portable paths, stable ordering, and every ratified traversal/file/byte cap
   above enforced incrementally before allocation, with config permitted only
   to lower a value. Do not execute code/config. Discover workspace package
   boundaries and conservatively classify each as Salt application, library, or
   unknown with evidence. Assign every selected file to exactly one stable
   relative `workspace_unit_id`, resolve that unit's relevant Salt vector, and
   report every skipped/ambiguous/overlapping unit and reason rather than
   treating it as clean.
   Reuse `readBoundedProjectFile` or an equivalent primitive that verifies
   containment, single-link identity, and before/after file identity. Reject
   multiple hard links, links/junctions, and files replaced while being read.
2. Validate `salt.config.json` without executing code. Unknown keys and invalid
   paths fail closed with code 2; configuration may lower but never raise a
   ratified ceiling, and `.salt` policy remains separately labelled untrusted
   project context.

Cover empty/non-Salt repositories, nested and sibling workspaces on different
vectors, shared libraries, hoisted dependencies, ambiguous/overlapping
ownership, every package-manager/layout row, symlink/junction and hard-link
escapes, replacement races, deep/wide trees, enormous directories, every
discovery cap, CRLF/LF, and repeated runs on Linux and Windows.

**Verification:**

```shell
yarn build:ai-tooling
yarn vitest run packages/cli/src/discovery packages/cli/src/config --maxWorkers=4
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-ai-pack/unit-04b.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-04b.json
```

**Gate:** discovery is deterministic and fail-closed; all selected files have
one stable `workspace_unit_id`, sibling units may resolve different complete
vectors, and every containment/race/limit failure produces explicit non-clean
coverage rather than a silent omission.

### 04c — Add the isolated analyzer, scan renderers, and full fixture matrix

**Outcome:** any supported Node consumer can deterministically review a Salt
repository from the packed CLI, with honest per-unit coverage and no MCP,
Storybook, network access, or model.

**Modify:**

- `packages/cli/src/commands/scan.ts`
- `packages/cli/src/scan/**`
- `packages/cli/src/renderers/**`
- `packages/cli/schemas/scan-result-1.schema.json`
- knowledge analyzer/rule fixtures only where the shared result contract needs
  additional coverage

**Implement:**

1. Per-file analysis over the complete internal analyzer result through the
   named `scannerWorker` boundary. Only the main CLI reaches that worker entry;
   the worker closure stays blocked from network, subprocess, MCP, consumer
   code, and further workers. Enforce schema-validated messages, AST/CSS-node,
   heap, concurrency, and deadline ceilings. Terminate/restart a failed worker,
   discard its entire file result, and return failed coverage. Do not group
   inputs in a way that changes budgets or findings.
2. One workspace-aware versioned scan result and pretty, JSON, SARIF 2.1.0, and
   prompt renderers. Every unit carries its package vector, compatibility,
   file ownership, coverage and limitations; every finding carries its unit ID.
   Finding IDs derive from unit ID, rule ID, and normalized evidence/location,
   never absolute path or message prose. Convert byte coordinates to SARIF
   character locations and include rule/help metadata. Human and prompt output
   include acceptance criteria and an exact rescan command without changing the
   canonical finding.
3. The exact exit-code/stdout/stderr contract above. Broken pipes and
   operational errors are tested. `--allow-incomplete` overrides only
   disclosed partial coverage, never failed evaluation.

**Fixture matrix:** empty/non-Salt repo; valid Salt repo; one finding per
existing rule; parse failure; unsupported construct; ignored/generated files;
nested and sibling workspaces on different Salt vectors; shared libraries;
hoisted dependencies; ambiguous/overlapping ownership; every frozen package
family; symlink/junction escape; multiple hard link; before/after
replacement race; instruction-like comments/config; terminal control text;
deep directory tree; wide tree; enormous single directory; every traversal,
queue, file, byte, discovery-time, AST, CSS-node, rule/finding, cumulative-job,
whole-scan-time, restart, and output cap; worker timeout, OOM, crash, protocol
violation, termination and clean restart; mixed package vector; Lab
prerelease; every package-manager/layout matrix row including ambiguous
markers, missing installs, multiple locators and out-of-root pnpm links;
repeated runs; CRLF/LF;
non-ASCII column; complete/partial/failed coverage; `--allow-incomplete`; all
formats and exit codes.

**Verification:**

```shell
yarn build:ai-tooling
yarn vitest run packages/cli/src packages/knowledge/src/review --maxWorkers=4
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-ai-pack/unit-04c.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-04c.json
```

Run the packed binary, not the source entrypoint, against valid, invalid,
non-Salt, and nested-workspace fixtures on Linux and Windows with Node 22 and 24. Block the network in at least one run and compare normalized JSON/SARIF
bytes across two runs and both operating systems.

**Gate:** the knowledge and CLI tarballs install together outside the monorepo;
packed `salt-ds scan` meets the workspace-aware result, renderer, coordinate,
coverage, isolation, and exit-code contracts, is offline, and makes no claim
beyond evaluated rule coverage.

### 05 — Add `docs` and `context` only after retrieval/projection gates

**Outcome:** agents and humans can retrieve a small, version-correct slice of
Salt knowledge through the general CLI.

**Modify:**

- `packages/cli/src/commands/docs.ts`
- `packages/cli/src/commands/context.ts`
- `packages/cli/src/cli.ts`
- knowledge query/context modules and retrieval gold fixtures
- `docs/ai/knowledge-bundle.md`
- `scripts/sealSaltAiCandidateReceipt.mjs`,
  `scripts/schemas/saltAiCandidateReceiptV1.schema.json`, and root
  `candidate:salt-ai:seal`

`docs` performs exact ID/name resolution and returns manifest-bound Markdown or
JSON. `context` performs bounded lexical/structural retrieval over the compact
index, applies compatibility before ranking, returns citations and digest, and
enforces the 16 KiB default. Ambiguous names return choices; they are never
silently guessed. Unsupported package families are excluded and disclosed.

Replace the current substring/any-word search with a deterministic scored
pipeline: Unicode normalization; exact record ID/export/canonical-name match;
exact alias/title match; normalized phrase match; whole-token intersection;
then weighted whole-token union across title, aliases, authored search terms,
summary, and kind. Remove a small versioned stop-word list only when meaningful
tokens remain, never match arbitrary substrings, apply compatibility before
scoring, use explicit kind/intent boosts, and break ties by stable record ID.
Return matched fields/terms and score components as retrieval evidence. Keep
the scoring version in the index/report contract.

Test exact component/API/token/pattern/migration lookups, aliases, ambiguous and
missing names, version filtering, source citations, output budgets,
deterministic ranking, hostile query strings, and no-network behavior. Ratify a
gold set that includes common-name collisions and deprecated/current APIs.

**Verification:**

```shell
yarn build:ai-tooling
yarn vitest run packages/knowledge/src/search packages/knowledge/src/markdown packages/cli/src/commands --maxWorkers=4
yarn test:ai-tooling
yarn typecheck:ai-tooling
yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-ai-r1/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-r1/pack-report.json
yarn candidate:salt-ai:seal -- --stage R1_PRE_AGENT --pack-report dist/salt-ai-r1/pack-report.json --output dist/salt-ai-r1/cohort-receipt.json
```

Extend installed-consumer smoke for packed `docs`/`context` exact, ambiguous,
missing, empty, version-filtered, and no-network cases.

**Gate:** packed commands pass outside the monorepo; at least 95% correct-record
recall@5 on the ratified gold set; zero unsupported MDX omissions;
deterministic bounded output; and no Storybook URL or MCP prerequisite. The
schema-valid `R1_PRE_AGENT` receipt binds the exact local knowledge/CLI tarball hashes,
bundle identities, test outputs, and clean source commit; it is retained as a
content-addressed CI artifact through the R3 evidence-retention window, records
`publishable: false` and the temporary pre-agent-support profile, and performs
no npm/web access or dist-tag change. The post-merge tracker update records its
schema ID, receipt SHA-256, immutable run/artifact locator, and pack-report
SHA-256; a workflow URL alone is not evidence.

### 06 — Make the public journey Storybook-independent and ship verified apps

**Outcome:** a consumer can discover Salt AI support, install it, build a real
app, retrieve examples, and verify the result without knowing how Salt authors
stories.

Unit 06 is pre-split into these execution units; each is one branch/PR with its
own tracker checkpoint. G4 completes only at 06g:

| Subunit | Deliverable                                                                                   | Depends on |
| ------- | --------------------------------------------------------------------------------------------- | ---------- |
| 06a     | Example schema/manifests/closure, templates, and docs-authoring verifier                      | 05         |
| 06b     | Pattern migration batch A: announcement-dialog through indication                             | 06a        |
| 06c     | Pattern migration batch B: international-phone-number through wizard; retire semantic stories | 06b        |
| 06d     | Manifest-bound web/docs/Skill/AGENTS distribution and staged public navigation                | 06c        |
| 06e     | Vite starter against the full exact candidate cohort                                          | 06d        |
| 06f     | Next App Router starter against the full exact candidate cohort                               | 06e        |
| 06g     | Operations dashboard, adversarial-fixture repair, and full G4 integration gate                | 06f        |

**06d — Documentation and staged navigation changes:**

- Author the final AI guide as a manifest-selected staged projection under
  `tooling/ai/public-docs-v1/**`, around install, `info`, retrieve, build, `scan`,
  CI, security, limitations, and troubleshooting. Through Unit 07 the live
  `site/docs/getting-started/ai.mdx` is only an honest “tooling not yet released”
  notice with no install command, package/version claim, or navigation launch.
  Unit 06d makes no MCP setup/support claim. Unit 08c materializes the canonical
  guide into the immutable release web artifact and, on final `ship`, the
  separately scoped adapter page. R3 activates only the current/root AI-owned
  pointers; Unit 09c separately activates ordinary-site navigation after the
  post-R3 negative crawl.
  Prefer an exact dev dependency and project-local executable; any `npx`
  example pins an exact version or uses `--no-install`, never an implicit
  `latest`.
  Provide ordinary package-script, pre-commit, and GitHub Actions recipes over
  the same CLI/result contract; do not create a separate Salt scan Action in
  v1.
- Stage future links for `site/docs/index.mdx`,
  `site/docs/getting-started/index.mdx`, and the root `README.md`; do not land
  active install/navigation links until the matching package/web release is
  live. Knowledge/CLI private package READMEs may carry the candidate journey
  for pack/smoke. Ordinary public-package remediation in 06d remains useful on
  its own and does not advertise unreleased AI packages.
- Reconcile the root starter with
  `site/docs/getting-started/developing.mdx`; choose one current
  `SaltProviderNext`/CSS setup and label any legacy path.
- Create `packages/knowledge/README.md` and `packages/cli/README.md`. Consume the
  Unit 00b baseline, activate its planned Knowledge/CLI entries, and close the
  exact 06d remediation worklist for every already-publishable public
  `@salt-ds/*` package. Require a
  useful npm landing README plus accurate description, homepage, keywords,
  repository, license, and approved channel-neutral support metadata for each
  entry. Do not introduce GitHub-Issues links. AI package pages explain the
  CLI-first/default path, exact-version behavior, offline boundary, optional
  adapter-neutral extension point and link to the full guide. The unreleased
  MCP entry remains conditional and is excluded from the 06d effective public
  inventory.
- Add `project:salt-ai:public-docs` with closed `preview`, `final`,
  `rebind-landed`, and `activate-navigation` modes. `preview` writes only ignored `dist` output.
  `final` runs only on the Unit 08c version PR, derives ship/omit from the
  supplied final-disposition receipt, and seals the already-staged immutable
  web/package projection without changing live site navigation; its content
  bytes must match preview on retained paths. `rebind-landed` runs only on the
  merged version ref, accepts the tracker-acquired premerge receipt, performs no
  source mutation, and proves the normalized projection payload and every
  selected byte are identical while allowing only declared merge metadata to
  differ. `activate-navigation` accepts only
  the terminal R3 receipt and is used by Unit 09c's post-R3 discovery update.
- Update root `CONTRIBUTING.md` so a GitHub issue is not a prerequisite for a
  contribution. For every frozen package manifest, remove a GitHub-Issues
  `bugs` URL or replace it only with the approved channel-neutral destination;
  `none` means omit the field rather than inventing a contact. Do not create
  issue templates, labels, bots, or migration automation.
- Any README/metadata correction that changes packed ordinary-package bytes gets
  a normal package-scoped Changeset in 06d and is also recorded in the sealed
  pack/docs receipt. It may publish through the ordinary workflow before Unit
  08a. The materializer then either binds its exact registry bytes/version as
  `materialized_baseline` or carries the still-pending matching Changeset into
  `ORDINARY_RELEASE`; it never schedules the same byte delta twice. The docs
  verifier fails a changed package with neither a matching pending Changeset nor
  an exact already-published receipt identity, and fails any registry/content
  mismatch. Already-correct packages need no release.
- Replace the MCP-canonical/no-CLI claims in
  `workflow-examples/consumer-repo/README.md`, while retaining that repository
  as a release fixture rather than presenting it as a starter.
- Update `site/src/layouts/DetailPattern/DetailPattern.tsx` so public pattern
  pages link to canonical inline/source examples, never a Storybook consumer
  URL.

**06d — Web projection:**

- Add `scripts/buildSaltAiWebArtifact.mjs` and
  `scripts/verifySaltAiWebArtifact.mjs` with root commands
  `build:salt-ai-web` and `verify:salt-ai-web`. They stage a release artifact
  under `dist/salt-ai-web/` containing only manifest-bound knowledge bytes,
  immutable `/ai/v1/<digest-segment>/...` paths, separate beta and GA pointer
  candidates, and a release receipt. A beta candidate cannot contain root
  `/llms.txt` or `/ai/current/` mutations.
- Add a preview-only site build step, preferably routed through
  `site/mosaic.config.mjs`, that consumes the staged artifact without adding it
  to the normal production route/navigation graph. Production site builds before
  R3 must prove the preview routes and install claims are absent.
- Generate `/ai/beta/llms.txt`, `/ai/current/llms.txt`, immutable
  `/ai/v1/<digest-segment>/llms.txt`, and root `/llms.txt` only from the same
  manifest-selected public records; root and current pointers exist only at
  GA. Cap every index at 64 KiB, split into manifest-listed family indexes only
  if the cap requires it, and never generate `llms-full.txt` or a concatenated
  corpus. Each indexed HTML record has a deterministic same-route `.md`
  alternate with `text/markdown`, and exposes both that alternate and its most
  specific index through HTML elements or equivalent HTTP `Link` headers.
  These files are noncanonical discovery aids and never compiler inputs. Do
  not check generated digest directories into source control.
- Add a build assertion that the web and npm manifests select identical
  projection hashes. The web receipt enumerates every route, media type,
  content hash, pointer target, alternate, and discovery relation. Stable
  routes may update only after immutable assets are deployed successfully, and
  protected live verification repeats the route, header, bound, and hash
  checks after deployment.

**06a–06c — Story/example migration:**

1. In 06a, add an authored example manifest and dependency-closure loader alongside
   `site/src/components/components/fetchExample.ts`.
2. In 06b, move the 12 currently inventoried patterns `announcement-dialog`,
   `app-header`, `breadcrumbs`, `button-bar`, `comments`, `contact-details`,
   `content-status`, `experience-customization`, `file-upload`,
   `formatted-input`, `forms`, and `indication` to
   `site/src/examples/patterns/<slug>/`; stories become small imports with
   visual/interaction metadata.
3. In 06c, move the remaining 12 current entries
   `international-phone-number`, `keyboard-shortcuts`, `list-builder`,
   `menu-button`, `metric`, `navigation`, `preferences-dialog`, `search`,
   `selectable-card`, `split-button`, `vertical-navigation`, and `wizard`.
   Record the exact 24-entry inventory and its content hash in 06a so newly
   added entries cannot be silently omitted from either batch.
4. Maintain an explicit pattern-ID mapping during migration. Only in 06c,
   after every mapped pattern passes source, site, catalog, and visual tests,
   remove story source globs from semantic inputs.
5. Continue running Storybook/Chromatic for maintainers. Assert that knowledge,
   CLI, public app, and generated Markdown runtime closures have zero
   `@storybook/*` imports.
6. The frozen inventory also includes these eight package-story MDX sources:
   `packages/core/stories/introduction.mdx`,
   `packages/core/stories/floating-platform/floating-platform.mdx`,
   `packages/core/stories/semantic-icon-provider/semantic-icon-provider.mdx`,
   `packages/styles/stories/introduction.mdx`,
   `packages/lab/stories/layout/layouts.mdx`,
   `packages/lab/stories/deck-layout/deck-layout.mdx`,
   `packages/lab/stories/layer-layout/layer-layout.mdx`, and
   `packages/lab/stories/window/window.mdx`. Classify each as migrate, merge,
   or retire with an owner and canonical destination. No supported public
   guidance may remain solely in a story after 06c.
7. Execute, do not merely classify, those dispositions: 06b handles the three
   Core sources and Styles introduction; 06c handles the four Lab sources.
   `migrate` creates a canonical manifest-backed public destination, `merge`
   proves content coverage in an existing destination, and `retire` records why
   no supported claim remains. Receipts bind source/destination hashes, owner,
   status, and any maintainer-only facade retained for visual QA.

In 06a, add `scripts/verifySaltPatternMigration.mjs`,
`scripts/schemas/saltPatternMigrationReceiptV1.schema.json`, root command
`verify:salt-pattern-migration`, and tracked
`tooling/ai/pattern-migration-v1.json`. The tracked contract freezes the Unit 05
checkpoint's exact 24 pattern IDs, eight package-story MDX paths, canonical
record/content hashes, baseline semantic digest, source-authority mapping, and
the only source-path/descriptor changes allowed in 06a, 06b, and 06c. Each
subunit emits a schema-valid ignored CI
artifact at `dist/salt-pattern-migration/<subunit>-receipt.json` with before/after
semantic-source, compiler, baseline semantic, and outer bundle identities.

Also add `scripts/acquireSaltAiEvidence.mjs` and root command
`acquire:salt-ai:evidence`. Its lookup key is the closed
`(plan_id, unit_id, kind)` tuple in the machine-readable evidence index. Omitted
`--plan` is an exact alias for `--plan 001`; any cross-plan lookup must pass an
explicit registered plan ID. As a mutually exclusive form it accepts a reviewed
schema-valid `--selector-from` plus closed `--selector`; that selector must carry
the same exact plan/unit/kind/digest tuple and may not mean `latest` or `current`
by name alone. Plan 001 initially registers its kinds, and later plans may add
reviewed kinds and kind-specific validators without weakening the tuple. The
command reads the immutable artifact locator plus expected SHA-256/
schema ID from `plans/README.md`, downloads into a new ignored destination, and validates
artifact identity, receipt schema, source/completion SHA, and digest before
returning a path. Each migration receipt binds the exact predecessor receipt
digest: 06a consumes Unit 05's `R1_PRE_AGENT` cohort receipt, 06b consumes the
06a migration receipt, and 06c consumes 06b. Retain all three migration
receipts through R3; incremental/cumulative parity never depends on a vanished
prior-job `dist` directory.

For 06b/06c, the 24 canonical pattern record/content bytes and authored example
closures must remain unchanged; `compiler_digest` remains unchanged unless the
reviewed verifier/compiler closure actually changes. Executing the package-story
dispositions may add or expand canonical public MDX destinations. Because those
pages are selected Knowledge page records, their reviewed page/source records
may change the outer `semantic_digest`; the receipt binds their exact paths and
record hashes instead of misreporting whole-manifest semantic parity. Source
relocation may change `semantic_source_digest`, descriptors, and `bundle_digest`
only as enumerated in the tracked contract. The 06c receipt additionally proves
the exact 13-pattern compiler-closure removal, its configuration hash, and that
no story path remains a semantic input; all eight package-story dispositions are
complete with destination/content evidence, and every retained story is only a
maintainer facade over canonical public guidance. An unclassified identity
change is a STOP condition, not a snapshot update.

Because 06a/06b/06c change selected knowledge/input identity, each subunit's
pack receipt records cumulative knowledge/CLI version intent but adds no AI
Changeset while the packages are private. Unit 07 likewise records MCP initial-
release intent only on provisional `ship`. Unit 08a materializes the complete
reviewed cumulative Changesets and exact-dependency treatment in one release
plan. From that point, the pack report fails a stale selected exact dependency
even when adapter source did not change.

**06a — Documentation authoring quality:**

- Update `templates/component-pages/**` and `templates/pattern-pages/**` plus
  contributor guidance so new content supplies a concise summary, use/avoid
  guidance, canonical imports/providers, applicability/stability,
  dependency-complete examples, keyboard behavior, authored accessibility
  guidance, deprecations/migrations, and related records where relevant.
- Keep authored normative guidance, generated API facts, inferred
  implementation signals, and test receipts as distinct provenance kinds.
- Require every authored source, generated fragment, example, resource, and
  normalized link destination to resolve to explicit `public` or `internal`
  visibility through item metadata or the frozen exact inventory. A public item
  that references an internal item must provide an authored public fallback;
  the compiler fails rather than guessing visibility or redacting after build.
- Treat 06a as the controlled migration start, not an impossible instant
  rewrite. Freeze the current unclassified files/destinations and path-sorted
  06b/06c batches in `content-visibility-v1.json`; templates and all new/edited
  content fail immediately, while unchanged legacy entries are allowed only
  when named in the remaining batch. 06b and 06c close their assigned batches;
  06d activates zero-unclassified visibility closure for every build.
- Add a docs-authoring verifier that fails missing example manifests, duplicate
  canonical facts, unsupported MDX projections, stale package vectors,
  inaccessible image text/alt, broken internal links, and unlabelled legacy
  guidance. It also checks the frozen public-package README/metadata inventory,
  story disposition inventory, and staged visibility closure in 06a–06c. The
  package-docs inventory has the same controlled migration rule: 06a freezes an
  exact path-sorted 06d remediation worklist; new/edited packages and any new
  deficit fail immediately, while only named untouched deficits remain allowed
  through 06c. Unit 06d must close that worklist to zero and prove every packed
  README/metadata hash matches the reviewed inventory. Those
  authoring-only stages neither require nor pretend to validate a web route map
  that does not exist yet. In 06d, after `build:salt-ai-web`, the required
  `--require-web-route-map <path>` input adds generated `llms.txt`/Markdown route
  closure and remains mandatory thereafter. Do not require every heading where it is
  genuinely inapplicable;
  use an explicit waiver with owner/reason instead of filler text.
  Implement it as `scripts/checkSaltDocsAuthoring.mjs` with root command
  `check:salt-docs-authoring`.

Unit 07 may fill the conditional MCP README/metadata and adapter-page templates
for evaluation but cannot make them effective or production-routable. Unit 08c
is the sole finalizer: `ship` materializes and hash-seals those release bytes;
`omit` removes them from every final projection. R3 activates the stable
AI-owned current/root web pointers; Unit 09c separately activates ordinary-site
navigation. It
emits `saltPublicPackageDocsEffectiveV1` over the path-sorted effective entries,
packed README/manifest hashes, final MCP disposition, and selected graph. The
R2 candidate, docs verifier, pack report, and web receipt must all bind this
same effective inventory.
Implement this as `scripts/sealSaltPublicPackageDocs.mjs` and root command
`seal:salt-public-package-docs`. Its `provisional` mode in 06d requires MCP to
remain conditional and emits a nonpublishable receipt; its `final` mode requires
the Unit 08c final disposition/effective graph and emits the release-authorizing
receipt. A `rebind-landed` mode compares the reviewed premerge and landed
README/manifest bytes without rewriting them.

**06d — Agent Skill and managed AGENTS projection:**

- Create `skills/salt-design-system/SKILL.md` with procedural setup, exact
  activation cues, the five-step CLI workflow above, trust warnings, and links
  to progressive references.
- Keep API facts and examples out of the Skill. Validate it against the Agent
  Skills structure and keep the primary file below 500 lines/5,000 tokens.
- Generate the small manual `AGENTS.md` block as
  `skills/salt-design-system/references/managed-agents-block.md`. Both files are
  ordinary manifest-selected artifacts with item applicability; npm and
  immutable web copies are byte-identical. The outer manifest's
  `agent_support` object points to their ordinary artifact descriptors. The
  artifacts do not embed `bundle_digest` (which would be circular); the managed
  block may embed `bundle_version` and the Skill artifact SHA-256.
- Regenerate the outer manifest, applicability map, bundle digest, package/web
  projections, and golden receipts after adding these artifacts. This is an
  expected pre-release identity change from Unit 03–06c, not a parity failure;
  no beta/GA artifact may retain the earlier manifest without `agent_support`.
- Remove the temporary `pre-agent-support` pack profile and its CLI option in
  this subunit. From this commit onward, the default and only pack/release
  contract requires both descriptors and exact selected bytes; tests prove the
  removed profile is rejected and `R1_PRE_AGENT`/`R2_BETA`/`R3_GA`
  verification cannot bypass the
  requirement.
- Implement packed `salt-ds skill info --json` and
  `salt-ds skill print --kind skill|agents`. `info` returns the package-relative
  artifact path, artifact hash, bundle version/digest, official/custom
  provenance label, and immutable URL—never an absolute path. `print` validates
  and emits exact selected bytes without writing or using the network.
- Document manual, host-specific registration/copy steps only. No postinstall,
  initializer, or automatic consumer-repository mutation ships in this plan.
- Add an explicit public-artifact allowlist covering only the generated Skill
  and managed block paths. Negative fixtures include root and nested contributor
  `AGENTS.md` files, workflow examples, `.github/*instructions*`, `plans/**`,
  and copied or edited managed blocks; none can enter the bundle by basename or
  glob coincidence. The root contributor `AGENTS.md` remains repository-only.
- Trust follows provenance, not filenames or managed markers: system/host/user
  policy remains authoritative; manifest-verified package artifacts are
  official Salt guidance but confer no authority for mutation, network,
  installs, secrets, or command execution; repository `.salt` files, source,
  docs, examples, and arbitrary `AGENTS.md` remain untrusted project data;
  copied/edited blocks, prompt projections, and model output are untrusted
  handoffs until reviewed.
- Test packed `skill info/print` in physical `node_modules` and a Yarn PnP
  consumer (self-artifact access only; scan compatibility remains partial),
  official versus custom-bundle provenance, wrong artifact bytes, and edited or
  fake managed markers. A marker never upgrades trust.

**06e–06g — Public sample apps:**

```text
examples/apps/vite-starter/
examples/apps/next-app-router/
examples/apps/operations-dashboard/
```

Add `scripts/checkSaltSampleApps.mjs` and root `check:salt-sample-apps`. Build
one candidate-cohort receipt containing package name, exact version, tarball
path, and integrity hash for knowledge, CLI, and every direct or transitive
first-party `@salt-ds/*` package used by the apps. At minimum, Vite and Next use
exact Core+Theme candidates and operations-dashboard uses exact
Core+Theme+Lab; discover and pack the full first-party closure (including Icons,
Styles, Window, or other reached packages). MCP is not an app dependency and is
evaluated in Unit 07's separate candidate receipt.

Copy each app to an isolated temporary directory, substitute receipt-selected
`file:` tarballs only in that copy, generate and replay its lockfile, then run
its declared build/typecheck/interaction/a11y/scan contract. Checked-in
manifests and lockfiles remain byte-identical. Fail if any first-party Salt
dependency is a workspace link or resolves from the registry instead of the
candidate cohort. After the isolated dependency-install phase, block network
access for build, typecheck, interaction/a11y, and scan; include a fixture that
attempts a fetch and must fail the harness. The apps cannot depend on a CDN,
live docs, Storybook, or registry at runtime/test time. Record offline-guard
results in the cohort receipt. Every reached Salt family version equals the
bundle's tested vector.

- Pin the exact candidate Salt versions represented by the bundle.
- Use only public package entrypoints and released configuration.
- Include provider/theme setup, responsive layout, light/dark and density
  behavior, a labelled form, navigation, an overlay/feedback flow, and a small
  realistic composition.
- Include build, typecheck, interaction, axe, and authored keyboard tests plus
  `salt-ds scan` expected-clean assertions.
- For the Next App Router app, run a production build and server, assert the
  initial server HTML contains the expected themed Salt UI, keep the client
  boundary minimal and explicit, require zero hydration/console errors, and
  exercise one post-hydration interaction plus light/dark behavior.
- Include README instructions for the CLI workflow, expected limitations, and
  a Skill/`AGENTS.md` example. Unit 07 may add optional MCP instructions only
  after `ship` is recorded.
- Keep intentional scanner failures in separate eval fixtures, not in the
  clean public app.

Resolve the fixture contradiction: either implement the analytics/default
behavior claimed for `workflow-examples/consumer-repo/src/components/AppButton.tsx`
or remove the wrapper preference and claim from its `.salt` policy/docs.

**Verification and expected result by subunit:**

```shell
# 06a — every example is manifest-backed or explicitly tracked; all exit 0
yarn build:ai-tooling
yarn build-storybook
yarn test:components
yarn test:ai-tooling
yarn check:salt-docs-authoring -- --authoring-stage 06a --visibility-stage 06a
yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-pattern-migration/06a-pack-report.json
yarn acquire:salt-ai:evidence -- --unit 05 --kind cohort-receipt --tracker plans/README.md --output dist/salt-pattern-migration/input/unit-05-cohort-receipt.json
yarn verify:salt-pattern-migration -- --batch 06a --baseline tooling/ai/pattern-migration-v1.json --predecessor-receipt dist/salt-pattern-migration/input/unit-05-cohort-receipt.json --pack-report dist/salt-pattern-migration/06a-pack-report.json --output dist/salt-pattern-migration/06a-receipt.json

# 06b — all 12 named batch-A entries report complete closures; all exit 0
yarn build:ai-tooling
yarn vitest run packages/knowledge/src/__tests__ --maxWorkers=4
yarn test:ai-tooling
yarn check:salt-docs-authoring -- --authoring-stage 06b --migration-batch 06b --visibility-stage 06b
yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-pattern-migration/06b-pack-report.json
yarn acquire:salt-ai:evidence -- --unit 06a --kind migration-receipt --tracker plans/README.md --output dist/salt-pattern-migration/input/06a-receipt.json
yarn verify:salt-pattern-migration -- --batch 06b --baseline tooling/ai/pattern-migration-v1.json --predecessor-receipt dist/salt-pattern-migration/input/06a-receipt.json --pack-report dist/salt-pattern-migration/06b-pack-report.json --output dist/salt-pattern-migration/06b-receipt.json
yarn build-storybook
yarn test:components

# 06c — all 24 entries are independent; zero public story URLs/inputs; all exit 0
yarn build:ai-tooling
yarn vitest run packages/knowledge/src/__tests__ --maxWorkers=4
yarn test:ai-tooling
yarn check:salt-docs-authoring -- --authoring-stage 06c --migration-batch 06c --visibility-stage 06c --require-storybook-independent
yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-pattern-migration/06c-pack-report.json
yarn acquire:salt-ai:evidence -- --unit 06b --kind migration-receipt --tracker plans/README.md --output dist/salt-pattern-migration/input/06b-receipt.json
yarn verify:salt-pattern-migration -- --batch 06c --baseline tooling/ai/pattern-migration-v1.json --predecessor-receipt dist/salt-pattern-migration/input/06b-receipt.json --pack-report dist/salt-pattern-migration/06c-pack-report.json --output dist/salt-pattern-migration/06c-receipt.json
yarn build-storybook
yarn test:components

# 06d — descriptors exist, Skill/AGENTS npm/web hashes match, no deploy; all exit 0
yarn build:ai-tooling
yarn project:salt-ai:public-docs -- --mode preview --source-root tooling/ai/public-docs-v1 --output dist/salt-ai-web/public-docs-preview-receipt.json
yarn build:salt-ai-web -- --public-docs-preview-receipt dist/salt-ai-web/public-docs-preview-receipt.json
yarn verify:salt-ai-web -- --public-docs-preview-receipt dist/salt-ai-web/public-docs-preview-receipt.json --forbid-production-ai-navigation
yarn workspace @salt-ds/site build
yarn test:ai-tooling
yarn check:salt-docs-authoring -- --authoring-stage 06d --require-visibility-closure --require-web-route-map dist/salt-ai-web/route-map.json
yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/unit-06d.json
yarn seal:salt-public-package-docs -- --mode provisional --inventory tooling/ai/public-package-docs-v1.json --pack-report dist/salt-ai-pack/unit-06d.json --output dist/salt-ai-pack/unit-06d-package-docs-receipt.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-06d.json
yarn eval:salt-ai:validate

# 06e — exact full cohort, no workspace links/manifest edits/network after install; all exit 0
yarn build
yarn check:salt-sample-apps -- --app vite-starter

# 06f — independently rebuild the exact full cohort in this fresh unit; all exit 0
yarn build
yarn check:salt-sample-apps -- --app next-app-router

# 06g — one identity cohort and the complete G4 graph; all exit 0
yarn build
yarn check:salt-sample-apps -- --app operations-dashboard
yarn check:salt-sample-apps
yarn test:components
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/unit-06g.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-06g.json
yarn build:salt-ai-web
yarn check:salt-docs-authoring -- --require-storybook-independent --require-visibility-closure --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web
yarn workspace @salt-ds/site build
```

**Gate (06a):** the tracked 24-ID baseline and schema-valid 06a receipt exist;
the receipt binds the tracker-verified Unit 05 cohort and current pack-report
digests; every example is manifest-backed or explicitly reviewed, and no
unclassified canonical fact/identity change is present.

**Gate (06b):** the schema-valid 06b receipt proves exact non-batch parity,
binds the tracker-verified 06a receipt and current pack-report digests, contains
only reviewed batch-A source/descriptor deltas, retains all 24 stable IDs,
executes the four assigned package-story dispositions, and closes the 06b
visibility batch.

**Gate (06c):** the schema-valid 06c receipt proves incremental and cumulative
parity through the tracker-verified 06b receipt, binds the current pack-report
digest, retains all 24 stable IDs, reports zero story semantic inputs/public
URLs, proves all eight package-story dispositions/destinations complete, closes
the final legacy visibility batch, and contains no unclassified identity delta.

**Gate (06d):** the pack report names the sole current
`release-complete@1` policy, includes both `agent_support` artifacts, and matches
npm/web bytes. Active pack, smoke, web, and release code reject the removed
pre-agent-support profile and every Unit 05 `R1_PRE_AGENT` report. Visibility
closure has zero unclassified items or destinations, and public package docs/
metadata match their frozen manifest.
The schema-valid provisional package-doc receipt is persisted with the 06d pack
evidence. Ordinary documentation Changesets remain governed by the ordinary
publisher; no Salt-AI publisher accepts this provisional receipt until Unit 08c
replaces it with the final effective package-doc seal.

Also run each public app's clean install, build, typecheck, interaction/a11y
tests, and packed `salt-ds scan`. Crawl generated public Markdown and docs
navigation for broken links, Storybook URLs, unsupported MDX remnants, missing
example files, absolute paths, and digest mismatches.
For every Unit 06d–08b production-profile site build, also assert that staged AI
routes are absent and no root/site/ordinary-package page advertises an
installable Knowledge, CLI, or MCP package. Preview builds must carry an obvious
nonproduction marker and use no live navigation entry.

**Gate (06g):** all public examples are source-backed and code-complete or have
an approved waiver; the full exact local Salt dependency cohort is rebuilt
through the pack/smoke mechanism established in Unit 04c, and all three apps use
those bytes with network denied after install; no consumer journey depends on
Storybook or MCP; Skill/AGENTS,
site, immutable web, and npm artifact hashes agree. Snapshot/registry/web
publication remains an authorized unit-08/09 action.

### 07 — Build and evaluate an optional MCP v1 candidate

**Outcome:** an unpublished, current-spec MCP candidate either demonstrates a
material advantage over the CLI/Markdown/Skill journey and earns inclusion in
R2, or is omitted before any public contract exists.

**Modify:**

- `packages/mcp/package.json`
- `packages/mcp/src/index.ts`
- `packages/mcp/src/cli.ts`
- `packages/mcp/src/core/runtime.ts`
- `packages/mcp/src/server/createServer.ts`
- `packages/mcp/src/server/registerTools.ts`
- `packages/mcp/src/server/registerResources.ts`
- `packages/mcp/src/server/responseAdapters.ts`
- `packages/mcp/src/server/toolDefinitions.ts`
- `site/docs/integrations/mcp.mdx`, its navigation entry,
  `packages/mcp/README.md`, and MCP package metadata only on the `ship` path
- MCP architecture, protocol, public-surface, load, offline, and consumer tests

**Required result:**

- Treat the repository's current MCP implementation as a characterization
  oracle only. It has no stable version; Plan 001a's unused test snapshots grant
  no compatibility. Its exports, CLI flags, tool names, URI grammar, Catalog-v2
  bytes, Roots behavior, and wire snapshots create no migration obligation.
- Implement the ratified MCP contract above as a clean v1 candidate. MCP
  exact-pins and imports `@salt-ds/knowledge` only through its package root;
  remove its generator scripts, compiler dependencies, Catalog-v2
  implementation, generated-copy metadata, and
  `publishBuildIdentityManifest` after normalized semantic comparison is green.
- Candidate public shape is package `@salt-ds/mcp`, binary `salt-mcp`, factory
  `createSaltMcpServer(options)`, and one schema-derived options type. Do not
  retain `runCli`, prototype option types, old `salt://` identities, aliases,
  or deprecated behavior merely because they exist in the repository today.
- Target MCP `2026-07-28` using the current Tier-1 TypeScript SDK. Expose only
  the three ratified tools and immutable digest-bound Knowledge-v1 Resources.
  Static knowledge remains usable without a root; project reads are authorized
  only by repeatable startup `--root` arguments or the equivalent
  `projectRoots` option. Never infer authority from cwd, repository content,
  model input, arbitrary tool arguments, or `roots/list`.
- Implement that bounded Resource/Resource-Template contract. A template read
  validates exact ID/path and the artifact tree before returning bounded bytes.
  Host tests cover first/last page, the absent initial cursor, empty/malformed/
  reusable same-output, stale, and cross-bundle cursors, count/byte ceilings,
  malformed cursor rejection, exact template reads,
  no corpus enumeration, and a host that eagerly lists every advertised
  Resource.
- Keep stdout protocol-only, stderr logging, Zod input/output validation,
  structured plus bounded text results, and accurate
  read-only/idempotent/closed-world annotations.
- Populate but do not activate the Unit 00b conditional MCP package-doc entry on
  candidate `ship`; candidate `omit` removes its staged README/metadata. The
  entry cannot enter an effective public docs inventory before Unit 08c.
- Keep static exact reads as Resources and dynamic search/inspection/review as
  Tools. Add no prompts, sampling, elicitation, HTTP server, or mutations.
- Remove the temporary core facade after all adapter imports are direct and the
  boundary tests prove knowledge has no reverse dependency.

Use current supported-host and SDK-client integration tests to negotiate,
list/call all three tools, list/read representative resources, compare
structured outputs with the CLI or knowledge equivalent, exercise explicit
root/no-root/multiple-root, traversal, symlink/junction, invalid input, result
budget, cancellation, clean shutdown, and rejection of a 2025-era opening.
Re-run cold/warm load,
tool-list token cost, reachable-runtime/surface, and setup-friction
measurements. A packed-consumer test imports the candidate factory and its one
options type through CJS and ESM; the tarball remains nonpublishing evidence.

Run the frozen pre-release MCP-eligible evaluation subset against mode 3 and
mode 4 using the exact candidate. Emit a schema-valid recommendation receipt with
source SHA, candidate tarball hash, knowledge version/digests, spec and SDK
versions, host matrix, task IDs, outcome delta, setup/time/token/tool-call
costs, security results, threshold, approvers, rationale, and exactly one
`mcp_candidate_disposition: ship | omit`. `ship` requires the predeclared
material-value threshold and every security/interoperability gate. Otherwise
record `omit`.

After that receipt is sealed, apply the recommendation before Unit 07 completes.
For `ship`, keep only the clean v1 package surface and mark it provisionally
selected, still private and without a Changeset. For
`omit`, delete the workspace and strip it from root build, pack, Changesets,
docs, samples, and release inventories. Rebuild and dry-pack
the resulting selected package graph, and emit a final Unit 07 pack receipt
that binds the immutable candidate-decision receipt. The tracker records both
the evaluated candidate SHA/artifact and the final selected-graph SHA/receipt.
On `ship`, add the MCP integration page/navigation and package README/metadata
only to the ignored preview/final-candidate projection, then run the docs-
authoring/site/web checks again; on `omit`, those checks prove there is no MCP
consumer claim. A pre-R3 build/site negative-exposure check must find neither
the MCP route nor any MCP/CLI install claim; it is not the later tracker-bound
production crawl. The adapter page contains setup/transport facts
only, links canonical Knowledge records for Salt facts, and is explicitly
excluded from the Knowledge semantic-source allowlist. A negative closure test
proves ship-only adapter docs leave Knowledge/CLI bytes and digests unchanged,
so Unit 08a's cumulative release plan adds an initial MCP Changeset without a
Knowledge/CLI byte change.

**Verification:**

```shell
# Phase A — build and evaluate the unpublished candidate
yarn build:ai-tooling
yarn vitest run packages/mcp/src --maxWorkers=4
yarn workspace @salt-ds/mcp measure:runtime-loc
yarn workspace @salt-ds/mcp measure:surface
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --profile mcp-candidate --report dist/salt-ai-pack/unit-07.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-07.json
yarn eval:salt-ai:run -- --cohort mcp-pre-release --candidate dist/salt-ai-pack/unit-07.json
yarn eval:salt-ai:gate -- --cohort mcp-pre-release --decision-receipt dist/salt-ai-eval/mcp-candidate-disposition.json

# Phase B — apply ship or omit, then verify only the final selected graph
yarn build:ai-tooling
yarn check:ai-tooling:pack -- --mcp-candidate-disposition-receipt dist/salt-ai-eval/mcp-candidate-disposition.json --report dist/salt-ai-pack/unit-07-selected.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-07-selected.json
yarn build:salt-ai-web
yarn check:salt-docs-authoring -- --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web
yarn workspace @salt-ds/site build
```

**Gate:** the candidate recommendation and selected-graph receipts are immutable
and tracker-bound. If the candidate disposition is
`ship`, the packed MCP has no catalog/compiler copy, selects the identical
knowledge version/digests as CLI, passes the complete host/security matrix, and
joins the provisional Unit 08a package set. If it is `omit`, Unit 08a excludes the
package, binary, metadata, README, docs, and mode-4 release claims. Because MCP
has no stable release and its unused snapshots are governed by Plan 001a,
omission needs no compatibility window, alias, or migration code; the protected
transition still performs Plan 001a's exact snapshot deprecation/tag cleanup.
In either outcome, the normal production route graph remains pre-release: it
contains no CLI/MCP install claim or candidate adapter navigation. Only ignored
preview and immutable candidate artifacts may contain those bytes.

#### Unit 07 reproducibility repair — 2026-08-29

The original Unit 07 feature result and `mcp_candidate_disposition: omit`
remain unchanged, but the selected Knowledge+CLI graph is not a valid terminal
candidate until a clean CRLF checkout and a clean LF checkout of the same
source commit produce identical semantic-source, compiler, semantic, bundle,
packed-package, and consumer-smoke identities.

Canonicalize every declared catalog input as valid UTF-8 with CRLF and lone CR
converted to LF before inventory hashing and before any tracked text read.
Reject invalid UTF-8 rather than replacing bytes. Keep path, link-topology,
enumeration, and mid-build mutation checks fail-closed. Every copied textual
source artifact, including package-owned JSON schemas, must use the same LF
projection; no binary input may be silently decoded or normalized.

Add focused hostile and parity tests for LF, CRLF, lone CR, invalid UTF-8, and
post-inventory mutation. Then rebuild the exact implementation commit from two
clean, offline source trees with opposing checkout line endings. The repaired
Unit 07 evidence index must retain the original MCP decision, supersede the old
selected-graph receipt with the new exact graph, record both clean-build
identities, and remain entirely local and unpublished.

**Repair completion — 2026-08-30:** Clean CRLF and LF checkouts of
`37e8372bf52c297bb056c1018b095897d3d2d5c6` produced identical generated and
distribution trees, Knowledge/CLI tarballs, pack report
`sha256:1994bf349cb33e0f359a4a24f7191a1a88ae07a190412813e012862bf9deb63f`,
and consumer-smoke receipt
`sha256:1b134e1b6adae314f549564d41f8d08de08439b81a57ac2f589fe3124935e6cc`.
The successor selected graph is
`sha256:c3a1f771744133756e01c3cc737085bab63b77577564f588b21254b88a899884`;
no package was published and no deployment or dist-tag was changed.

### 08a — Freeze the selected package graph and partition the version plan

> **Transferred to Plan 003.** Units 08a through 09c are retained below so the
> original release design remains reviewable. They are not executable Plan 001
> work and do not gate Plan 001 completion.

**Outcome:** the selected Knowledge+CLI graph, plus the MCP candidate only when
Unit 07 recommends `ship`, and the matching web artifact are closed by one
reviewed version-plan partition and reproducible packed-consumer receipt. This
subunit has no credentials and publishes nothing.

Units 02 and 04 already introduced package-specific pack and isolated-install
checks. This unit closes their remaining budgets/platform cases and makes those
same commands authoritative in PR, snapshot, and release workflows; do not
replace them with a second verifier.

**Modify in 08a:**

- root `package.json`
- `scripts/checkAiToolingPackageDryRun.mjs`
- `scripts/consumerRepoSmoke.mjs`
- `scripts/consumer-smoke/**`
- `.github/workflows/test.yml`
- `scripts/partitionSaltReleasePlan.mjs`
- `scripts/schemas/saltReleasePartitionReceiptV1.schema.json`
- `scripts/schemas/saltPackageVersionIntentV1.schema.json`
- `scripts/materializeSaltPackageVersionIntent.mjs`
- `scripts/schemas/mcpFinalDispositionV1.schema.json`
- package manifests for knowledge and CLI, plus MCP only when selected
- AI release verification tests, including MCP-specific cases only when selected
- related package-boundary/smoke tests
- `.changeset/config.json` only if an explicitly reviewed release-policy change
  is required
- `.changeset/quiet-catalogs-search.md` or its replacement

Before calculating the planned partition, change Knowledge and CLI from
`private: true` to release-candidate manifests and do the same for MCP only on
provisional `ship`; run the materializer over sealed Unit 02–07 pack/migration
evidence, compare each package with the live/default-branch version and current
Changeset status, and create cumulative bumps only for still-unreleased matching
bytes.
The Unit 00a workflow embargo remains active,
so neither the 08a PR nor a generated version PR can publish these packages.

**Deterministic version-plan partition:** Changesets remains the version and
changelog calculator; it is never the publication target selector. Add
`partition:salt-release-plan` with two closed phases:

1. `planned` consumes `changeset status --output`, the publishable-package
   inventory, current manifests, exact dependency graph, and the current
   program's schema-valid cumulative version-intent receipt. A `final` omit
   replan consumes a successor intent that explicitly marks the unreleased MCP
   entry `cancelled_unreleased`, names the terminal omit/effective-graph and
   superseded-intent digests, and leaves only effective Knowledge/CLI entries
   active. It rejects a missing/extra package, bump/note mismatch, stale pack
   digest, unmaterialized active intent, unauthorized cancellation, duplicate
   consumed intent, or Changeset with no intent. Its selection
   inputs are mutually exclusive: the normal `candidate` profile requires Unit
   07's candidate-disposition plus provisional selected-graph receipts; an 08c
   `final` replan requires the final-disposition plus effective selected-graph
   receipts and the digest of the planned receipt it supersedes; later release
   programs use `effective` with the already-landed final-disposition/effective-
   graph receipts and no supersession. Mixing profiles, omitting a required
   parent, or using `final` to promote `omit→ship` fails. It emits a parent digest and
   disjoint ordinary/AI child digests with exact names, proposed versions,
   dependency edges, selection profile/evidence, empty/non-empty status, and
   source ref.
2. `applied` runs only after `changeset version`. It proves every planned
   version/changelog was applied once, no package Changesets remain, every
   permitted AI→ordinary cross-partition dependency has the planned final exact
   version, no ordinary→AI edge exists, and the
   package sets and source ancestry are unchanged. It emits an immutable
   applied receipt; any drift requires a new reviewed version plan.

Every changed publishable package appears in exactly one partition. Knowledge,
CLI, and the candidate MCP only when selected are the AI partition; all other
Salt packages are ordinary. A dependency edge may cross partitions only from
an AI target to an ordinary dependency; an ordinary→AI edge is impossible under
the required ordinary-first release order and is a hard STOP requiring graph
redesign or repartitioning. A publication target may not cross partitions.
Unit 08a persists the planned receipt and the
schemas/tests for both phases; its tracker completion does not pretend any
version has been applied. Unit 08b proves `applied` on a disposable snapshot.
The later reviewed version PR persists the real applied receipt and records
both immutable digests in the Unit 08c tracker row before a protected publisher
can start.

A version PR may therefore contain both ordinary and AI changes without
creating a mixed release. Whether the ordinary child is non-empty or empty, an
ordinary-only dispatch must produce a tracker-acquired `final` receipt over the
complete dependency-cohort request before any AI candidate is built. The empty
case uses read-only `attest-existing` and records the empty child digest without
publishing. Sample-app AI receipts distinguish `published_targets` from the
complete `tested_dependency_cohort` and never republish ordinary UI
dependencies.

**Verification (08a):**

```shell
yarn build
yarn typecheck
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn changeset status --output dist/salt-release-plan/changeset-status.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind mcp-candidate-disposition-receipt --tracker plans/README.md --output dist/salt-release-plan/mcp-candidate-disposition.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind selected-graph-receipt --tracker plans/README.md --output dist/salt-release-plan/selected-graph.json
yarn materialize:salt-package-version-intent -- --plan 001 --from-unit 02 --through-unit 07 --tracker plans/README.md --selected-graph-receipt dist/salt-release-plan/selected-graph.json --output dist/salt-release-plan/package-version-intent.json
yarn partition:salt-release-plan -- --phase planned --selection-profile candidate --changeset-status dist/salt-release-plan/changeset-status.json --mcp-candidate-disposition-receipt dist/salt-release-plan/mcp-candidate-disposition.json --selected-graph-receipt dist/salt-release-plan/selected-graph.json --version-intent-receipt dist/salt-release-plan/package-version-intent.json --output dist/salt-release-plan/planned.json
yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/unit-08a.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-08a.json
```

**08a gate:** the selected package set, dependency graph, planned/applied
partition schemas, pack policy, and installed-consumer checks are deterministic
and disposition-bound; tests reject a missing selected-graph receipt, omitted
package, overlap, unpartitioned target, changed plan, wrong exact pin,
ordinary→AI dependency (including the hostile reverse-edge fixture), or
cross-mode publication request.

### 08b — Install the sole protected publication state machine

**Outcome:** one environment-protected, globally serialized publisher can
consume only receipt-allowlisted tarballs and immutable web artifacts; local
and PR workflows can exercise the complete fake-provider state machine but
cannot publish.

**Modify in 08b:**

- `.github/workflows/release.yml`
- new environment-protected `.github/workflows/publish-salt-ai.yml`
- `scripts/verifyPublishedSaltAiWeb.mjs`
- `scripts/verifyPublishedSaltAiProvenance.mjs`
- `scripts/promoteSaltAiDistTags.mjs`
- `scripts/promoteSaltAiWebPointer.mjs`
- `scripts/rollbackSaltAiRelease.mjs`
- `scripts/acquireSaltAiReleaseReceipt.mjs`
- `scripts/verifySaltAiReleaseReceipt.mjs`
- `scripts/runSaltAiReleaseTransition.mjs`
- `scripts/drillSaltAiReleaseRollback.mjs`
- `scripts/schemas/saltOrdinaryReleaseReceiptV1.schema.json`
- `scripts/resolveSaltOrdinaryDependencyEvidence.mjs`
- `scripts/planSaltOrdinaryDependencies.mjs`
- `scripts/schemas/saltOrdinaryDependencyRequestV1.schema.json`
- `scripts/schemas/saltOrdinaryDependencyEvidenceV1.schema.json`
- `scripts/schemas/saltAiReleaseReceiptV1.schema.json`
- `scripts/schemas/saltDocsReleaseReceiptV1.schema.json`
- `scripts/verifySaltAiVectorFreshness.mjs`
- `scripts/schemas/saltAiVectorFreshnessReceiptV1.schema.json`
- `scripts/runSaltAiCurrentMaintenance.mjs`, root command
  `release:salt:current-maintenance`, and
  `scripts/schemas/saltAiCurrentMaintenanceAuthorizationV1.schema.json`
- `scripts/renewSaltAiEvidenceRetention.mjs`
- `scripts/schemas/saltEvidenceArchiveRenewalReceiptV1.schema.json`
- `scripts/generateSaltAiVersionPr.mjs`, root command
  `generate:salt-ai:version-pr`,
  `tooling/ai/version-plan-selectors-v1.json`, and its closed selector schema
- workflow-policy, fake-registry/provider, provenance, CAS, and receipt-chain
  tests

**Single publication authority and state machine:** Unit 08b replaces rather
than supplements every remaining registry/deployment-writing path and removes
the temporary Unit 00a credentialed-publication embargo only as part of that
atomic replacement. A separate AI version-generation hold remains active:
ordinary main-push version-PR maintenance must exclude the Knowledge, CLI, and
optional MCP Changesets and cannot consume or rewrite them; once an active
registered AI release plan exists it must also exclude every ordinary
Changeset/package reserved by that plan. Unit 08b installs root command
`generate:salt-ai:version-pr` and a named operator-dispatched job with no
publication credential. The command accepts only an entry in a closed,
versioned selector registry that names exact plan/unit/active-partition kind,
partition schema, and any required authority-rebase kind. Every entry also has
a unique stable `selector_id`; the initial entry is
`plan-001-unit-08c` -> `001/08c/active-release-partition-planned`. Unknown,
ambiguous, inactive, duplicate-ID, or unregistered selectors fail. A later plan
may add its own exact selector only
in a reviewed, pre-fence implementation update. The job tracker-acquires the
selected partition and authority prerequisites, consumes the entire exact
partition, including its ordinary child when non-empty, and proves no planned
Changeset is missing or extra; later publication still
uses the mandatory ordinary-first and AI-second dispatch boundary. A
workflow-policy test covers every main push in the 08b-to-08c window and fails
on an automatic AI bump, overlap with an active reserved partition, an
unauthorized mixed version PR, missing/stale active plan, or credentialed
version job. The exact receipt-authorized mixed cohort is the sole exception.
Split all
Changesets version-PR maintenance from publication: neither path has
`id-token: write`, registry/deploy secret, environment binding, or publish
command. Preserve Unit 00a's removal of the credentialed `issue_comment`
PR-head snapshot publisher and fail workflow-policy tests if it returns; this
plan creates no GitHub Issues workflow. PR snapshots are uncredentialed CI
tarball artifacts only.
The sole npm/web publisher is an operator-dispatched job bound to one named
protected environment and an immutable approved tag, or a commit proven
reachable from the protected branch. A workflow policy test fails if any other
job combines repository-code checkout with npm/deploy credentials,
`id-token: write`, or a publish/deploy command.

The dispatcher exposes three closed, disjoint publication modes:

| Mode                | May publish                                                                                                                                                              | Must reject                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ORDINARY_RELEASE`  | Current non-AI Salt packages selected by the reviewed Changesets version PR                                                                                              | `@salt-ds/knowledge`, `@salt-ds/cli`, `@salt-ds/mcp`, AI web pointers, or an AI receipt                                                                                             |
| `SALT_AI_RELEASE`   | Knowledge, CLI, MCP only when final disposition is `ship`, and matching AI web                                                                                           | Every ordinary Salt package, MCP when final disposition is `omit`, or any mixed/unversioned cohort                                                                                  |
| `SALT_DOCS_RELEASE` | One receipt-selected, versioned full-site artifact plus the normal site deployment pointer for closed operations `deploy-ai-discovery` and `deploy-historical-discovery` | npm/package targets, TUF metadata, `/ai/v1/**`, `/ai/history/v1/**`, beta/current/root AI pointers, arbitrary paths, or a site artifact not bound to the live current-authority set |

All modes share the same state-machine implementation, repository-wide global
lock, target allowlist, journal, CAS discipline, and workflow-policy test.
`SALT_DOCS_RELEASE` may use the separately named normal-docs protected
environment, but its ref/source/artifact/readback checks are identical and its
credentials cannot reach npm or AI/TUF storage. Parent contracts are mode-
specific. `ORDINARY_RELEASE` and `SALT_AI_RELEASE` consume exactly one tracker-
acquired landed `applied` child from Unit 08c (or a later release plan), bound to
the active partition schema/planned receipt, and reject planned-only, snapshot-
only, unpartitioned, or cross-mode targets. `SALT_DOCS_RELEASE` rejects every
package partition and instead requires a tracker-acquired landed, source-bound
site candidate with non-null completion SHA, exact live current-authority
selector, navigation projection, prior negative-crawl parent, full route
inventory, and immutable-AI-web non-mutation receipt.

Unit 08b also implements `scripts/acquireSaltAiCurrentAuthority.mjs`,
`scripts/verifySaltAiCurrentAuthority.mjs`,
`scripts/verifySaltAiNegativeDiscoveryCrawl.mjs`, their selector/crawl receipt
schemas and registered authority/crawl evidence validators, and root commands
`acquire:salt-ai:current-authority`, `verify:salt-ai:current-authority`, and
`verify:salt-ai:negative-discovery-crawl`. Its closed crawl modes
`current-pre-navigation` and `historical-pre-navigation` perform a read-only
production crawl from a tracker-acquired activation parent plus the matching
live current-authority selector and record exact live site generation, routes,
links, hashes, and trusted time. Each mode has a frozen allowlist: the exact
activation-bound root/current AI pointers and immutable AI routes must exist and
match the selector/activation digests, while ordinary-site information
architecture, landing-page, install, support, and launch navigation must remain
absent. Missing or mismatched allowed AI routes, an extra AI route, or any
forbidden ordinary-site claim fails. Register
`pre-navigation-negative-crawl-receipt` in the applicable unit before either
docs candidate can be sealed. The receipt is immutable release evidence; a test
or unretained crawl log cannot substitute for it.

Unit 08b also adds `verify:salt-ai:vector-freshness` and installs an inert,
reusable `CURRENT_MAINTENANCE` coordinator for post-GA successor plans. This
launch plan authorizes no maintenance cohort. The coordinator refuses even
staging unless it receives a tracker-acquired
`saltAiCurrentMaintenanceAuthorizationV1` from a separately reviewed successor
plan naming its execution-unit namespace, exact current-authority selector,
fresh intent, planned and landed-applied partitions, final MCP/effective graph/
docs parents, evaluation gates, allowed targets, and supersession transition.
Given that authorization, it requires an exact-vector freshness receipt and
disjoint ordinary/AI children, prepares and verifies both immutable cohorts
without moving stable tags/pointers, then performs one globally locked guarded
activation across the authorized ordinary tags and new current AI tags/web
pointer. It cannot select package targets directly or bypass either child mode.
Tests cover missing/stale authorization, semantic and version-only bumps, an
unchanged vector, omitted family, stale current selector, failure between child
publications, and failure during each CAS; no affected-family stable tag may move
while the companion AI child is absent or unverified.
Publication is direct
`npm publish --provenance <receipt-allowlisted-tarball>` for each exact target;
the protected dispatcher never calls unfiltered `changeset publish`.

Retire the current root `release` script as a generally invokable publish path:
make it deterministic verification only or replace it with a clearly named
protected-workflow entry that validates the workflow-sealed candidate receipt
before direct allowlisted publication. The protected job owns credentials and
calls a publish step only after ref/environment checks. Contributor docs and CI
must not advertise a local registry-publish shortcut.

Every credentialed ordinary/AI/docs transition, drill, package publication, and web
promotion shares repository-wide concurrency group `salt-publication` with
`cancel-in-progress: false`; uncredentialed PR evidence does not take the
publisher lock. Unit 08b evolves `candidate:salt-ai:seal` and adds
root commands `acquire:salt-ai:release-receipt`,
`verify:salt-ai:release-receipt`, `release:salt:transition`, and
`release:drill:salt`. The last two refuse to run outside the mode's named
protected environment/workflow and accept a closed operation enum rather than
arbitrary tags, paths, or providers. Docs candidates validate against
`saltDocsReleaseReceiptV1` and bind the trusted source ref, exact current-
authority selector receipt, navigation projection, complete site artifact
inventory/digest, allowed deployment destination/generation, expected live
value, and immutable AI-web non-mutation proof. Its closed
`candidate→prepared→published→verified→activated→final` chain uploads the
versioned site artifact, CASes only the normal site pointer, reads/crawls it, and
guarded-restores only its own stale-safe pointer on failure.
The docs deploy adapter owns ordinary site HTML/assets and its versioned site
deployment pointer only. It strips or excludes `/llms.txt`, `/ai/**`, and every
AI-owned immutable/mutable object from its upload manifest; those URLs remain
owned by `SALT_AI_RELEASE` or Plan 002's historical extension. Route-overlap,
unexpected deletion, or a full-site host that cannot preserve that ownership
split is a STOP condition.

Unit 08b also adds `renew:salt-ai:evidence-retention`. The release/hosting owner
runs its monitor daily and renews at least 30 days before the earliest active-
closure expiry to a no-overwrite archive retained through the supported product
lifetime plus 180 days. It copies no authority by name: it consumes the exact
tracker index digest and selected artifact digests, reads back identical bytes,
emits `saltEvidenceArchiveRenewalReceiptV1`, and only then allows a plan-control
update to append renewal records and atomically revalidate the complete
four-entry current set. Unit 08b fake-provider tests rehearse normal renewal,
crash/resume, concurrent renewal, stale index, shorter expiry, partial set,
corrupt readback, one tick before the threshold, and already-expired rejection.

The release acquirer never selects by stage, state, or “current/latest” alone.
Its required schema-valid selector names exact plan/unit/evidence kind, stage,
state, cohort ID, and expected receipt SHA-256; it then resolves the one active
tracker-index entry and proves all fields agree. Callers may supply those exact
fields directly or use a reviewed selector object such as the Unit 09a cohort
descriptor. Ambiguous, superseded, expired-active, or selector/index-mismatched
receipts fail before download.

The frozen `R1_PRE_AGENT` output continues to validate only against
`saltAiCandidateReceiptV1` and is never a release-chain parent. Unit 08b's
`CI_RELEASE_COMPLETE` candidate and Unit 08c's `R2_BETA` candidate validate
against the `candidate` state of `saltAiReleaseReceiptV1`; stage and schema
cannot be relabelled or coerced.

`ORDINARY_RELEASE` has its own smaller closed receipt chain—`prepared`, optional
`published`, `verified`, optional `activated`, `rolled_back`, and `final`—validated by
`saltOrdinaryReleaseReceiptV1`. It binds the applied ordinary child digest,
source/ref, dependency-cohort request, exact package versions/tarballs, registry
integrities, provenance subjects or ratified immutable legacy attestations,
unique candidate tag when publishing, pre/post dist-tag CAS values, smoke
result, and parent receipt at every state. It has no web or AI fields. A
non-empty child uses `publish`/`activate`; an empty child uses the closed
read-only `attest-existing` operation and has no `published`/`activated` state or
tag mutation. Both produce a tracker-acquired `final` receipt and both may enter
the shared validation/final states; only the mutating non-empty branch may enter
`rolled_back` when multi-tag activation needs guarded compensation.

Before either operation, `plan:salt:ordinary-dependencies` derives the complete
exact ordinary dependency closure used by all sample apps and AI packages. The
ordinary final receipt enumerates every member: changed targets must match the
new child, while unchanged targets must match live registry integrity and
official provenance or the Unit 00a-approved immutable baseline attestation.
`resolve:salt:ordinary-dependency` requires that tracker-acquired final receipt
and a mutually exclusive `--changed-child` or `--empty-child` flag, then emits
one `saltOrdinaryDependencyEvidenceV1` whose complete tested cohort is equal to
the request. Every AI pack/smoke/seal command consumes this evidence; neither an
empty partition nor a partially published ordinary child can bypass dependency
identity checks.

Every protected attempt is one persisted, append-only receipt chain:

| State         | Required evidence                                                                                                                                                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `candidate`   | Source/ref, `release-complete@1` pack report, full app cohort, web artifact, 06b/06c receipts, Unit 07 recommendation/selected graph, and planned/applied partition; R2 additionally requires Unit 08c final MCP plus tracker-acquired ordinary final and complete dependency evidence |
| `prepared`    | Candidate digest, final version-applied package set, no pending Changesets, approval, expected npm/web values, and CAS generations                                                                                                                                                     |
| `published`   | Immutable package versions under a unique non-consumer tag plus immutable web/release-evidence uploads; no stable pointer mutation                                                                                                                                                     |
| `verified`    | Registry tarballs, provenance subjects, installed smoke, immutable web readback, and exact package/bundle/projection identity                                                                                                                                                          |
| `activated`   | Stage-allowed npm/web CAS mutations and immediate readback                                                                                                                                                                                                                             |
| `rolled_back` | Only for a failed transition or protected drill: guarded restoration, stale-rollback rejection, and unchanged out-of-stage targets                                                                                                                                                     |
| `final`       | Terminal outcome, active/restored values, all receipt/artifact locators and digests, and no unresolved journal                                                                                                                                                                         |

Each receipt validates against `saltAiReleaseReceiptV1`, carries
`receipt_state`, closed `release_stage`, `cohort_id`, attempt ID, source and
workflow/environment identities, exact package/bundle/web identities,
the Unit 07 recommendation/selected-graph and Unit 08c final MCP receipt
digests, disjoint `published_targets` and `tested_dependency_cohort`, parent
version-plan and applied selected-partition digests, tracker-acquired ordinary
final/dependency-evidence digests and empty/non-empty partition identity,
package lifecycle state,
`parent_receipt_digest` (null only for `candidate`), input receipt digests, and
before/after CAS state. State transitions reject a missing/wrong parent,
unlisted cross-stage parent, duplicate non-idempotent attempt, or identity
change. The only cross-stage edges are R2 `verified` as an immutable input to a
`PROTECTED_DRILL` chain and R2 `final` as the direct parent of R3 `activated`;
both require identical `cohort_id` and immutable identities. Local
`dist/salt-ai-release/<cohort-id>/...` paths are staging only. Before the next
transition, the workflow uploads each receipt to a content-addressed,
no-overwrite release-evidence path and a retention-pinned workflow artifact,
then records artifact ID/locator, platform artifact digest, and receipt SHA-256.
Resumption and Unit 09a reacquire by that immutable locator plus expected digest
and revalidate schema, parent chain, source, workflow, environment, and cohort;
they never trust a prior job's `dist` directory or a workflow URL alone.

Publication is crash-resumable per immutable target in every ordinary, AI, and
later historical mode. Before the first registry/web write, persist an
attempt-bound journal containing the allowlisted name/version or immutable path,
expected bytes/integrity/provenance subject, and state for every target. Under
the applied effective graph, package targets are cycle-free and journaled in one
deterministic dependency-first topological order—Knowledge before CLI and a
shipped MCP, and the equivalent order for the ordinary DAG. Cycles, dependant-
first order, or order drift from the applied receipt are a pre-write STOP. Under
the global lock, resume reconciles each target: absent means publish/upload;
present means independently read back and require the exact expected integrity,
bytes, repository, protected workflow/environment, source SHA, and provenance
subject before marking it idempotently complete; any mismatch is a terminal STOP.
Emit `published` only after every immutable target reconciles. A crash after one
SemVer publication never causes an unpublish or a new version guess: the partial
immutable versions remain and the same attempt must resume or be explicitly
abandoned with a terminal incident receipt. Mutable tag/pointer CAS actions are
journaled before and after each target; partial activation enters
`rolled_back`, restores only values still equal to the attempt's writes, reads
back compensation, and never overwrites newer state. `final` requires every
journal entry reconciled and no unresolved mutation. Fake-provider tests crash
at every per-target before/after boundary for `ORDINARY_RELEASE`,
`SALT_AI_RELEASE`, and the Plan 002 historical extension.

After Unit 08c's uncredentialed final-MCP and ordinary-partition preconditions,
the protected R2 `SALT_AI_RELEASE` workflow is one persisted cohort state
machine:

1. validate the immutable version-applied ref/SHA, applied AI partition, final
   MCP receipt, and complete ordinary dependency evidence; require no pending
   package Changesets; reacquire 06b/06c and Unit 07 recommendation/selected-
   graph receipts, then build/gate/pack once against the verified ordinary
   registry cohort;
2. require an effective-disposition-matching `release-complete@1` report,
   build/verify the web artifact, seal/persist `candidate` then `prepared`
   receipts, and complete all expensive deterministic checks with no lock held;
3. verify environment approval, acquire the global lock, re-read the immutable
   source ref, tracker/index digest, ordinary registry cohort, target existence,
   tag/pointer generations, and candidate identities, and require them to equal
   the prepared receipt before creating the attempt journal;
4. publish the final immutable SemVer versions for the effective selected AI
   package set in the receipt-bound dependency-first topological order under a unique
   non-consumer candidate dist-tag with requested npm provenance, without
   moving stable tags, upload immutable web bytes, and persist `published`;
5. retrieve registry tarballs and attestations with bounded retry; verify exact
   name/version/integrity plus official provenance, expected repository,
   protected workflow/environment, ref/SHA, and tarball subject digest;
   install/smoke those exact bytes, read back web bytes, and persist `verified`;
6. run the protected rollback drill below, then compare-and-swap only R2 npm
   tags and web pointers;
7. read back every mutable identity and persist `activated` and `final`, then
   release the lock. A candidate/freshness mismatch returns to step 1 rather than
   rebuilding inside the critical section.

Within `SALT_AI_RELEASE`, the requested stage selects a closed mutable-target
allowlist; workflow input cannot supply arbitrary tags or paths:

| Stage                 | Npm target after verification                                                                          | Web target after immutable readback                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `CI_RELEASE_COMPLETE` | none; retained tarball/candidate evidence only                                                         | none                                                                                   |
| `R2_BETA`             | final immutable versions are first published under a unique candidate tag, then CAS-promoted to `next` | `/ai/channels/beta/` and `/ai/beta/llms.txt`; never `/ai/current/` or root `/llms.txt` |
| `R3_GA`               | CAS-only promotion of the exact verified R2 versions to `latest`/ratified stable tags                  | CAS-only promotion of the exact R2 digest to `/ai/current/` and root `/llms.txt`       |
| `PROTECTED_DRILL`     | dedicated per-cohort drill tag only; no `next`/stable access                                           | dedicated per-cohort drill pointer only; no beta/current/root pointer access           |

R2 publishes the final version numbers and immutable bytes that the pilot will
evaluate. R3 does not run Changesets, publish a package version, upload new AI
bytes, or change `bundle_version`; it reacquires the exact retained R2 `final`
receipt and performs stable CAS activation only. Any package, manifest,
bundle, rule, Skill/AGENTS, or immutable web byte/version change invalidates
the R2 chain and enters the separately reviewed successor-plan procedure below;
that successor must own any replacement publication, smoke, drill, pilot, and
evaluation before R3. Tests prove an R2 dispatch cannot read/write the R3
target set and rollback is scoped to the same stage. Immutable digest assets
may be shared; mutable beta and GA pointers/tags never alias.

The publisher rejects any `pre-agent-support` report, `publishable: false`
receipt, missing `agent_support` descriptor/bytes, or Unit 05 `R1_PRE_AGENT`
identity. The release receipt carries the `release-complete@1` policy ID/digest,
hashes of the tracker-acquired 06b/06c migration-receipt bytes, Unit 07
recommendation and selected-graph receipts, Unit 08c final MCP receipt, applied
partition receipt, and tracker-acquired ordinary final plus complete dependency
evidence so the final bundle's
source-authority transition and selected package graph are auditable.

`NPM_CONFIG_PROVENANCE=true` requests an attestation; it is never proof that one
exists or is correct. Missing, unverifiable, or mismatched provenance blocks
all stable promotion. The post-publication receipt records attestation identity
and verified subjects for every package.

Before each dist-tag/pointer mutation, record the expected previous value and
provider generation/ETag. Web promotion and rollback use provider CAS. Npm
promotion runs under the sole-writer lock, re-reads each expected tag
immediately before mutation, aborts on mismatch, and verifies afterward. If
exclusive tag ownership cannot be enforced, STOP. A rollback restores only a
tag/pointer that still equals this cohort's proposed value; a stale rollback is
a required failure and must not overwrite a newer cohort. Immutable package
versions and digest assets are never removed or rewritten.

**Root build/release order:**

1. Build knowledge and its bundle once.
2. Build CLI, MCP only when the current candidate/effective graph selects it, and other
   workspaces topologically; build CSS.
3. Run root and AI-tooling typechecks.
4. Run AI unit, schema, integrity, architecture, and determinism tests, plus
   MCP protocol tests only when selected.
5. Measure knowledge and CLI package/surface budgets, plus MCP when selected.
6. Dry-pack the selected two or three AI packages and close the full sample-app
   first-party Salt dependency cohort in one receipt.
7. Install every selected AI tarball in an isolated consumer and replay
   `npm ci`.
8. Exercise offline CLI workflows and, only when selected, MCP workflows, then
   verify the public sample-app matrix against the same tested Salt cohort.
9. Build/verify the full site and immutable AI web artifact from the same
   knowledge bytes.
10. Complete the deterministic release gate. Publication is a separate
    environment-approved operator action described below.

Rename `release:verify:mcp` and `release:verify:mcp:after-build` to
`release:verify:ai-tooling` and
`release:verify:ai-tooling:after-build`. Characterize the exact order in an AI
release test. The old names are internal and unreleased, so remove them without
transition aliases.

Complete and lock down the package-specific contracts introduced in 02/04:

| Package   | Required                                                                                                                                | Forbidden                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| knowledge | manifest/version agreement, selected generated artifacts, schemas, CJS/ESM/types, exact budgets                                         | bin, MCP SDK, unlisted files, executable/install scripts                     |
| CLI       | `salt-ds`; command and `-h`/`--help`/`--version` forms; CJS/ESM/types; exact knowledge dependency; small package                        | bundle copy, MCP SDK, Storybook, workspace/deep-source paths                 |
| MCP       | only when `ship`: `salt-mcp`, `createSaltMcpServer`, one options type, exact knowledge dependency, ratified three-tool/resource surface | bundle/compiler copy, CLI dependency, Storybook, workspace/deep-source paths |

The baseline blanket Markdown prohibition in
`scripts/checkAiToolingPackageDryRun.mjs:1112-1115` becomes a rule allowing only
manifest-selected knowledge Markdown. CLI and any shipped MCP still contain no
copied knowledge Markdown.

Pack the graph-selected AI package set before installing because an
unpublished exact knowledge dependency cannot be resolved from the registry.
Assert:

- `npm install` and lockfile-replayed `npm ci` both succeed;
- installed packages are copies, not workspace links, and `npm ls` is clean;
- CJS, ESM, declarations, selected binaries, root exports, and engine floors
  work;
- packed CLI flag aliases match command bytes/exit semantics; if selected,
  packed MCP CJS/ESM expose its factory and a consumer TypeScript fixture
  compiles the one options type;
- CLI and, when selected, MCP load the same knowledge version and
  bundle/semantic digests for their exact-pinned release;
- valid, invalid, non-Salt, nested-workspace, path-boundary, and no-network
  fixtures behave as contracted;
- Node 22 and 24 pass on Linux, with Windows coverage for CLI filesystem,
  wrapper, quoting, separator, CRLF, junction, and SARIF behavior.
- the candidate-cohort receipt closes every first-party dependency reached by
  all sample apps. Local rehearsals allow no workspace or registry fallback and
  use packed ordinary+AI tarballs. Protected R2 instead resolves ordinary Salt
  packages only from the verified `ORDINARY_RELEASE` final receipt and uses
  local prepublication tarballs for AI packages; every registry integrity must
  equal that receipt, and any unlisted registry/workspace edge fails.

Run a snapshot version/release rehearsal before the first beta and prove
Changesets updates CLI and the selected MCP exact dependant whenever knowledge
changes. Verify the earlier split of `.changeset/quiet-catalogs-search.md`:
valid ordinary-package bumps/notes remain in the ordinary partition, while the
prototype MCP major/compatibility prose is absent and any shipped MCP has only
its reviewed initial-minor entry.
Do not hand-edit built package versions.

**Verification (08b):**

```shell
yarn build
yarn typecheck
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/unit-08b.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-08b.json
yarn check:salt-sample-apps -- --receipt dist/salt-ai-pack/unit-08b-app-cohort.json
yarn build:salt-ai-web
yarn check:salt-docs-authoring -- --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web
yarn workspace @salt-ds/site build
yarn acquire:salt-ai:evidence -- --unit 06b --kind migration-receipt --tracker plans/README.md --output dist/salt-ai-release/input/06b-receipt.json
yarn acquire:salt-ai:evidence -- --unit 06c --kind migration-receipt --tracker plans/README.md --output dist/salt-ai-release/input/06c-receipt.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind mcp-candidate-disposition-receipt --tracker plans/README.md --output dist/salt-ai-release/input/mcp-candidate-disposition.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/input/selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 08a --kind release-partition-planned --tracker plans/README.md --output dist/salt-ai-release/input/release-partition-planned.json
yarn candidate:salt-ai:seal -- --stage CI_RELEASE_COMPLETE --pack-report dist/salt-ai-pack/unit-08b.json --app-cohort-receipt dist/salt-ai-pack/unit-08b-app-cohort.json --web-receipt dist/salt-ai-web/release-receipt.json --migration-receipt dist/salt-ai-release/input/06b-receipt.json --migration-receipt dist/salt-ai-release/input/06c-receipt.json --mcp-candidate-disposition-receipt dist/salt-ai-release/input/mcp-candidate-disposition.json --selected-graph-receipt dist/salt-ai-release/input/selected-graph.json --release-partition-receipt dist/salt-ai-release/input/release-partition-planned.json --output dist/salt-ai-release/unit-08b/candidate-receipt.json
yarn verify:salt-ai:release-receipt -- --state candidate --stage CI_RELEASE_COMPLETE --receipt dist/salt-ai-release/unit-08b/candidate-receipt.json
yarn release:verify:ai-tooling:after-build
```

Deterministic snapshot rehearsal in an approved disposable branch/environment:

```shell
yarn acquire:salt-ai:evidence -- --unit 07 --kind mcp-candidate-disposition-receipt --tracker plans/README.md --output dist/salt-ai-release/snapshot/input/mcp-candidate-disposition.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/snapshot/input/selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 08a --kind cumulative-package-version-intent-receipt --tracker plans/README.md --output dist/salt-ai-release/snapshot/input/package-version-intent.json
yarn changeset status --output dist/salt-ai-release/snapshot/changeset-status.json
yarn partition:salt-release-plan -- --phase planned --selection-profile candidate --version-mode snapshot --snapshot-tag snapshot --changeset-status dist/salt-ai-release/snapshot/changeset-status.json --mcp-candidate-disposition-receipt dist/salt-ai-release/snapshot/input/mcp-candidate-disposition.json --selected-graph-receipt dist/salt-ai-release/snapshot/input/selected-graph.json --version-intent-receipt dist/salt-ai-release/snapshot/input/package-version-intent.json --output dist/salt-ai-release/snapshot/partition-planned.json
yarn changeset version --snapshot snapshot
yarn partition:salt-release-plan -- --phase applied --planned-receipt dist/salt-ai-release/snapshot/partition-planned.json --output dist/salt-ai-release/snapshot/partition-applied.json
yarn build
yarn check:ai-tooling:pack -- --report dist/salt-ai-release/snapshot/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-release/snapshot/pack-report.json
yarn check:salt-sample-apps -- --receipt dist/salt-ai-release/snapshot/app-cohort-receipt.json
yarn build:salt-ai-web
yarn verify:salt-ai-web
yarn acquire:salt-ai:evidence -- --unit 06b --kind migration-receipt --tracker plans/README.md --output dist/salt-ai-release/snapshot/input/06b-receipt.json
yarn acquire:salt-ai:evidence -- --unit 06c --kind migration-receipt --tracker plans/README.md --output dist/salt-ai-release/snapshot/input/06c-receipt.json
yarn candidate:salt-ai:seal -- --stage CI_RELEASE_COMPLETE --pack-report dist/salt-ai-release/snapshot/pack-report.json --app-cohort-receipt dist/salt-ai-release/snapshot/app-cohort-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --migration-receipt dist/salt-ai-release/snapshot/input/06b-receipt.json --migration-receipt dist/salt-ai-release/snapshot/input/06c-receipt.json --mcp-candidate-disposition-receipt dist/salt-ai-release/snapshot/input/mcp-candidate-disposition.json --selected-graph-receipt dist/salt-ai-release/snapshot/input/selected-graph.json --release-partition-receipt dist/salt-ai-release/snapshot/partition-applied.json --output dist/salt-ai-release/snapshot/candidate-receipt.json
yarn release:verify:ai-tooling:after-build
```

This rehearsal mutates package metadata but does not publish or contact the
registry. Discard only the disposable branch/environment through the normal
approved workflow; never reset a developer's worktree.

Expected PR/rehearsal result: every command exits 0; the workflow-policy test
finds exactly one environment-bound publication authority and zero credentialed
PR-head/main-maintenance publishers; the candidate receipt closes the complete
Salt package graph; local fake-registry/provider tests verify provenance
subjects, global serialization, promotion readback, and require stale npm/web
rollback attempts to leave newer state byte-identical. Network-dependent live
receipts are required only for the later protected R2/R3 operator dispatch. CI
retains the `CI_RELEASE_COMPLETE` candidate by immutable artifact locator plus
digest for the tracker, but that diagnostic receipt cannot parent an R2/R3
transition; protected R2 independently rebuilds and seals its own candidate.

**08b gate:** workflow-policy and fake-provider tests prove one direct,
allowlisted publisher, disjoint ordinary/AI targets, both receipt schemas,
global serialization, provenance verification, immediate readback, CAS-safe
activation/rollback, and stale-attempt rejection. The planned partition and
snapshot-applied proof are tracker-bound; this subunit publishes nothing.

### 08c — Apply final versions, confirm MCP, and publish R2

**Outcome:** public schemas and commands are frozen, the final version-applied
two- or three-package graph has independently re-earned its MCP disposition,
ordinary dependencies (if any) and AI packages are published in the correct
order, and the exact beta npm/web cohort has a complete retained receipt chain.

Extend the selected-graph verifier with root command
`rebind:salt-ai:selected-graph`. Its landed-only mode proves the premerge graph,
applied partition, packed package/version/dependency identities, and semantic
selection are byte-identical, then emits a distinct completion-SHA-bound landed
receipt; copying the premerge receipt or changing only its index metadata fails.

Before any job receives npm, OIDC, or deployment credentials:

First merge one bounded Unit-08c release-tooling implementation PR that adds
the selected-graph terminal-to-premerge and landed rebinds, omit-replan
authorization, terminal-graph
audit kind, package-namespace release verifier, and every schema/validator used
below. A plan-control update records that implementation SHA while leaving 08c
`IN PROGRESS — version/R2 pending`; it publishes nothing and contains no
generated version change. Every subsequent active-plan, cleanup, generated
version, landed-rebind, and protected-dispatch ref must descend from that exact
implementation ref.

1. Ratify the public Knowledge, CLI, scan/result, Skill/AGENTS, web-route, and
   optional MCP schemas and command names. A later change requires a new
   versioned R2 cohort; published beta bytes are never mutated in place.
2. On the latest immutable default-branch ref containing completed 08a and 08b
   plus the tracker-recorded Unit-08c implementation ref,
   rerun the `candidate` planned phase and tracker-bind it as Unit 08c's active
   plan. Unit 08a's differently named, source-bound planning receipt remains an
   immutable audit parent; Unit 08c revalidates and replaces it as release
   authority without lifecycle-superseding a cross-unit or cross-kind receipt.
   Same-kind supersession is reserved for replacement generations of Unit
   08c's active plan. Only after the active plan is tracker-bound, invoke the
   receipt-gated AI version-PR path and do not merge its reviewed Changesets PR
   yet. Generate it from that same post-implementation base. On the candidate ref,
   reacquire the active plan, run `applied`, and prove there are no pending
   Changesets. This uses proposed final stable versions, not snapshot SemVer.
3. Rebuild all receipt-selected local tarballs, sample apps, and web bytes from
   that version-PR ref. On the normal candidate profile, if Unit 07 recommended
   `omit`, prove MCP is absent and record final `omit`; if it recommended `ship`,
   run the complete frozen mode-3/mode-4 comparison for
   every MCP-applicable cell in the full 12–15-task corpus, including every
   repetition and host/model condition, against these exact final-version
   tarballs and rerun all outcome, non-regression, host, security, setup-cost,
   and surface gates. This is the decisive MCP go/no-go, not a sample that Unit
   09 is expected to reverse. A `final` cleanup profile follows the distinct
   rebind path in step 5 and does not try to execute a deleted adapter.
4. Emit `mcpFinalDispositionV1` with the Unit 07 recommendation and candidate
   artifact digests, final tarball/package/vector/spec/SDK identities, complete
   cell and security receipts, threshold results, `mcp_final_disposition`, and
   an effective selected-graph digest. Allowed transitions are only
   `omit→omit`, `ship→ship`, or `ship→omit`; `omit→ship` and missing evidence
   fail closed.
5. If a provisional `ship` becomes `omit`, do not merge the candidate version
   PR and expose no credentials. Return to its unchanged post-08b pre-version
   base, land
   a normal reviewed cleanup PR that deletes the unreleased MCP workspace and
   its still-unconsumed initial Changeset, docs, metadata, binary, and build/
   pack/release entries. Retain that terminal final-omit receipt and seal an
   immutable `release-partition-replan-authorization-receipt` while the old
   active plan is still acquirable. The receipt is a distinct audit kind—not a
   cross-kind lifecycle alias—and binds the old planned partition, terminal
   final-omit disposition, effective graph, unchanged Knowledge/CLI identities,
   cancelled-unreleased MCP identity, and cleanup completion SHA. Then run the
   `final` planned profile with the final-disposition/effective-graph receipts
   plus that authorization as `--supersedes-receipt`; this is the only path that may
   replace the provisional three-package child with a two-package child. Review
   the new plan and version PR from that base. On the two-package version ref,
   `verify:salt-ai:mcp-final --rebind-omit` proves Knowledge/CLI proposed
   versions and bytes equal the terminal omit receipt, every MCP/Changeset/doc/
   metadata surface is absent, and the effective graph/partition is exactly two
   packages; it then emits a source-rebound final-omit receipt without mode 4.
   From that landed cleanup ref, run the version-intent materializer in its
   closed `final-omit-supersession` mode. The successor receipt must parent the
   Unit 08a intent and terminal omit/effective-graph receipts, preserve the
   Knowledge/CLI entries byte-for-byte, mark only the never-published MCP entry
   `cancelled_unreleased`, and prove the MCP Changeset is absent. Tracker-bind
   the cleanup graph separately as the immutable audit kind
   `terminal-effective-selected-graph-receipt`, and tracker-bind the intent
   successor before the final partition is created; a disposition alone cannot
   silently discard an active intent. The terminal graph kind is never the
   landed graph authority and never participates in the registered
   premerge-to-landed retirement pair.
   Any Knowledge/CLI content delta invalidates the rebind and returns to the
   retained pre-cleanup candidate ref for a fresh full decision. No alias,
   migration, or compatibility code is added; Plan 001a's protected registry
   cleanup remains mandatory and receipt-bound.
6. Only after final `ship` or a clean `omit` graph passes, merge the exact
   version PR. Re-run `applied` on the landed immutable ref and require its
   package names, versions, tarball/content digests, web digest, partition
   digests, and effective graph to equal the premerge evidence. Persist the real
   landed applied receipt; source-only merge metadata may differ, but any
   release-content delta invalidates the final MCP receipt and restarts this
   gate.

The normal post-08b active plan is created before the version PR with:

```shell
yarn acquire:salt-ai:evidence -- --unit 07 --kind mcp-candidate-disposition-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-plan/mcp-candidate-disposition.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-plan/provisional-selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 08a --kind cumulative-package-version-intent-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-plan/package-version-intent.json
yarn changeset status --output dist/salt-ai-release/r2-plan/changeset-status.json
yarn partition:salt-release-plan -- --phase planned --selection-profile candidate --changeset-status dist/salt-ai-release/r2-plan/changeset-status.json --mcp-candidate-disposition-receipt dist/salt-ai-release/r2-plan/mcp-candidate-disposition.json --selected-graph-receipt dist/salt-ai-release/r2-plan/provisional-selected-graph.json --version-intent-receipt dist/salt-ai-release/r2-plan/package-version-intent.json --output dist/salt-ai-release/r2-plan/partition-planned.json
```

After that partition is tracker-bound as the active Unit-08c plan, generate its
version PR with the exact registry ID:

```shell
yarn generate:salt-ai:version-pr -- --selector-id plan-001-unit-08c --tracker plans/README.md
```

The downgrade replan is explicit and mutually exclusive with candidate inputs.
On the landed cleanup ref, acquire the still-active old plan and seal the
independent authorization before the replacement plan supersedes it:

```shell
yarn acquire:salt-ai:evidence -- --unit 08c --kind terminal-mcp-final-omit-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-replan/mcp-final-disposition.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind terminal-effective-selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-replan/effective-selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind active-release-partition-planned --tracker plans/README.md --output dist/salt-ai-release/r2-replan/old-partition-planned.json
yarn acquire:salt-ai:evidence -- --unit 08a --kind cumulative-package-version-intent-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-replan/superseded-package-version-intent.json
yarn seal:salt-release-partition-replan -- --old-planned-receipt dist/salt-ai-release/r2-replan/old-partition-planned.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-replan/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-release/r2-replan/effective-selected-graph.json --cleanup-completion-sha $GITHUB_SHA --output dist/salt-ai-release/r2-replan/partition-replan-authorization-receipt.json
yarn materialize:salt-package-version-intent -- --plan 001 --mode final-omit-supersession --supersedes-intent-receipt dist/salt-ai-release/r2-replan/superseded-package-version-intent.json --partition-replan-authorization-receipt dist/salt-ai-release/r2-replan/partition-replan-authorization-receipt.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-replan/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-release/r2-replan/effective-selected-graph.json --output dist/salt-ai-release/r2-replan/package-version-intent.json
```

Persist the authorization and intent successor at immutable locators and land
their distinct Unit 08c tracker entries. A new clean job then reacquires every
input and creates the final plan:

```shell
yarn acquire:salt-ai:evidence -- --unit 08c --kind terminal-mcp-final-omit-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-final-plan/mcp-final-disposition.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind terminal-effective-selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-final-plan/effective-selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind release-partition-replan-authorization-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-final-plan/partition-replan-authorization-receipt.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind final-package-version-intent-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-final-plan/package-version-intent.json
yarn changeset status --output dist/salt-ai-release/r2-final-plan/changeset-status.json
yarn partition:salt-release-plan -- --phase planned --selection-profile final --changeset-status dist/salt-ai-release/r2-final-plan/changeset-status.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-final-plan/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-release/r2-final-plan/effective-selected-graph.json --version-intent-receipt dist/salt-ai-release/r2-final-plan/package-version-intent.json --supersedes-receipt dist/salt-ai-release/r2-final-plan/partition-replan-authorization-receipt.json --output dist/salt-ai-release/r2-final-plan/partition-planned.json
```

The `seal:salt-release-partition-replan` implementation and
`saltReleasePartitionReplanAuthorizationV1` schema are added with the other
Unit-08c release contracts. The authorization and
`terminal-effective-selected-graph-receipt` are registered as distinct,
immutable non-lifecycle evidence kinds. The tracker transaction then same-kind supersedes the old active planned
partition with the final planned partition; audit consumers use the independent
authorization receipt rather than trying to acquire old bytes through a
fabricated `superseded-*` kind. The second job persists and tracker-binds the
final planned partition. Tests
reject cancellation under candidate/effective profiles,
any cancellation after MCP publication, any non-MCP cancellation, a changed
Knowledge/CLI entry, or reuse of the superseded intent in a later partition.

The prepublication job persists the active version-intent and landed applied
partition, final MCP, effective selected-graph, effective package-doc, and
ordinary dependency-request receipts at content-addressed immutable locators. A
plan-control update records their digests before the protected job can acquire
them; local `dist` paths or a successful workflow URL are insufficient.

Only after the effective graph and final MCP receipt are immutable may the
protected environment be entered. The landed prepublication job derives and
tracker-binds the complete ordinary dependency-cohort request. Dispatch
`ORDINARY_RELEASE` first in both cases: publish/activate a non-empty child, or
run the read-only `attest-existing` operation for an empty child. Tracker-bind
its complete-cohort `final` receipt, then rebuild the AI candidate against those
exact registry identities. Any mismatch aborts before an AI package or web byte
is published.

**Operator-triggered R2 beta/npm and web release:**

- An execution-unit branch never publishes. After Unit 08b is reviewed and
  merged, the Changesets version PR applies the final package versions and
  lands an immutable approved ref with no pending package Changesets. After the
  uncredentialed final-MCP gate above, an operator may dispatch the sole
  protected workflow for ordinary publication when needed and then R2. It
  rebuilds that ref, reruns the deterministic gate, publishes receipt-allowlisted
  final versions under unique candidate tags, verifies registry provenance and
  exact installed bytes, runs the protected drill, then performs guarded R2
  npm/web CAS. R3 is a later CAS-only activation of this exact cohort after Unit
  09; no legacy `yarn release` path may bypass it.
- There is no execution-unit-branch exception. The environment-approved
  workflow is a separate operator action from the merged trusted ref, has
  least-privilege credentials, and produces an auditable release receipt.

The prepublication job runs the first block without secrets. Protected work is
split by an auditable tracker boundary for every ordinary child. One ordinary-
only dispatch either publishes/activates a non-empty child or attests the exact
existing cohort for an empty child, persists its immutable final receipt, and
stops. A plan-control update records its locator/digest; only a later AI
dispatch may reacquire it. The resolver then requires the matching
`--changed-child` or `--empty-child` branch and emits normalized complete-cohort
evidence. No same-job local receipt can authorize AI publication.

The normal candidate-profile version PR runs this uncredentialed block. It is
not valid for a `ship→omit` cleanup ref:

```shell
yarn acquire:salt-ai:evidence -- --unit 08c --kind active-release-partition-planned --tracker plans/README.md --output dist/salt-ai-release/r2-candidate/input/partition-planned.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind mcp-candidate-disposition-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-candidate/input/mcp-candidate-disposition.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-candidate/input/provisional-selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 06d --kind public-docs-preview-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-candidate/input/public-docs-preview.json
yarn partition:salt-release-plan -- --phase applied --planned-receipt dist/salt-ai-release/r2-candidate/input/partition-planned.json --output dist/salt-ai-release/r2-candidate/partition-applied-premerge.json
yarn build
yarn typecheck
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --selected-graph-receipt dist/salt-ai-release/r2-candidate/input/provisional-selected-graph.json --report dist/salt-ai-release/r2-candidate/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-release/r2-candidate/pack-report.json
yarn check:salt-sample-apps -- --receipt dist/salt-ai-release/r2-candidate/app-cohort-receipt.json
yarn build:salt-ai-web
yarn check:salt-docs-authoring -- --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web
yarn workspace @salt-ds/site build
yarn eval:salt-ai:mcp-final -- --candidate-disposition-receipt dist/salt-ai-release/r2-candidate/input/mcp-candidate-disposition.json --selected-graph-receipt dist/salt-ai-release/r2-candidate/input/provisional-selected-graph.json --release-partition-receipt dist/salt-ai-release/r2-candidate/partition-applied-premerge.json --pack-report dist/salt-ai-release/r2-candidate/pack-report.json --app-cohort-receipt dist/salt-ai-release/r2-candidate/app-cohort-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --effective-selected-graph-output dist/salt-ai-release/r2-candidate/effective-selected-graph.json --output dist/salt-ai-release/r2-candidate/mcp-final-premerge.json
yarn verify:salt-ai:mcp-final -- --receipt dist/salt-ai-release/r2-candidate/mcp-final-premerge.json
yarn project:salt-ai:public-docs -- --mode final --preview-receipt dist/salt-ai-release/r2-candidate/input/public-docs-preview.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-candidate/mcp-final-premerge.json --effective-selected-graph-receipt dist/salt-ai-release/r2-candidate/effective-selected-graph.json --web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-release/r2-candidate/public-docs-final.json
yarn verify:salt-ai-web -- --final-public-docs-receipt dist/salt-ai-release/r2-candidate/public-docs-final.json
yarn seal:salt-public-package-docs -- --mode final --inventory tooling/ai/public-package-docs-v1.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-candidate/mcp-final-premerge.json --effective-selected-graph-receipt dist/salt-ai-release/r2-candidate/effective-selected-graph.json --public-docs-receipt dist/salt-ai-release/r2-candidate/public-docs-final.json --pack-report dist/salt-ai-release/r2-candidate/pack-report.json --output dist/salt-ai-release/r2-candidate/package-docs-premerge.json
```

If and only if this emits `ship→omit`, do not merge. After the cleanup and
replacement version PR, run this mutually exclusive final-profile block:

```shell
yarn acquire:salt-ai:evidence -- --unit 08c --kind active-release-partition-planned --tracker plans/README.md --output dist/salt-ai-release/r2-final/input/partition-planned.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind terminal-mcp-final-omit-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-final/input/terminal-mcp-final-omit.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind terminal-effective-selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-final/input/terminal-effective-selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind release-partition-replan-authorization-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-final/input/partition-replan-authorization-receipt.json
yarn acquire:salt-ai:evidence -- --unit 06d --kind public-docs-preview-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-final/input/public-docs-preview.json
yarn partition:salt-release-plan -- --phase applied --planned-receipt dist/salt-ai-release/r2-final/input/partition-planned.json --output dist/salt-ai-release/r2-final/partition-applied-premerge.json
yarn build
yarn typecheck
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --effective-selected-graph-receipt dist/salt-ai-release/r2-final/input/terminal-effective-selected-graph.json --report dist/salt-ai-release/r2-final/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-release/r2-final/pack-report.json
yarn rebind:salt-ai:selected-graph -- --mode terminal-to-premerge --terminal-receipt dist/salt-ai-release/r2-final/input/terminal-effective-selected-graph.json --release-partition-receipt dist/salt-ai-release/r2-final/partition-applied-premerge.json --pack-report dist/salt-ai-release/r2-final/pack-report.json --source-ref HEAD --output dist/salt-ai-release/r2-final/effective-selected-graph-premerge.json
yarn check:salt-sample-apps -- --receipt dist/salt-ai-release/r2-final/app-cohort-receipt.json
yarn build:salt-ai-web
yarn check:salt-docs-authoring -- --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web
yarn workspace @salt-ds/site build
yarn verify:salt-ai:mcp-final -- --rebind-omit --terminal-omit-receipt dist/salt-ai-release/r2-final/input/terminal-mcp-final-omit.json --partition-replan-authorization-receipt dist/salt-ai-release/r2-final/input/partition-replan-authorization-receipt.json --effective-selected-graph-receipt dist/salt-ai-release/r2-final/effective-selected-graph-premerge.json --release-partition-receipt dist/salt-ai-release/r2-final/partition-applied-premerge.json --pack-report dist/salt-ai-release/r2-final/pack-report.json --app-cohort-receipt dist/salt-ai-release/r2-final/app-cohort-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-release/r2-final/mcp-final-premerge.json
yarn project:salt-ai:public-docs -- --mode final --preview-receipt dist/salt-ai-release/r2-final/input/public-docs-preview.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-final/mcp-final-premerge.json --effective-selected-graph-receipt dist/salt-ai-release/r2-final/effective-selected-graph-premerge.json --web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-release/r2-final/public-docs-final.json
yarn verify:salt-ai-web -- --final-public-docs-receipt dist/salt-ai-release/r2-final/public-docs-final.json
yarn seal:salt-public-package-docs -- --mode final --inventory tooling/ai/public-package-docs-v1.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-final/mcp-final-premerge.json --effective-selected-graph-receipt dist/salt-ai-release/r2-final/effective-selected-graph-premerge.json --public-docs-receipt dist/salt-ai-release/r2-final/public-docs-final.json --pack-report dist/salt-ai-release/r2-final/pack-report.json --output dist/salt-ai-release/r2-final/package-docs-premerge.json
```

The `terminal-to-premerge` mode preserves the terminal audit graph's semantic
package set and digests but emits a distinct replacement-version-ref,
partition, and pack-bound premerge receipt. Registering the terminal audit
receipt directly as the premerge kind, changing graph semantics, or omitting
the source binding fails.

Persist the selected block's premerge applied, MCP-final, effective-graph,
public-docs, package-docs, pack, app, and web receipts at immutable locators and tracker-bind
their hashes before merging its version PR. On the landed ref, a clean job
reacquires them, reruns build/typecheck/tests/pack/smoke/apps/web/docs/site
against the effective graph, and runs:

```shell
yarn acquire:salt-ai:evidence -- --unit 06d --kind public-docs-preview-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/public-docs-preview.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind active-release-partition-planned --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/partition-planned.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind release-partition-applied-premerge --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/partition-applied-premerge.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind mcp-final-disposition-premerge-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/mcp-final-premerge.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind effective-selected-graph-premerge-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/effective-selected-graph-premerge.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind public-docs-final-premerge-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/public-docs-final-premerge.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind effective-public-package-docs-premerge-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/package-docs-premerge.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind pack-report-premerge --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/pack-report-premerge.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind app-cohort-premerge-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/app-cohort-premerge.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind web-release-premerge-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/web-release-premerge.json
yarn build
yarn typecheck
yarn typecheck:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --effective-selected-graph-receipt dist/salt-ai-release/r2-landed/input/effective-selected-graph-premerge.json --expected-report dist/salt-ai-release/r2-landed/input/pack-report-premerge.json --report dist/salt-ai-release/r2-landed/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-release/r2-landed/pack-report.json
yarn check:salt-sample-apps -- --expected-receipt dist/salt-ai-release/r2-landed/input/app-cohort-premerge.json --receipt dist/salt-ai-release/r2-landed/app-cohort-receipt.json
yarn build:salt-ai-web
yarn check:salt-docs-authoring -- --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --expected-web-receipt dist/salt-ai-release/r2-landed/input/web-release-premerge.json
yarn workspace @salt-ds/site build
yarn partition:salt-release-plan -- --phase applied --planned-receipt dist/salt-ai-release/r2-landed/input/partition-planned.json --expected-applied-receipt dist/salt-ai-release/r2-landed/input/partition-applied-premerge.json --output dist/salt-ai-release/r2-landed/partition-applied.json
yarn rebind:salt-ai:selected-graph -- --premerge-receipt dist/salt-ai-release/r2-landed/input/effective-selected-graph-premerge.json --release-partition-receipt dist/salt-ai-release/r2-landed/partition-applied.json --pack-report dist/salt-ai-release/r2-landed/pack-report.json --completion-sha HEAD --output dist/salt-ai-release/r2-landed/effective-selected-graph.json
yarn project:salt-ai:public-docs -- --mode rebind-landed --preview-receipt dist/salt-ai-release/r2-landed/input/public-docs-preview.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-landed/input/mcp-final-premerge.json --effective-selected-graph-receipt dist/salt-ai-release/r2-landed/effective-selected-graph.json --web-receipt dist/salt-ai-web/release-receipt.json --expected-receipt dist/salt-ai-release/r2-landed/input/public-docs-final-premerge.json --output dist/salt-ai-release/r2-landed/public-docs-final.json
yarn seal:salt-public-package-docs -- --mode rebind-landed --inventory tooling/ai/public-package-docs-v1.json --expected-receipt dist/salt-ai-release/r2-landed/input/package-docs-premerge.json --mcp-final-disposition-receipt dist/salt-ai-release/r2-landed/input/mcp-final-premerge.json --effective-selected-graph-receipt dist/salt-ai-release/r2-landed/effective-selected-graph.json --public-docs-receipt dist/salt-ai-release/r2-landed/public-docs-final.json --pack-report dist/salt-ai-release/r2-landed/pack-report.json --output dist/salt-ai-release/r2-landed/package-docs.json
yarn verify:salt-ai:mcp-final -- --rebind-landed --premerge-receipt dist/salt-ai-release/r2-landed/input/mcp-final-premerge.json --effective-selected-graph-receipt dist/salt-ai-release/r2-landed/effective-selected-graph.json --release-partition-receipt dist/salt-ai-release/r2-landed/partition-applied.json --pack-report dist/salt-ai-release/r2-landed/pack-report.json --app-cohort-receipt dist/salt-ai-release/r2-landed/app-cohort-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --package-docs-receipt dist/salt-ai-release/r2-landed/package-docs.json --output dist/salt-ai-release/r2-landed/mcp-final-disposition.json
yarn acquire:salt-ai:evidence -- --unit 00a --kind ordinary-baseline-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/ordinary-baseline.json
yarn acquire:salt-ai:evidence -- --unit 00a --kind package-namespace-receipt --tracker plans/README.md --output dist/salt-ai-release/r2-landed/input/package-namespace-preflight.json
yarn verify:salt-ai:package-namespaces -- --mode release --expected-receipt dist/salt-ai-release/r2-landed/input/package-namespace-preflight.json --output dist/salt-ai-release/r2-landed/package-namespace-release-receipt.json
yarn plan:salt:ordinary-dependencies -- --release-partition-receipt dist/salt-ai-release/r2-landed/partition-applied.json --effective-selected-graph-receipt dist/salt-ai-release/r2-landed/effective-selected-graph.json --ordinary-baseline-receipt dist/salt-ai-release/r2-landed/input/ordinary-baseline.json --pack-report dist/salt-ai-release/r2-landed/pack-report.json --app-cohort-receipt dist/salt-ai-release/r2-landed/app-cohort-receipt.json --output dist/salt-ai-release/r2-landed/ordinary-dependency-request.json
```

The landed rebind must prove package names/versions/tarball and unpacked-content
digests, web bytes, package-doc bytes, effective graph, and partition equal the
reviewed premerge evidence. Source merge metadata may differ; any release-byte
delta restarts the final decision. Persist and tracker-bind the landed applied,
final MCP, effective graph, final public-doc, effective package-doc, pack, app,
web, namespace-release, and ordinary dependency-request receipts with the
landed completion SHA. Then atomically retire these eight registered pairs from
`tooling/ai/premerge-evidence-pairs-v1.json`:

```text
release-partition-applied-premerge -> release-partition-applied
mcp-final-disposition-premerge-receipt -> mcp-final-disposition-receipt
effective-selected-graph-premerge-receipt -> effective-selected-graph-receipt
public-docs-final-premerge-receipt -> public-docs-final-receipt
effective-public-package-docs-premerge-receipt -> effective-public-package-docs-receipt
pack-report-premerge -> pack-report
app-cohort-premerge-receipt -> app-cohort-receipt
web-release-premerge-receipt -> web-release-receipt
```

```shell
yarn retire:salt-ai:premerge-evidence -- --plan 001 --unit 08c --pairs-from tooling/ai/premerge-evidence-pairs-v1.json --scope 001/08c --tracker plans/README.md
yarn validate:salt-ai:tracker -- --tracker plans/README.md
```

The retirement is one prospective index transaction: a missing landed entry,
digest/parent mismatch, unregistered or extra pair, partial write, or surviving
active premerge-only kind fails without changing the index. The protected job
starts clean and reacquires the complete landed set, the Unit 07 audit inputs, and the
Unit 00a ordinary baseline; it
never consumes an earlier job's local paths:

```shell
yarn acquire:salt-ai:evidence -- --unit 08c --kind release-partition-applied --tracker plans/README.md --output dist/salt-ai-release/r2/input/partition-applied.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind mcp-final-disposition-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/mcp-final-disposition.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind effective-selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/effective-selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind public-docs-final-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/public-docs-final.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind effective-public-package-docs-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/package-docs.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind pack-report --tracker plans/README.md --output dist/salt-ai-release/r2/input/expected-pack-report.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind app-cohort-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/expected-app-cohort-receipt.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind web-release-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/expected-web-release-receipt.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind mcp-candidate-disposition-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/mcp-candidate-disposition.json
yarn acquire:salt-ai:evidence -- --unit 07 --kind selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/provisional-selected-graph.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind ordinary-dependency-request-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/ordinary-dependency-request.json
yarn acquire:salt-ai:evidence -- --unit 00a --kind ordinary-baseline-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/ordinary-baseline.json
yarn acquire:salt-ai:evidence -- --unit 08c --kind package-namespace-release-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/package-namespace-release-receipt.json
yarn verify:salt-ai:package-namespaces -- --mode protected-final --expected-receipt dist/salt-ai-release/r2/input/package-namespace-release-receipt.json --require-unexpired --require-registry-readback --output dist/salt-ai-release/r2/input/package-namespace-protected-receipt.json
```

For a non-empty ordinary child, the ordinary-only dispatch runs exactly:

```shell
yarn release:salt:transition -- --mode ORDINARY_RELEASE --operation publish --partition-receipt dist/salt-ai-release/r2/input/partition-applied.json --dependency-cohort-request dist/salt-ai-release/r2/input/ordinary-dependency-request.json --ordinary-baseline-receipt dist/salt-ai-release/r2/input/ordinary-baseline.json --output-dir dist/salt-ai-release/r2/ordinary
yarn release:salt:transition -- --mode ORDINARY_RELEASE --operation activate --parent-receipt dist/salt-ai-release/r2/ordinary/verified-receipt.json --dependency-cohort-request dist/salt-ai-release/r2/input/ordinary-dependency-request.json --ordinary-baseline-receipt dist/salt-ai-release/r2/input/ordinary-baseline.json --output-dir dist/salt-ai-release/r2/ordinary
```

Persist `ordinary/final-receipt.json` at a content-addressed immutable locator,
land its locator/SHA-256 in the Unit 08c tracker row, and end that dispatch. The
later AI dispatch starts in a clean workspace, repeats all prerequisite
acquisitions above, then reacquires and normalizes the ordinary receipt exactly:

```shell
yarn acquire:salt-ai:evidence -- --unit 08c --kind ordinary-release-final-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/ordinary-final-receipt.json
yarn resolve:salt:ordinary-dependency -- --changed-child --partition-receipt dist/salt-ai-release/r2/input/partition-applied.json --dependency-cohort-request dist/salt-ai-release/r2/input/ordinary-dependency-request.json --ordinary-final-receipt dist/salt-ai-release/r2/input/ordinary-final-receipt.json --output dist/salt-ai-release/r2/input/ordinary-dependency.json
```

For an empty ordinary child, the ordinary-only dispatch runs this instead and
its final receipt crosses the same tracker boundary:

```shell
yarn release:salt:transition -- --mode ORDINARY_RELEASE --operation attest-existing --partition-receipt dist/salt-ai-release/r2/input/partition-applied.json --dependency-cohort-request dist/salt-ai-release/r2/input/ordinary-dependency-request.json --ordinary-baseline-receipt dist/salt-ai-release/r2/input/ordinary-baseline.json --output-dir dist/salt-ai-release/r2/ordinary
```

The later clean AI dispatch reacquires that `ordinary-release-final-receipt`
and runs the mutually exclusive normalization:

```shell
yarn acquire:salt-ai:evidence -- --unit 08c --kind ordinary-release-final-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/ordinary-final-receipt.json
yarn resolve:salt:ordinary-dependency -- --empty-child --partition-receipt dist/salt-ai-release/r2/input/partition-applied.json --dependency-cohort-request dist/salt-ai-release/r2/input/ordinary-dependency-request.json --ordinary-final-receipt dist/salt-ai-release/r2/input/ordinary-final-receipt.json --output dist/salt-ai-release/r2/input/ordinary-dependency.json
```

Then the protected AI child runs:

```shell
yarn build
yarn check:ai-tooling:pack -- --effective-selected-graph-receipt dist/salt-ai-release/r2/input/effective-selected-graph.json --effective-package-docs-receipt dist/salt-ai-release/r2/input/package-docs.json --ordinary-dependency-receipt dist/salt-ai-release/r2/input/ordinary-dependency.json --expected-report dist/salt-ai-release/r2/input/expected-pack-report.json --report dist/salt-ai-release/r2/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-release/r2/pack-report.json
yarn check:salt-sample-apps -- --expected-receipt dist/salt-ai-release/r2/input/expected-app-cohort-receipt.json --receipt dist/salt-ai-release/r2/app-cohort-receipt.json
yarn build:salt-ai-web
yarn check:salt-docs-authoring -- --effective-package-docs-receipt dist/salt-ai-release/r2/input/package-docs.json --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --effective-package-docs-receipt dist/salt-ai-release/r2/input/package-docs.json --expected-web-receipt dist/salt-ai-release/r2/input/expected-web-release-receipt.json
yarn workspace @salt-ds/site build
yarn acquire:salt-ai:evidence -- --unit 06b --kind migration-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/06b-receipt.json
yarn acquire:salt-ai:evidence -- --unit 06c --kind migration-receipt --tracker plans/README.md --output dist/salt-ai-release/r2/input/06c-receipt.json
yarn candidate:salt-ai:seal -- --stage R2_BETA --pack-report dist/salt-ai-release/r2/pack-report.json --app-cohort-receipt dist/salt-ai-release/r2/app-cohort-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --public-docs-receipt dist/salt-ai-release/r2/input/public-docs-final.json --effective-package-docs-receipt dist/salt-ai-release/r2/input/package-docs.json --migration-receipt dist/salt-ai-release/r2/input/06b-receipt.json --migration-receipt dist/salt-ai-release/r2/input/06c-receipt.json --mcp-candidate-disposition-receipt dist/salt-ai-release/r2/input/mcp-candidate-disposition.json --mcp-final-disposition-receipt dist/salt-ai-release/r2/input/mcp-final-disposition.json --unit-07-selected-graph-receipt dist/salt-ai-release/r2/input/provisional-selected-graph.json --effective-selected-graph-receipt dist/salt-ai-release/r2/input/effective-selected-graph.json --release-partition-receipt dist/salt-ai-release/r2/input/partition-applied.json --ordinary-dependency-receipt dist/salt-ai-release/r2/input/ordinary-dependency.json --package-namespace-receipt dist/salt-ai-release/r2/input/package-namespace-protected-receipt.json --output dist/salt-ai-release/r2/candidate-receipt.json
yarn verify:salt-ai:release-receipt -- --state candidate --stage R2_BETA --receipt dist/salt-ai-release/r2/candidate-receipt.json
yarn release:verify:ai-tooling:after-build
yarn release:salt:transition -- --mode SALT_AI_RELEASE --operation publish-r2 --candidate-receipt dist/salt-ai-release/r2/candidate-receipt.json --output-dir dist/salt-ai-release/r2
yarn release:drill:salt -- --mode SALT_AI_RELEASE --stage PROTECTED_DRILL --verified-receipt dist/salt-ai-release/r2/verified-receipt.json --output dist/salt-ai-release/r2/rollback-drill-final-receipt.json
yarn release:salt:transition -- --mode SALT_AI_RELEASE --operation activate-r2 --parent-receipt dist/salt-ai-release/r2/verified-receipt.json --drill-receipt dist/salt-ai-release/r2/rollback-drill-final-receipt.json --output-dir dist/salt-ai-release/r2
yarn verify:salt-ai:release-receipt -- --state final --stage R2_BETA --receipt dist/salt-ai-release/r2/final-receipt.json --mcp-final-parent dist/salt-ai-release/r2/input/mcp-final-disposition.json --effective-selected-graph-parent dist/salt-ai-release/r2/input/effective-selected-graph.json --public-docs-parent dist/salt-ai-release/r2/input/public-docs-final.json --effective-package-docs-parent dist/salt-ai-release/r2/input/package-docs.json
```

The drill uses only dedicated per-cohort npm/web drill targets. It proves
promotion, immediate readback, a stale rollback that must not mutate, guarded
rollback to the recorded previous value, reactivation, final restoration, and
that beta/GA tags and pointers remain byte-identical throughout. Its digest-
chained `rolled_back` and `final` receipts are persisted with the R2 chain.

**Current-version web release path:**

1. The R2 release workflow uploads the verified `dist/salt-ai-web` build
   artifact tied to the exact tagged source/npm cohort. PR jobs never deploy
   it; R3 reacquires and verifies the retained R2 artifact without uploading
   replacement bytes.
2. After npm publication and post-publish smoke pass, the protected web
   workflow downloads that exact artifact and uploads
   `/ai/v1/<digest-segment>/...` with no-overwrite semantics and immutable cache
   headers.
3. `verifyPublishedSaltAiWeb.mjs` reads back the outer manifest, every
   `llms.txt` index and Markdown alternate, and a deterministic sample of every
   other artifact family; validates bytes, media types, hashes, route bounds,
   alternate/discovery relations, and pointer targets; and confirms the live
   `bundle_digest` and npm/web projection parity.
4. Only then does the state machine compare-and-swap the recorded stage-allowed
   npm dist-tags and use `promoteSaltAiWebPointer.mjs` with the recorded provider
   generation to atomically change only that stage's beta or GA routes. Record
   every before/after value; R2 never touches `latest`, `/ai/current/`, or root
   `/llms.txt`.
5. Read back registry tags, stable routes, and the full site after promotion.
   On failure, `rollbackSaltAiRelease.mjs` restores only state still pointing at
   this failed cohort. Tests require stale tag and stale web-pointer rollback
   attempts to abort without mutation.

The platform owner must select the main-site storage/deployment provider and
document exact upload/readback/promotion/rollback commands in Unit 00b. The
workflow must use an approved deployment environment and cannot reuse the
existing Storybook-only deploy as a substitute. If the provider cannot enforce
no-overwrite immutable paths, atomic pointer promotion, and live readback,
STOP the web launch.

**08c gate:** CI and release use the same graph and gates; every
effective-disposition-selected AI tarball works outside the monorepo; the protected
ordinary/AI npm and AI-web modes are disjoint, reproducible, and
dry-run validated; there are no duplicate bundle bytes or unresolved
`workspace:` dependencies. R2 completion additionally requires final MCP and
applied-partition receipts, the tracker-acquired ordinary final and complete
dependency evidence, and the
operator-triggered verified-provenance, published-smoke, immutable-web-readback,
protected rollback-drill, dist-tag/pointer CAS, and complete digest-chained
`candidate` through `final` receipts. The tracker records immutable locators
and SHA-256 values for the R2 `final` and drill-final receipts; Unit 08c remains
`IN PROGRESS — protected R2 pending` and Unit 09a cannot dispatch until that
plan-control update lands.

### R2 invalidation boundary

This plan authorizes exactly one R2 cohort from Unit 08c. If any package,
bundle, rule, public projection, selected graph, MCP disposition, or immutable
web byte must change after R2, mark Unit 09a `STALE — R2 invalidated`, keep 09b
and 09c blocked (or mark them stale if already dispatched), perform
only the existing guarded incident rollback/withdrawal allowed by that R2
receipt, and STOP. Do not reopen 08c, synthesize a second stage-only R2, or
reinterpret a published MCP `ship` as the unreleased `omit` cleanup path.

A replacement requires a separately reviewed successor plan. At minimum it
must define a new execution-unit/tracker namespace; fresh package intent,
final-MCP/activation eligibility and effective graph; package-doc seal;
planned/landed-applied partition; complete ordinary dependency request/final;
full pack/apps/web/evaluation gates; protected publication/readback/drill; and
a distinct immutable `r2-cohort-invalidation-and-replacement-receipt` that
parents the old R2-final/drill evidence and the new cohort without changing or
cross-namespace-superseding either audit entry. The successor plan registers
that receipt as an ordinary non-lifecycle kind in its own namespace. Until that
plan lands and Units 09a–09c are reconciled to its exact cohort
selector, R3 and Plan 002 remain blocked. This boundary prevents an incident
response from silently becoming a new release architecture.

### 09a–09c — Pilot, compare the selected delivery modes, activate R3, and launch discovery

**Outcome:** GA is based on demonstrated consumer outcomes and has an owner,
support path, rollback procedure, and scheduled review.

**Complete the evaluation harness:**

- Add `evals/salt-ai/scripts/runScan.mjs`,
  `evals/salt-ai/scripts/runRetrieval.mjs`,
  `evals/salt-ai/scripts/runModel.mjs`, and
  `evals/salt-ai/scripts/gate.mjs`, a checked-in
  `evals/salt-ai/protocol/cohorts/current-ga.json` containing two non-secret
  host/model aliases plus exact R2 and drill selectors (`plan_id`, `unit_id`,
  evidence `kind`, `cohort_id`, and receipt SHA-256), and matching root scripts.
  Its schema rejects stage-only, `latest`, or multiple-active selection.
- Write raw prompts, model output, logs, and proprietary/local fixture results
  only to ignored `.salt-eval-cache`.
- Commit only a schema-validated sanitized cohort receipt under
  `evals/salt-ai/baselines/<cohort-id>.json` and a human summary under
  `docs/ai/evaluation-results/<cohort-id>.md`. The receipt contains case/mode
  IDs, semantic-source/compiler/release-receipt identities, package vector,
  tool/knowledge/ruleset and Skill/AGENTS artifact identities, mode/protocol/
  budget/bootstrap hashes, scheduled and completed cell counts, every metric
  numerator/denominator/macro, reviewer agreement, host/model/settings identity,
  sampling/order seed, every attempt/retry classification and selected-attempt
  ID, deterministic grader IDs/results, confidence/limitations, trace hashes and
  retention state, and referenced waivers—never raw source, prompts, output,
  credentials, or absolute paths.
- A waiver under `evals/salt-ai/waivers/<metric-id>.json` must name the metric,
  required and observed values, affected cases, risk, rationale, accountable
  owner, channel-neutral `tracking_reference`, approval date, and expiry.
  `gate.mjs` rejects expired,
  incomplete, open-ended, undeclared, or non-waivable metric waivers.

**Run the ratified evaluation:**

- Use the exact cumulative contract—modes 1–3 always and mode 4 only after final
  `ship`—with fresh-state isolation, equal
  budgets, counterbalanced order, three repetitions, two predeclared
  host/model pairs, fixed 12–15 tasks, repositories, package vectors, allowed
  variants, sampling settings, frozen attempt policy, and deterministic graders
  ratified in Unit 00b. No operator chooses a rerun after seeing quality.
- Cover choose, configure, create, repair, migrate, project-wrapper, invalid
  import, deprecated prop/token, partial mismatch, Lab prerelease, non-Salt,
  and valid no-op cases.
- Resolve the two host/model aliases from operator-provided secrets/config;
  pin provider model revision when available and record the exact returned
  identity, date, settings, and any provider drift. Keep credentials,
  proprietary prompts/projects, and raw model output out of git.
- Score deterministic compile/type/interaction/scan assertions first. Use a
  blind rubric only for semantic/design quality that code cannot decide.
- Track task success, version correctness, unsupported claims, correct-record
  retrieval, per-rule/macro scan precision/recall, tool discovery, latency,
  time to first valid result, setup/activation success, input/output tokens,
  tool calls, duration, output bytes, failure recovery, maintainer effort, and
  cost per successful task using the frozen formulas/minimum denominators.
  Report intervals and limitations; do not manufacture statistical
  significance or tune thresholds after viewing modes.

**Pilot:**

1. Use the exact Unit 08c protected `R2_BETA` cohort selected by
   `evals/salt-ai/protocol/cohorts/current-ga.json`. If any identity-bearing byte
   or contract changes, follow the R2 invalidation boundary above; never publish
   an ad hoc canary or select by stage/latest alone.
2. Use three or more consented representative repositories: current Core,
   Core+Theme, and Core+Lab/nested workspace. The aggregate pilot plus
   deterministic fixture matrix must exercise resolver/report behavior for all
   13 frozen package families, including absent, mixed-version, prerelease, and
   sibling-workspace cases. Use sanitized copies or run locally; never upload
   proprietary source to model evals.
3. Give pilot users CLI-first instructions and MCP instructions only when Unit
   08c recorded final `ship`.
4. Triage every false positive, false clean, version mismatch, inaccessible
   example, installation problem, and misleading claim against a stable
   channel-neutral `pilot_finding_id` and owner.
5. Treat the schemas and command names ratified in Unit 08c as frozen.
   Pilot-driven identity changes trigger the R2 invalidation boundary and a
   separately reviewed successor plan; they never mutate published beta bytes
   in place.

**MCP outcome handling:**

- If the exact R2 selector resolves a final `ship` graph, include that exact R2 mode 4 in the full
  pilot as confirmatory evidence, publish its measured benefit and cost, and
  launch it as an optional adapter. The decisive task/non-regression/security
  matrix already passed before R2; Unit 09a does not silently rewrite that
  disposition from a selectively rerun cell.
- If the exact R2 selector resolves final `omit`, the GA cohort contains modes
  1–3 only and cites both immutable pre-release decision receipts. Do not
  publish MCP setup docs, metadata, package, binary, or mode-4 claims. No
  deprecation or migration plan is required because no public MCP contract
  existed.
- A newly discovered critical/security failure or reproducible invalidation of
  the pre-R2 mode-4 gate blocks R3 and triggers the R2 invalidation boundary.
  Once any MCP beta has been published, do not reuse the earlier “no public
  contract” rationale; retain its immutable version/evidence and communicate
  any guarded beta withdrawal. A successor cohort is outside this plan.
- Modes 1–3 are the nonwaivable product baseline in either case. A shipped MCP
  is additive and must not become the only route to any supported knowledge or
  workflow.

**Verification:**

```shell
yarn build
yarn check:ai-tooling:pack -- --report dist/salt-ai-release/unit-09/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-release/unit-09/pack-report.json
yarn build:salt-ai-web
yarn verify:salt-ai-web
yarn acquire:salt-ai:release-receipt -- --selector-from evals/salt-ai/protocol/cohorts/current-ga.json --selector r2 --tracker plans/README.md --output dist/salt-ai-release/unit-09/r2-final-receipt.json
yarn acquire:salt-ai:release-receipt -- --selector-from evals/salt-ai/protocol/cohorts/current-ga.json --selector drill --tracker plans/README.md --output dist/salt-ai-release/unit-09/rollback-drill-final-receipt.json
yarn verify:salt-ai:release-receipt -- --state final --stage R2_BETA --receipt dist/salt-ai-release/unit-09/r2-final-receipt.json
yarn verify:salt-ai:release-receipt -- --state final --stage PROTECTED_DRILL --receipt dist/salt-ai-release/unit-09/rollback-drill-final-receipt.json
yarn verify:salt-ai:release-receipt -- --state final --stage R2_BETA --receipt dist/salt-ai-release/unit-09/r2-final-receipt.json --rebuild-pack-report dist/salt-ai-release/unit-09/pack-report.json --rebuild-web-receipt dist/salt-ai-web/release-receipt.json
yarn eval:salt-ai:validate
yarn eval:salt-ai:scan -- --cohort current-ga --release-receipt dist/salt-ai-release/unit-09/r2-final-receipt.json
yarn eval:salt-ai:retrieval -- --cohort current-ga --release-receipt dist/salt-ai-release/unit-09/r2-final-receipt.json
yarn eval:salt-ai:tasks:deterministic -- --cohort current-ga --release-receipt dist/salt-ai-release/unit-09/r2-final-receipt.json
yarn eval:salt-ai:tasks:model -- --cohort current-ga --release-receipt dist/salt-ai-release/unit-09/r2-final-receipt.json
yarn eval:salt-ai:report -- --cohort current-ga --release-receipt dist/salt-ai-release/unit-09/r2-final-receipt.json
yarn eval:salt-ai:gate -- --cohort current-ga --release-receipt dist/salt-ai-release/unit-09/r2-final-receipt.json --rollback-drill-receipt dist/salt-ai-release/unit-09/rollback-drill-final-receipt.json
yarn release:verify:ai-tooling
yarn workspace @salt-ds/site build
```

Expected result: every command exits 0; model execution reports the complete
`task × mode × repetition × host/model` cell count declared by `current-ga.json`;
`evals/salt-ai/baselines/current-ga.json` and
`docs/ai/evaluation-results/current-ga.md` validate and contain matching
protocol/cohort hashes. `eval:salt-ai:gate` exits nonzero for a missing cell,
failed deterministic/non-waivable check, underpowered denominator, unmet
threshold without a predeclared valid waiver, identity mismatch, expired or
forbidden waiver, extra/selective/unclassified retry, attempt-selection mismatch,
or schema error. Re-running report generation over identical
receipts produces byte-identical sanitized JSON and Markdown.

Unit 09a owns the controlled pilot, evaluation, GA decision, and reviewed
summary. The human evaluation summary is a normal versioned site/docs artifact, not an
input to the already-published immutable R2 AI-web closure. Keep
`docs/ai/evaluation-results/**` out of generated `llms.txt` indexes for this
cohort, stage it for the ordinary docs/site path after the Unit 09a merge,
and prove `build:salt-ai-web` still reproduces the exact R2 web receipt. R3 may
change only guarded mutable pointers/tags; it never uploads a revised immutable
AI-web artifact to smuggle the summary into that cohort.

After GA, create separately scoped, evidence-led follow-up proposals for (a) a
rendered-browser `salt-ds check-ui` capability only if static scan misses
material problems, and (b) a stable Figma/design-binding integration once the
design identity and ownership contract is available. Neither is a Plan 001
launch dependency and neither may be inferred from file/name similarity.

**GA gate:** every non-waivable metric passes, every other failed metric has a
predeclared named/dated/unexpired waiver, and the complete controlled cohort
meets its denominators. The exact current-version vector is documented; package,
Skill/AGENTS, and web bytes match; official provenance is verified; stale-safe
dist-tag/web rollback drills pass; support is assigned; and all
security/high-severity review findings are closed.

After the gate passes and Unit 09a is merged and tracker-complete, Unit 09b's sole protected state machine
reacquires the tracker-recorded R2 and drill receipts and performs an R3
CAS-only activation. It must not run Changesets or publish/upload replacement
package/AI bytes:

```shell
yarn acquire:salt-ai:release-receipt -- --selector-from evals/salt-ai/protocol/cohorts/current-ga.json --selector r2 --tracker plans/README.md --output dist/salt-ai-release/r3/r2-final-receipt.json
yarn acquire:salt-ai:release-receipt -- --selector-from evals/salt-ai/protocol/cohorts/current-ga.json --selector drill --tracker plans/README.md --output dist/salt-ai-release/r3/rollback-drill-final-receipt.json
yarn acquire:salt-ai:evidence -- --unit 09a --kind evaluation-summary-receipt --tracker plans/README.md --output dist/salt-ai-release/r3/evaluation-summary-receipt.json
yarn verify:salt-ai:release-receipt -- --state final --stage R2_BETA --receipt dist/salt-ai-release/r3/r2-final-receipt.json
yarn verify:salt-ai:release-receipt -- --state final --stage PROTECTED_DRILL --receipt dist/salt-ai-release/r3/rollback-drill-final-receipt.json
yarn release:salt:transition -- --mode SALT_AI_RELEASE --operation activate-r3 --parent-receipt dist/salt-ai-release/r3/r2-final-receipt.json --evaluation-receipt dist/salt-ai-release/r3/evaluation-summary-receipt.json --drill-receipt dist/salt-ai-release/r3/rollback-drill-final-receipt.json --output-dir dist/salt-ai-release/r3
yarn verify:salt-ai:release-receipt -- --state final --stage R3_GA --receipt dist/salt-ai-release/r3/final-receipt.json --parent-receipt dist/salt-ai-release/r3/r2-final-receipt.json --evaluation-receipt dist/salt-ai-release/r3/evaluation-summary-receipt.json --drill-receipt dist/salt-ai-release/r3/rollback-drill-final-receipt.json --require-live-readback
```

The protected workflow persists the R3 `activated` and `final` receipts. The R3
final receipt carries the exact Unit 08c R2, final-MCP, effective-selected-graph,
final-public-doc, effective-package-doc, package, bundle, web, protected-drill,
and tracker-acquired evaluation-summary parent digests;
its Unit 09b evidence index records the release permanently as
`r3-activation-final-receipt`, records the same receipt as
`current-r3-final-receipt`, and re-exposes those exact immutable parents as
`current-mcp-final-parent-receipt`,
`current-effective-selected-graph-parent-receipt`, and
`current-effective-package-docs-parent-receipt`. Their bytes/digests must equal
the corresponding R3 fields; aliases or copies with different bytes fail. That
index is the initial current-release authority consumed by Plan 002. A later
protected current-maintenance or historical activation may replace it only by
atomically superseding this exact four-entry authority set and publishing a new
active set with an equal closed parent relationship; no consumer follows a
mutable “latest” alias.
The first plan-control update records the activation plus four-entry authority
and leaves Unit 09b `IN PROGRESS — negative crawl pending`. A new read-only job
then proves the production site still has no launch navigation:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-release/r3-negative-crawl/input
yarn acquire:salt-ai:evidence -- --unit 09b --kind r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-release/r3-negative-crawl/input/r3-activation-final-receipt.json
yarn acquire:salt-ai:evidence -- --unit 09a --kind evaluation-summary-receipt --tracker plans/README.md --output dist/salt-ai-release/r3-negative-crawl/input/evaluation-summary-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-release/r3-negative-crawl/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-release/r3-negative-crawl/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-release/r3-negative-crawl/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-release/r3-negative-crawl/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-release/r3-negative-crawl/input/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-release/r3-negative-crawl/input/r3-activation-final-receipt.json --require-live-current
yarn verify:salt-ai:negative-discovery-crawl -- --mode current-pre-navigation --activation-receipt dist/salt-ai-release/r3-negative-crawl/input/r3-activation-final-receipt.json --live-current-authority-selector-receipt dist/salt-ai-release/r3-negative-crawl/input/current-authority-selector-receipt.json --evaluation-receipt dist/salt-ai-release/r3-negative-crawl/input/evaluation-summary-receipt.json --require-authority-bound-ai-routes --forbid-ordinary-site-ai-navigation --output dist/salt-ai-release/r3-negative-crawl/pre-navigation-negative-crawl-receipt.json
```

Unit 09b only executes the current-authority acquirer/verifier, crawl verifier,
schemas, and registered evidence kinds already landed and tested by Unit 08b;
it introduces no source. Record the
activation, evaluation, drill, negative-crawl immutable locators/digests and
four-entry current-authority set before 09b becomes `DONE`; 09c and Plan 002
remain ineligible. Unit 09c then implements
`scripts/acquireSaltAiReleaseParents.mjs`,
`scripts/sealSaltAiDiscoveryDeployment.mjs`, and
`scripts/verifySaltAiDiscoveryDeployment.mjs` with root commands
`acquire:salt-ai:release-parents`,
`seal:salt-ai:discovery-deployment`, and
`verify:salt-ai:discovery-deployment`. The release-parent acquisition reads the
exact parent tuples/digests embedded in an immutable activation receipt,
resolves them through the tracker index as one read-only transaction, and emits
a selector receipt; it never substitutes the live authority set. Its bounded
source PR runs:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-discovery/unit09c/input
yarn acquire:salt-ai:evidence -- --unit 09b --kind r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-discovery/unit09c/input/r3-activation-final-receipt.json
yarn acquire:salt-ai:evidence -- --unit 09b --kind pre-navigation-negative-crawl-receipt --tracker plans/README.md --output dist/salt-ai-discovery/unit09c/input/pre-navigation-negative-crawl-receipt.json
yarn acquire:salt-ai:release-parents -- --receipt dist/salt-ai-discovery/unit09c/input/r3-activation-final-receipt.json --tracker plans/README.md --output-dir dist/salt-ai-discovery/unit09c/input/r3-parents
yarn acquire:salt-ai:evidence -- --unit 09a --kind evaluation-summary-receipt --tracker plans/README.md --output dist/salt-ai-discovery/unit09c/input/evaluation-summary-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-discovery/unit09c/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-discovery/unit09c/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-discovery/unit09c/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-discovery/unit09c/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-discovery/unit09c/input/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-discovery/unit09c/input/r3-activation-final-receipt.json --require-live-current
yarn verify:salt-ai:release-receipt -- --state final --stage R3_GA --receipt dist/salt-ai-discovery/unit09c/input/r3-activation-final-receipt.json --parent-selector-receipt dist/salt-ai-discovery/unit09c/input/r3-parents/parent-selector-receipt.json --mcp-final-parent dist/salt-ai-discovery/unit09c/input/r3-parents/mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-discovery/unit09c/input/r3-parents/effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-discovery/unit09c/input/r3-parents/effective-package-docs-parent-receipt.json
yarn project:salt-ai:public-docs -- --mode activate-navigation --evaluated-r3-receipt dist/salt-ai-discovery/unit09c/input/r3-activation-final-receipt.json --r3-parent-selector-receipt dist/salt-ai-discovery/unit09c/input/r3-parents/parent-selector-receipt.json --live-current-authority-selector-receipt dist/salt-ai-discovery/unit09c/input/current-authority-selector-receipt.json --require-current-descendant-of-r3 --output dist/salt-ai-discovery/unit09c/navigation-projection-receipt.json
yarn build:salt-ai-web
yarn verify:salt-ai-web -- --expected-current-authority-receipt dist/salt-ai-discovery/unit09c/input/current-r3-final-receipt.json --forbid-immutable-byte-change
yarn workspace @salt-ds/site build
yarn seal:salt-ai:discovery-deployment -- --mode premerge --current-authority-selector-receipt dist/salt-ai-discovery/unit09c/input/current-authority-selector-receipt.json --navigation-projection-receipt dist/salt-ai-discovery/unit09c/navigation-projection-receipt.json --evaluation-summary-receipt dist/salt-ai-discovery/unit09c/input/evaluation-summary-receipt.json --negative-crawl-receipt dist/salt-ai-discovery/unit09c/input/pre-navigation-negative-crawl-receipt.json --negative-crawl-authority-policy same-or-maintenance-descendant --require-identical-mcp-graph-docs-web-parents --site-output site/dist --expected-r2-web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-discovery/unit09c/deployment-candidate-premerge-receipt.json
```

The PR changes only the predeclared root/site navigation files. It consumes and
hashes the exact tracker-bound Unit 09a evaluation summary without editing it;
any summary-byte change returns to 09a and reruns the gate. The generated page
labels `evaluated_cohort` as the exact 09a/R2→09b R3 ancestor and
`live_current_cohort` as the independently validated authority selector. When
they differ, it states that the published model results do not cover the
descendant's changed bytes; a hostile fixture rejects any claim, table heading,
or badge that conflates them. It cannot alter
packages, manifests, Skill/AGENTS, or immutable AI-web
bytes. The crawl selector must equal the PR selector or be its verified metadata-
only maintenance ancestor with identical MCP/graph/docs/web parents; otherwise
rerun and tracker-supersede the crawl before sealing. Persist the premerge candidate with `completion_sha: null`; it cannot be a
publisher parent. After merge, a clean landed-ref job reacquires it and rebuilds
the complete projection/site artifact:

```shell
yarn acquire:salt-ai:evidence -- --unit 09c --kind discovery-deployment-candidate-premerge-receipt --tracker plans/README.md --output dist/salt-ai-discovery/unit09c-landed/input/deployment-candidate-premerge-receipt.json
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-discovery/unit09c-landed/input
yarn acquire:salt-ai:evidence -- --unit 09b --kind r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-discovery/unit09c-landed/input/r3-activation-final-receipt.json
yarn acquire:salt-ai:evidence -- --unit 09b --kind pre-navigation-negative-crawl-receipt --tracker plans/README.md --output dist/salt-ai-discovery/unit09c-landed/input/pre-navigation-negative-crawl-receipt.json
yarn acquire:salt-ai:release-parents -- --receipt dist/salt-ai-discovery/unit09c-landed/input/r3-activation-final-receipt.json --tracker plans/README.md --output-dir dist/salt-ai-discovery/unit09c-landed/input/r3-parents
yarn acquire:salt-ai:evidence -- --unit 09a --kind evaluation-summary-receipt --tracker plans/README.md --output dist/salt-ai-discovery/unit09c-landed/input/evaluation-summary-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-discovery/unit09c-landed/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-discovery/unit09c-landed/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-discovery/unit09c-landed/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-discovery/unit09c-landed/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-discovery/unit09c-landed/input/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-discovery/unit09c-landed/input/r3-activation-final-receipt.json --require-live-current
yarn verify:salt-ai:release-receipt -- --state final --stage R3_GA --receipt dist/salt-ai-discovery/unit09c-landed/input/r3-activation-final-receipt.json --parent-selector-receipt dist/salt-ai-discovery/unit09c-landed/input/r3-parents/parent-selector-receipt.json --mcp-final-parent dist/salt-ai-discovery/unit09c-landed/input/r3-parents/mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-discovery/unit09c-landed/input/r3-parents/effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-discovery/unit09c-landed/input/r3-parents/effective-package-docs-parent-receipt.json
yarn project:salt-ai:public-docs -- --mode activate-navigation --evaluated-r3-receipt dist/salt-ai-discovery/unit09c-landed/input/r3-activation-final-receipt.json --r3-parent-selector-receipt dist/salt-ai-discovery/unit09c-landed/input/r3-parents/parent-selector-receipt.json --live-current-authority-selector-receipt dist/salt-ai-discovery/unit09c-landed/input/current-authority-selector-receipt.json --require-current-descendant-of-r3 --output dist/salt-ai-discovery/unit09c-landed/navigation-projection-receipt.json
yarn build:salt-ai-web
yarn verify:salt-ai-web -- --expected-current-authority-receipt dist/salt-ai-discovery/unit09c-landed/input/current-r3-final-receipt.json --forbid-immutable-byte-change
yarn workspace @salt-ds/site build
yarn seal:salt-ai:discovery-deployment -- --mode rebind-landed --expected-receipt dist/salt-ai-discovery/unit09c-landed/input/deployment-candidate-premerge-receipt.json --current-authority-selector-receipt dist/salt-ai-discovery/unit09c-landed/input/current-authority-selector-receipt.json --allow-maintenance-descendant-of-r3 --require-identical-mcp-graph-docs-web-parents --navigation-projection-receipt dist/salt-ai-discovery/unit09c-landed/navigation-projection-receipt.json --evaluation-summary-receipt dist/salt-ai-discovery/unit09c-landed/input/evaluation-summary-receipt.json --negative-crawl-receipt dist/salt-ai-discovery/unit09c-landed/input/pre-navigation-negative-crawl-receipt.json --site-output site/dist --expected-r2-web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-discovery/unit09c-landed/deployment-candidate-receipt.json
```

The rebind rejects any normalized navigation, route, site artifact, immutable-
web, or MCP/graph/docs-parent delta. It records both selectors and may accept an
independently verified current-maintenance descendant of the permanent R3
activation only when those semantic parents are identical; every other authority
delta fails. Only declared merge metadata may otherwise differ.
Tracker-bind the landed candidate with non-null completion SHA and retire the
premerge entry. The plan-control update performs that registered retirement
edge exactly:

```shell
yarn retire:salt-ai:premerge-evidence -- --plan 001 --unit 09c --premerge-kind discovery-deployment-candidate-premerge-receipt --landed-kind discovery-deployment-landed-candidate-receipt --tracker plans/README.md
yarn validate:salt-ai:tracker -- --tracker plans/README.md
```

The normal docs deployment then starts clean and reacquires the landed candidate
plus its negative-crawl, activation, and deployment-time live-authority parents:

```shell
yarn acquire:salt-ai:evidence -- --unit 09c --kind discovery-deployment-landed-candidate-receipt --tracker plans/README.md --output dist/salt-ai-discovery/deploy/input/deployment-candidate-receipt.json
yarn acquire:salt-ai:evidence -- --unit 09b --kind pre-navigation-negative-crawl-receipt --tracker plans/README.md --output dist/salt-ai-discovery/deploy/input/pre-navigation-negative-crawl-receipt.json
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-discovery/deploy/input/current
yarn acquire:salt-ai:evidence -- --unit 09b --kind r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-discovery/deploy/input/r3-activation-final-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-discovery/deploy/input/current/current-authority-selector-receipt.json --release-receipt dist/salt-ai-discovery/deploy/input/current/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-discovery/deploy/input/current/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-discovery/deploy/input/current/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-discovery/deploy/input/current/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-discovery/deploy/input/r3-activation-final-receipt.json --require-live-current
yarn release:salt:transition -- --mode SALT_DOCS_RELEASE --operation deploy-ai-discovery --candidate-receipt dist/salt-ai-discovery/deploy/input/deployment-candidate-receipt.json --negative-crawl-receipt dist/salt-ai-discovery/deploy/input/pre-navigation-negative-crawl-receipt.json --deployment-time-current-authority-selector-receipt dist/salt-ai-discovery/deploy/input/current/current-authority-selector-receipt.json --activation-receipt dist/salt-ai-discovery/deploy/input/r3-activation-final-receipt.json --allow-maintenance-descendant --require-identical-mcp-graph-docs-web --output-dir dist/salt-ai-discovery/deploy
yarn verify:salt-ai:discovery-deployment -- --state final --receipt dist/salt-ai-discovery/deploy/final-receipt.json --expected-candidate-receipt dist/salt-ai-discovery/deploy/input/deployment-candidate-receipt.json --negative-crawl-receipt dist/salt-ai-discovery/deploy/input/pre-navigation-negative-crawl-receipt.json --deployment-time-current-authority-selector-receipt dist/salt-ai-discovery/deploy/input/current/current-authority-selector-receipt.json --activation-receipt dist/salt-ai-discovery/deploy/input/r3-activation-final-receipt.json --require-live-readback --require-production-crawl
```

The deployment uses the repository-wide publication lock only for live pointer
freshness, upload/CAS, and readback. Its terminal
`discovery-deployment-final-receipt` binds the distinct evaluated R3 ancestor
and live current-authority set,
navigation projection, immutable site artifact, deployment generation, every
live install link/hash/header, and production crawl. Negative tests and the
post-R3, pre-09c production crawl permit the activated AI index entries but
prove that no ordinary-site AI install/navigation claim is active yet. Unit
09c remains `IN PROGRESS — discovery pending` until that immutable final receipt
is tracker-bound; only then is 09c `DONE` and Plan 002 eligible. Publish the
evaluation summary and limitations, not a claim that Salt can guarantee correct
or accessible applications.

## Cross-cutting test plan

Tests are release evidence, not just implementation checks. Each public
contract needs positive, negative, boundary, and installed-package coverage.

| Layer              | Required evidence                                                                                                                                    | PR/release role                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Schema/codec       | Valid fixtures, every invalid boundary, unknown fields, version mismatch, round trip                                                                 | PR blocking                                 |
| Generator          | Input inventory, orphan/reference checks, deterministic double build, hashes/bytes, public/internal boundary                                         | PR and release blocking                     |
| Compatibility      | Exact/mixed/missing/prerelease vectors, mandatory item applicability, every package-manager layout                                                   | PR blocking                                 |
| Query/retrieval    | Gold relevance, ambiguity, applicability before ranking, citations, output budget                                                                    | PR blocking                                 |
| Analyzer/rules     | Positive/negative fixture per rule, byte/character coordinates, unsupported coverage, stable IDs                                                     | PR blocking                                 |
| CLI discovery      | Ignores/config/workspace/path races; every traversal limit; worker timeout/OOM/crash/isolation; ordering/CRLF/Unicode/exit streams                   | PR blocking                                 |
| Renderers          | One result identity across pretty/JSON/SARIF/prompt; schema and deterministic snapshots                                                              | PR blocking                                 |
| MCP                | When selected: SDK client negotiation, tools/resources, schema errors, explicit roots, budgets, stdout purity, shutdown                              | Unit 07 decision and PR blocking if shipped |
| Package            | Dry-pack allowlist, exports/types/bins, exact dependencies, no duplicate bundle, size budgets                                                        | Release blocking                            |
| Installed consumer | npm install/ci, Node 22/24, Linux/Windows, offline valid/invalid/non-Salt/nested fixtures                                                            | Release blocking                            |
| Web/Skill/docs     | Manifest descriptors, npm/web byte parity, trust/provenance labels, link/crawl, unsupported MDX, code-complete examples, no Storybook dependency     | PR blocking                                 |
| Web release        | Full site build, immutable upload/readback, verified npm provenance, global lock, dist-tag/web CAS promotion and stale rollback                      | R2/R3 blocking                              |
| Sample apps        | Clean install/build/typecheck, interaction, axe, keyboard, clean scan                                                                                | PR and scheduled blocking                   |
| Outcome eval       | Frozen equal-budget modes 1–3 plus mode 4 only if selected, complete cells, denominators, two hosts/models, blinded adjudication, non-waivable gates | Beta/GA blocking                            |

Testing rules:

- Prefer semantic assertions over broad snapshots. Snapshot normalized public
  documents only when every identity-affecting field is understood.
- Every scanner rule has an isolated positive, isolated negative, realistic
  valid app, realistic invalid app, applicability boundary, and renderer test.
- A test may not become reliable merely by increasing its timeout. Reuse
  verified bundle contexts, measure cold paths explicitly, and keep a separate
  bounded performance check.
- Never hide an unsupported parse, skipped file, unavailable package family, or
  budget truncation behind a passing no-finding assertion.
- Keep network tests local and deterministic. Real registry/web smoke is
  post-release monitoring, not a unit-test dependency.
- Run production tests against built/packed entrypoints before GA; source-level
  tests alone cannot prove exports, copied files, wrappers, or exact dependency
  resolution.
- Treat Windows path and junction behavior as first-class because `scan` owns
  recursive filesystem discovery.

## Release and rollout

| Stage                            | Audience          | Distribution                                                                                 | Entry criteria                                                | Exit criteria                                |
| -------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------- |
| R0 baseline                      | Maintainers       | none                                                                                         | Unit 00b approved                                             | Reproducible current receipt                 |
| `R1_PRE_AGENT` internal evidence | Salt contributors | non-promotable `pre-agent-support@1` CI tarballs/receipt; no npm/web publication or dist-tag | Unit 05 and pack/retrieval gates                              | Clean install on representative repos        |
| `R2_BETA`                        | Opt-in consumers  | final immutable versions under `next`, beta web pointers, and retained final/drill receipts  | Units 06g–08, `release-complete@1`; no open critical findings | Pilot feedback triaged and identities frozen |
| `R3_GA`                          | All consumers     | CAS-only stable tags/docs pointers for the exact evaluated R2 cohort                         | Unit 09a gate; exact R2/eval/drill receipt chain              | Support review after 30 days                 |

Apply/version knowledge first in the Changesets plan, then CLI and MCP only
when selected, but publish the final AI version set once as one R2-tested
cohort. CLI and a shipped MCP exact-pin that knowledge release; R3 never creates
a second version set. Do not update
an npm dist-tag or stable web pointer until all immutable assets and npm
packages are available, provenance is verified, and installed-consumer smoke
passes.

Beta is opt-in. Do not immediately make scanner findings a required check in
consumer CI. Publish a deliberately non-blocking discovery workflow with
`--fail-on never --allow-incomplete`, then remove the incomplete override once
coverage is understood, then use a warning threshold. Recommend an error
threshold only after teams review false positives. Failed evaluation still
exits 3 at every stage.

### Rollback

Released npm versions and digest assets are immutable. Rollback means selecting
known-good identities, not rewriting bytes.

| Trigger                                    | Immediate action                                                                                        | Recovery                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Wrong/corrupt bundle or package dependency | Stop promotion; under global lock CAS-restore every dist-tag/web pointer still naming the failed cohort | Release corrected exact-pinned cohort; rerun provenance and full smoke      |
| CLI crash/incomplete detection regression  | CAS-restore CLI/knowledge cohort tags if still current; keep scan non-blocking                          | Fix with result-contract regression fixture and patch                       |
| High false-positive rate                   | Remove recommendation to fail CI; publish limitation                                                    | Correct executable rule in signed package release; never hot-patch remotely |
| Web/npm digest mismatch                    | CAS-restore only pointers/tags still naming the failed cohort; keep immutable bytes for audit           | Rebuild from tagged source and promote only verified matching bytes         |
| MCP host regression, if shipped            | Keep or restore last supported exact MCP/knowledge cohort                                               | Add host fixture; patch adapter without changing knowledge facts            |

The current-version CLI and any shipped MCP must remain fully useful from
installed bytes while web routes are unavailable. Document exact
package-version pinning and
the guarded cohort rollback commands in the release runbook. A rehearsal must
prove that a stale rollback cannot change a newer npm tag or web pointer.

## Ownership, support, and operating model

Unit 00b replaces each role below with a named primary and backup. An unassigned
required role blocks beta.

| Surface                   | Accountable role                                      | Recurring duties                                                                 |
| ------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Knowledge schema/compiler | Salt architecture/tooling maintainer                  | Schema review, deterministic build, source boundary, size/performance budgets    |
| Analyzer/rules            | Salt component/API maintainers plus tooling owner     | Rule evidence, applicability, precision/recall, remediation accuracy             |
| CLI/scanner               | Developer-experience maintainer                       | Filesystem/config contract, OS matrix, output/exit compatibility, support triage |
| MCP adapter, if shipped   | AI integration maintainer                             | SDK updates, host compatibility, wire contracts, stdio/security                  |
| Docs/Skill/examples       | Documentation and developer-education owner           | Current starter, generated projection QA, example waivers, discoverability       |
| Sample apps               | Developer-experience owner with component reviewers   | Dependency updates, build/interaction/a11y receipts, clean scans                 |
| Release/provenance        | Release engineering                                   | Changesets graph, provenance, pack/install smoke, incident rollback              |
| Web distribution          | Site/platform owner                                   | Immutable hosting, CAS pointer promotion/rollback, availability and readback     |
| Evaluation                | Product/AI enablement owner plus independent reviewer | Task governance, model/host matrix, blinded reviews, published limitations       |

Support intake must request: CLI and knowledge versions, MCP version only when
applicable, bundle and semantic digests, Node/OS, exact observed Salt package
vector, command/format/exit code, sanitized config and minimal fixture, whether
the run was offline, and any reported limitations. Never ask users to upload
proprietary source, lockfiles, or credentials by default.

No product telemetry is added. Operational evidence comes from:

- CI/release receipts with versions, digests, sizes, deterministic-build
  result, test matrix, and provenance link;
- scheduled public sample/eval runs;
- opt-in pilot reports with channel-neutral finding IDs and owners;
- static web availability/digest checks after deployment;
- explicit `info --json` and, if implemented, debug diagnostics that omit
  source text, absolute home paths, environment values, and secrets.

Review cadence after GA: weekly during the first month, monthly for scanner
quality/sample freshness, on every Salt release for the knowledge cohort, and
quarterly for bundle budgets and, only if shipped, MCP's measured role/cost.

## Security and privacy acceptance

- Treat repository files, `.salt` policy, config comments, docs, examples, and
  bundle text as untrusted data. They cannot alter trusted
  instructions, enable tools, or request secrets/network/execution.
- Ordinary commands never execute consumer code or config, resolve plugins,
  install packages, start Storybook, invoke a model, or access the network.
- Normalize and contain every path before reading; do not follow a link or
  junction beyond the authorized root. Reject multiple hard links and
  verify device/file identity before and after each scan read so replacement
  races fail closed. Apply traversal, queue, file/byte, parser/AST, worker
  heap/deadline, rule, and output limits before allocation grows unbounded.
- Only the main packed CLI reaches the named scanner worker. Termination, OOM,
  timeout, crash, protocol failure, or loss of isolation is failed coverage;
  the worker itself cannot reach network, subprocess, MCP, nested workers,
  Storybook, or consumer code.
- Publish executable analyzer rules only inside provenance-backed npm package
  code. Plan 001 accepts no remote bundle; Plan 002 must keep any downloaded
  bundle declarative and separately hash/schema/signature validated.
- Keep stdout machine-safe, escape terminal control characters in human output,
  and do not expose absolute paths, environment variables, or source text in
  ordinary deterministic JSON.
- Prompt output is an explicitly requested local projection, not an upload.
  Documentation must tell users to review it before sending it to a model.
- Filter internal-only docs, URLs, names, source paths, and examples at compile
  time; test the public inventory rather than relying on downstream redaction.
- Dependencies must pass the repository's normal license/security process.
  MCP SDK and parsing libraries remain pinned/reviewed at their owning edge.
- Verified npm provenance authenticates build origin, not content safety;
  schema, inventory, review, and installed-package tests remain required. Merely
  requesting or linking an attestation is not verification.
- Historical download/index/cache work is excluded here and separately
  threat-modelled in Plan 002. Do not infer that HTTPS, a version string, or a
  self-declared digest is sufficient integrity.

## Risk register

| Risk                                       | Trigger/indicator                                                             | Mitigation and owner                                                                                                                        |
| ------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Package extraction changes facts           | Digest/record/parity fixture delta in unit 02                                 | Mechanical move first; stop, diff canonical records, knowledge owner                                                                        |
| Conditional AI package set breaks release  | wrong MCP disposition, exact dependency, or publish ordering                  | disposition-bound pack/receipt and disjoint release modes, release owner                                                                    |
| Bundle becomes too large/slow              | budget or cold-load regression                                                | compact bootstrap/index, lazy artifact reads, baseline-derived gate                                                                         |
| Scanner overclaims or produces noise       | false positives, unsupported clean results                                    | coverage object, per-rule fixtures, staged CI threshold, analyzer owner                                                                     |
| Storybook remains hidden dependency        | story URL/import or incomplete copied example                                 | closure manifests, build assertions, docs/examples owner                                                                                    |
| Version resolver teaches wrong Salt API    | nearest/latest fallback or mixed-family error                                 | exact-first fail-closed resolver and matrix tests                                                                                           |
| A legacy publisher bypasses release policy | another credentialed workflow, PR-head publish, unverified provenance         | workflow-policy test, one protected state machine, release owner                                                                            |
| Release evidence expires or diverges       | active/parent receipt enters 30-day renewal window or digest/identity differs | release/hosting owner runs monitored archive renewal with exact readback and atomic four-entry revalidation; stop on missed/invalid renewal |
| R3 differs from evaluated R2               | package/bundle/web identity delta at GA                                       | CAS-only R3; mark 09a–09c stale as applicable and require a successor plan for any replacement cohort                                       |
| Scanner resource isolation fails           | traversal blow-up, worker timeout/OOM/crash, partial file output              | numeric ceilings, kill/restart boundary, failed coverage, tooling owner                                                                     |
| MCP candidate lacks value/interoperability | threshold miss, host failure, setup or tool-list cost                         | omit before publication; retain decision evidence, AI integration owner                                                                     |
| Eval overfits one model/host               | gains disappear across second condition                                       | fixed tasks, two hosts/models, deterministic graders, rotate holdout cases                                                                  |
| Sample apps rot                            | dependency or current starter divergence                                      | release-blocking matrix and named app owner                                                                                                 |
| Maintainer burden exceeds value            | recurring failures/time or duplicate authoring                                | generated projections, cost tracking, quarterly surface review                                                                              |
| Proprietary data enters reports            | raw projects/prompts/model outputs in git                                     | sanitized fixtures and summaries only, privacy acceptance gate                                                                              |

## Definition of done

Plan 001 is complete when all applicable local implementation and verification
boxes are true through Unit 07. In this historical checklist, version
materialization, protected workflows, npm provenance/publication, registry or
web mutation/readback, R2/R3 activation, live discovery, and retained release
operations are Plan 003 acceptance criteria and do not gate Plan 001. Local
`npm pack`, clean-room install, offline smoke, deterministic web builds, package
metadata, and consumer validation remain Plan 001 requirements.

### Superseded original-program checklist

The unchecked list below is retained only as historical design inventory. It is
not a current combined definition of done for Plans 001 and 003 and cannot
dispatch work. In particular, its scanner, old four-mode pilot, MCP, R2/R3, and
Plan-001/08a–09c requirements were superseded by the Plan 004 scan-free product
decision and the Plan 003 release boundary. Current acceptance is defined only
by Plan 004's indexed terminal decision and, after a PASS, the separately
activated Plan 003 units. A historical checkbox below never blocks, expands, or
weakens either successor.

- [ ] ADR, public contracts, support matrix, owners, review dates, and baseline
      receipt are approved.
- [ ] `@salt-ds/knowledge` is the sole generated-bundle owner and publishes
      deterministic CJS/ESM/types plus one verified manifest-bound artifact set.
- [ ] The outer manifest is at most 32 KiB and its `salt-artifact-tree/1` is a
      strict acyclic tree: depth ≤4, internal/leaf fan-out ≤256, each node ≤64
      KiB, ≤512 nodes, ≤8 MiB total descriptor bytes, and ≤40,000 ordinary
      artifacts. Schema/record/package/version axes are distinct, semantic/
      compiler/release identities close over declared inputs, applicability
      covers all 13 frozen package families, canonical migration records are
      complete, and web/npm hashes match.
- [ ] `@salt-ds/cli` publishes `salt-ds` with contracted command/flag aliases,
      `info`, `scan`, `docs`, `context`, and `skill info/print` behavior on Node
      22/24 across the ratified package-manager matrix.
- [ ] Every pack/smoke gate rebuilds its full live cohort and consumes one
      schema-valid pack report; current release code accepts only
      `release-complete@1`, with both `agent_support` artifacts, and rejects all
      pre-agent/`R1_PRE_AGENT` evidence.
- [ ] Scan discovery, result schema, stable IDs, four renderers, coordinates,
      coverage, every numeric ceiling, killable worker failure/isolation,
      output channels, and exit codes pass the full fixture matrix on Linux and
      Windows; every file/finding belongs to one explicit workspace unit and
      sibling units may resolve different complete package vectors.
- [ ] The five initial rules have explicit coverage/limitations and meet
      ratified fixture precision/recall; valid no-op cases do not imply broader
      review.
- [ ] Public docs, deterministic `.md` alternates, bounded generated
      `llms.txt` v2 indexes, manifest-selected Skill/AGENTS bytes, examples, and
      sample apps are version-correct, code-complete, discoverable, and require
      neither Storybook nor MCP; no `llms-full` or independently authored
      discovery corpus exists.
- [ ] Every publishable public Salt package has a useful landing README and
      accurate package metadata; the 24 pattern and eight package-story sources
      have reviewed canonical destinations; public/internal visibility closure
      and the public-artifact allowlist pass.
- [ ] The full site and manifest-selected web artifact build from the same
      candidate bytes; the protected workflow proves immutable upload, live
      digest readback, verified npm provenance, globally locked dist-tag/web
      CAS promotion, and stale-safe rollback through a retained,
      parent-digest-bound `candidate`→`final` receipt chain.
- [ ] Vite, Next App Router, and operations-dashboard apps install, build,
      typecheck, interact, pass scoped a11y/keyboard checks, and scan clean from
      one receipt-closed full first-party Salt candidate cohort with no
      workspace/registry fallback.
- [ ] Unit 07 records an immutable candidate recommendation and Unit 08c records
      the final disposition/effective graph against final-version bytes. If
      final `ship`, `@salt-ds/mcp` is a small current-spec exact-pinned adapter
      with one factory/options contract, explicit configured roots, no bundle/
      compiler copy, and passing host/security/value gates. If final `omit`, no
      MCP package, binary, metadata, README, setup guidance, or release claim
      ships.
- [ ] Root build, typecheck, AI tests, dry-pack, isolated install/`npm ci`,
      offline smoke, Node/OS matrix, Changesets rehearsal, and provenance all
      pass for the same cohort.
- [ ] Retrieval, projection, determinism, integrity, package-size, and
      performance gates meet their ratified thresholds.
- [ ] The modes 1–3 pilot/evaluation, plus mode 4 only when selected, is
      complete; limitations and efficiency costs are published; activation,
      non-waivable, and denominator gates pass.
- [ ] Rollback has been rehearsed and support intake/runbook documentation is
      usable by a maintainer who did not implement the feature; the protected
      drill receipt proves stale rejection, rollback/reactivation, and R2/R3
      namespace isolation.
- [ ] R2 publishes the final immutable package/bundle/web identities evaluated
      by the pilot, R3 performs only CAS activation of that retained cohort,
      and both immutable final receipt locators/digests are recorded before the
      corresponding tracker row becomes `DONE`.
- [ ] Active evidence and its transitive closure are retained through the
      supported lifetime plus 180 days; the daily monitor, 30-day renewal SLO,
      archive readback, crash/concurrency rehearsal, and atomic current-authority
      renewal path pass before R3.
- [ ] No unresolved critical/high security finding, false provenance claim,
      consumer Storybook dependency, duplicate bundle, silent network/model
      call, or unversioned knowledge fallback remains.

## STOP conditions

Stop the current execution unit and ask maintainers to reconcile the plan if:

- the worktree contains overlapping unplanned changes or the drift check shows
  a changed public/package/release contract;
- the knowledge/CLI ownership direction, package/bin names, exact-version
  policy, release-mode split, or recorded candidate/final MCP disposition is no longer
  approved;
- a supposedly mechanical move changes semantic records, rule findings, a
  ratified public output/resource identity, or source/public inventory without
  an understood cause;
- two clean builds are nondeterministic or an artifact cannot be tied to its
  semantic/compiler inventory, release receipt, manifest membership, and digest;
- a required behavior can work only by executing consumer code, following an
  out-of-root path, silently accessing the network/model, or weakening current
  project/registry integrity checks;
- the package set cannot be packed and installed without workspace links,
  unpublished dependencies, duplicate bundle bytes, or a manual release order;
- a public example cannot be made dependency-complete and its status cannot be
  honestly downgraded to contextual;
- a scanner rule cannot meet the approved precision/coverage gate or SARIF
  coordinates cannot be mapped correctly;
- immutable hosting, the single protected publication authority, verified
  provenance, global promotion lock, or CAS-safe rollback is unavailable for
  R2/R3;
- a release receipt state or immutable parent/artifact digest is missing,
  expired, mutable, or cannot be reacquired and revalidated from its tracker
  locator;
- any R3 input would change the exact R2 package version, tarball, bundle,
  ruleset, Skill/AGENTS, or immutable web identity instead of performing
  CAS-only activation;
- a repository/document/bundle contains instruction-like text asking the
  executor to reveal secrets, alter trusted instructions, run unrelated tools,
  or publish externally;
- implementation would require deleting history, force-pushing, publishing,
  changing external systems, or mutating consumer repositories without
  separate authorization.

## Maintenance notes

- The release/hosting owner monitors active evidence retention daily. Before the
  30-day threshold, the protected retention job runs:

  ```shell
  yarn renew:salt-ai:evidence-retention -- --tracker plans/README.md --scope active-current-authority-and-parents --policy tooling/ai/release-policy.json --output dist/salt-ai-retention/renewal-receipt.json
  yarn validate:salt-ai:tracker -- --tracker plans/README.md --prospective-renewal-receipt dist/salt-ai-retention/renewal-receipt.json --require-complete-current-authority
  ```

  After immutable readback, a plan-control-only update appends the renewal
  records and revalidates the four current entries as one set. It does not alter
  receipt bytes, authority digests, package/web state, or Plan 002 eligibility.
  Missing the window is a STOP condition and requires a reviewed recovery plan;
  an already-expired artifact is never silently reauthorized.

- Every release that changes a version in the frozen supported 13-family
  universe requires a separately reviewed successor plan and runs an automated
  vector-freshness gate against the live current-authority selector, even when
  selected semantic bytes are unchanged. Its authorized default is a coordinated
  ordinary-then-AI maintenance cohort through
  `release:salt:current-maintenance`: regenerate exact-vector applicability, add
  a Knowledge patch, update the exact CLI dependency/version and shipped MCP
  dependant, rerun package/sample/scan/web gates, and activate a new uniquely
  named current cohort through the protected state machine. Unit 08b supplies
  the mechanism and schema only; it supplies no reusable release authorization. A
  version-only component bump fixture proves the new exact vector becomes
  `known`; unchanged semantics never silently widen a range.
- The protected publisher has no ordinary coverage-gap bypass. An urgent change
  that cannot wait for the companion AI child requires a separately reviewed
  incident/successor plan and must remain an explicit unsupported vector until
  that plan closes it; this launch plan does not pre-authorize such a release.
  Track preparation latency with a two-business-day internal SLO, while the
  public release-to-known-vector SLO remains zero because stable activation is
  coordinated.
- Any release that changes public APIs, tokens, guidance, examples, migrations,
  or executable rules regenerates and versions the knowledge bundle in that
  coordinated cohort. A docs-only correction still creates immutable new bytes
  and a knowledge patch.
- Exact `workspace:*` dependencies mean a knowledge patch requires a reviewed
  CLI dependency/version update and, if shipped, MCP update. Keep that cost
  visible in Changesets rather than introducing floating runtime resolution.
- After public v1, manifest schema changes require compatibility
  fixtures/readers and migration notes. Record-schema changes happen separately
  from package moves. Never reuse a schema `$id` for new semantics. No such
  obligation applies to the current unreleased prototype.
- Add a record, projection, or rule only through canonical source plus
  provenance/applicability. Never edit generated npm/web bytes.
- Add scanner rules slowly: authored rationale, source evidence, positive and
  negative fixtures, realistic app cases, coverage category, remediation,
  precision review, and result-schema compatibility.
- Rebuild and verify all public sample apps against each GA cohort. Keep
  `workflow-examples/consumer-repo` adversarial and package-focused.
- Review dependency-closure extraction whenever site example conventions or
  Storybook versions change; consumer artifacts themselves stay
  Storybook-free.
- Refresh the retrieval holdout set and rotate a minority of eval tasks without
  rewriting previously reported cohort scores. Record model/host drift.
- Quarterly, compare CLI/Skill/Markdown outcomes and, if MCP shipped, its
  incremental outcomes plus maintenance cost. Expand or retire a public adapter
  only through a new plan and the compatibility policy established at v1.
- Update `plans/README.md` and this plan's status as units merge. The 2026-08-30
  scope amendment transferred GA/publication review to Plan 003; Plan 001's
  local Unit 07 boundary is complete and this file is now archived.
