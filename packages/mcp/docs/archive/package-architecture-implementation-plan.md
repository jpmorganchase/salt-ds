# Package Architecture Implementation Plan

This plan describes how to move from the current `packages/mcp`-centric implementation to the target split documented in [`future-package-architecture.md`](./future-package-architecture.md).

It is intentionally incremental. The goal is to arrive at the target shape without a long-lived rewrite branch or a breaking reorganization of every current entrypoint at once.

## Outcome

Target package boundaries:

- `packages/semantic-core`
  - internal/private
  - canonical Salt reasoning
- `packages/mcp`
  - public
  - thin MCP adapter over canonical reasoning
- `packages/runtime-inspector-core`
  - internal/private
  - local runtime evidence
- `packages/cli`
  - internal first, possibly public later
  - local operator surface
- `packages/mcp-local-runtime`
  - optional, private, later only if needed

## Non-Goals

- do not publish every package as part of the initial split
- do not rewrite all of `packages/mcp` in one PR
- do not block the CLI on a perfect `semantic-core` extraction
- do not make runtime evidence a dependency of canonical Salt reasoning

## Working Constraints

- the repo already supports new workspace packages through the root `workspaces` setting in [`/package.json`](D:/Work/salt-ds-3/package.json)
- internal packages can stay private, following the pattern in [`package.json`](D:/Work/salt-ds-3/packages/project-conventions-runtime/package.json)
- public package builds already use the shared build flow in [`build.mjs`](D:/Work/salt-ds-3/scripts/build.mjs)
- the current `packages/mcp/src/cli.ts` is the MCP server launcher, not the future user-facing `salt` CLI

## Release Policy

Use this release stance during the migration:

- `@salt-ds/mcp`
  - keep public and backward-compatible where feasible
  - use changesets only when consumer-facing behavior changes
- `semantic-core`
  - private
  - no public changesets
- `runtime-inspector-core`
  - private
  - no public changesets
- `cli`
  - private until a deliberate publication decision is made
  - no public changesets while internal
- `mcp-local-runtime`
  - private if it exists at all

## Recommended Delivery Order

1. freeze boundaries and add internal package scaffolding
2. extract `semantic-core`
3. thin `packages/mcp`
4. build `runtime-inspector-core`
5. build `packages/cli`
6. wire CLI outputs into skills
7. decide later whether any additional packages should be published

## Phase 0. Boundary Freeze And Scaffolding

Goal:

- establish package boundaries before more logic accretes inside `packages/mcp`

Deliverables:

- architecture note in [`future-package-architecture.md`](./future-package-architecture.md)
- this implementation plan
- roadmap references in [`../maintainers/consumer-ai-roadmap.md`](../maintainers/consumer-ai-roadmap.md)
- maintainer rules in [`../maintainers/maintaining-salt-ai-tooling.md`](../maintainers/maintaining-salt-ai-tooling.md)

Implementation steps:

1. keep the docs current as package responsibilities change
2. define default package visibility:
   - `semantic-core`: private
   - `runtime-inspector-core`: private
   - `cli`: private first
3. avoid adding new MCP logic that really belongs in runtime or operator workflows

Exit criteria:

- maintainers have one stable document set to check before moving code

Status:

- mostly complete already
- private package scaffolding and the first runtime-inspector-core result schemas are now in place

## Phase 1. Create Internal Package Scaffolding

Goal:

- create the internal package shells without moving much logic yet

Packages to add:

- `packages/semantic-core`
- `packages/runtime-inspector-core`
- `packages/cli`

Initial package shape:

- `package.json`
  - `private: true`
  - `main: "src/index.ts"`
- `src/index.ts`
- `README.md`

Implementation steps:

1. add package manifests and minimal source entrypoints
2. decide whether these packages need the shared `build.mjs` flow immediately
3. keep them out of consumer docs until they own real behavior

Recommended PR slice:

- `packages: add private scaffolding for semantic-core, runtime-inspector-core, and cli`

Verification:

- workspace install passes
- typecheck passes
- no consumer-facing behavior changes

Exit criteria:

- future code movement has real destinations

Status:

- started
- `packages/semantic-core`, `packages/runtime-inspector-core`, and `packages/cli` now exist as private package shells

## Phase 2. Extract `semantic-core`

Goal:

- make canonical Salt reasoning importable without bringing in MCP server code

Strategy:

- move logic in layers
- keep `packages/mcp` re-exporting functions during the transition
- avoid breaking external imports to `@salt-ds/mcp` while the extraction is in progress

### Phase 2A. Extract Domain Types And Registry Layers

Move first:

- registry build modules from:
  - [`packages/mcp/src/build`](D:/Work/salt-ds-3/packages/mcp/src/build)
- registry loading and cache modules from:
  - [`packages/mcp/src/registry`](D:/Work/salt-ds-3/packages/mcp/src/registry)
- search modules from:
  - [`packages/mcp/src/search`](D:/Work/salt-ds-3/packages/mcp/src/search)
- domain and registry types from:
  - [`types.ts`](D:/Work/salt-ds-3/packages/mcp/src/types.ts)

Keep in `packages/mcp`:

- MCP server types
- MCP request/response adapter types

Recommended PR slices:

1. `semantic-core: move registry and search foundations`
2. `semantic-core: move domain and registry types`
3. `mcp: re-export registry and search APIs from semantic-core`

Verification:

- existing registry tests still pass
- imports inside `packages/mcp` point to `semantic-core`
- `@salt-ds/mcp` exports remain stable

Status:

- started
- `packages/semantic-core` now owns:
  - [`src/types.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/types.ts)
  - [`src/search/pageSearchIndex.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/search/pageSearchIndex.ts)
  - [`src/registry`](D:/Work/salt-ds-3/packages/semantic-core/src/registry)
  - [`src/build`](D:/Work/salt-ds-3/packages/semantic-core/src/build)
- `packages/mcp/src/types.ts`, [`search/pageSearchIndex.ts`](D:/Work/salt-ds-3/packages/mcp/src/search/pageSearchIndex.ts), and the registry helpers now re-export that extracted layer
- `packages/mcp/src/registry/loadRegistry.ts` keeps the MCP-local default registry directory so current consumers still load `packages/mcp/generated`
- `packages/mcp/src/build` now wraps the extracted semantic-core build layer, with [`buildRegistry.ts`](D:/Work/salt-ds-3/packages/mcp/src/build/buildRegistry.ts) preserving the MCP-local default generated output path

### Phase 2B. Extract Canonical Lookup And Search Operations

Move:

- lookup and search tools that are mostly domain logic, such as:
  - [`componentLookup.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/componentLookup.ts)
  - [`pageLookup.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/pageLookup.ts)
  - [`patternLookup.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/patternLookup.ts)
  - [`guideLookup.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/guideLookup.ts)
  - [`guideAwareness.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/guideAwareness.ts)
  - [`searchSaltDocs.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/searchSaltDocs.ts)
  - [`searchApiSurface.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/searchApiSurface.ts)
  - [`searchComponentCapabilities.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/searchComponentCapabilities.ts)

Leave behind:

- presentation formatting
- MCP-specific compacting
- source attribution

Recommended PR slice:

- `semantic-core: move canonical lookup and search operations`

Verification:

- lookup/search tests still pass
- no MCP tool definition changes required yet

Status:

- started
- `packages/semantic-core/src/tools` now owns the extracted lookup/search layer:
  - [`componentLookup.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/componentLookup.ts)
  - [`pageLookup.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/pageLookup.ts)
  - [`patternLookup.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/patternLookup.ts)
  - [`guideLookup.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/guideLookup.ts)
  - [`guideAwareness.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/guideAwareness.ts)
  - [`searchSaltDocs.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/searchSaltDocs.ts)
  - [`searchApiSurface.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/searchApiSurface.ts)
  - [`searchComponentCapabilities.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/searchComponentCapabilities.ts)
  - plus the supporting helper layer under the same folder
- lookup/search behavior still runs through the existing MCP-facing tool surface without changing tool definitions
- `packages/semantic-core/src/tools` now also owns the recommendation and presentation support layer:
  - [`consumerFilters.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/consumerFilters.ts)
  - [`consumerPresentation.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/consumerPresentation.ts)
  - [`solutionPresentation.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/solutionPresentation.ts)
  - [`starterCode.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/starterCode.ts)
  - [`recommendComponent.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/recommendComponent.ts)
  - [`recommendTokens.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/recommendTokens.ts)
  - [`getToken.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getToken.ts)
  - [`getFoundation.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getFoundation.ts)
  - [`listFoundations.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/listFoundations.ts)
  - [`listSaltCatalog.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/listSaltCatalog.ts)
  - [`getRelatedEntities.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getRelatedEntities.ts)
  - [`compareOptions.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/compareOptions.ts)
  - [`guidanceBoundary.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/guidanceBoundary.ts)
  - [`discoverSaltSignals.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/discoverSaltSignals.ts)
- `packages/semantic-core/src/tools` now also owns the first translation-backed orchestration slice:
  - [`getCompositionRecipe.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getCompositionRecipe.ts)
  - [`codeAnalysisCommon.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/codeAnalysisCommon.ts)
  - [`translation/sourceUiArchetypes.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiArchetypes.ts)
  - [`translation/sourceUiContextualHints.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiContextualHints.ts)
  - [`translation/sourceUiDetection.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiDetection.ts)
  - [`translation/sourceUiModel.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiModel.ts)
  - [`translation/sourceUiSemanticMatching.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiSemanticMatching.ts)
  - [`translation/sourceUiTypes.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiTypes.ts)
- `packages/semantic-core/src/tools` now also owns the discovery orchestration layer:
  - [`chooseSaltSolution.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/chooseSaltSolution.ts)
  - [`discoverSalt.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/discoverSalt.ts)
  - [`discoverSaltPresentation.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/discoverSaltPresentation.ts)
- `packages/semantic-core/src/tools` now also owns the validation and migration layer:
  - [`analyzeSaltCode.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/analyzeSaltCode.ts)
  - [`validateSaltUsage.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/validateSaltUsage.ts)
  - [`recommendFixRecipes.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/recommendFixRecipes.ts)
  - [`suggestMigration.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/suggestMigration.ts)
  - [`compareVersions.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/compareVersions.ts)
  - [`compareSaltVersions.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/compareSaltVersions.ts)
  - [`changeUtils.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/changeUtils.ts)
  - [`validation`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/validation)
- `packages/semantic-core/src/tools` now also owns the rest of the translation stack:
  - [`translateUiToSalt.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translateUiToSalt.ts)
  - [`translation/sourceUiConfidence.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiConfidence.ts)
  - [`translation/sourceUiMapping.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiMapping.ts)
  - [`translation/sourceUiPlanning.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiPlanning.ts)
  - [`translation/sourceUiQuestions.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiQuestions.ts)
- `packages/semantic-core/src/tools` now also owns the residual entity and asset lookup layer:
  - [`getComponent.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getComponent.ts)
  - [`getPattern.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getPattern.ts)
  - [`getPage.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getPage.ts)
  - [`getGuide.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getGuide.ts)
  - [`getPackage.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getPackage.ts)
  - [`getExamples.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getExamples.ts)
  - [`getSaltEntity.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getSaltEntity.ts)
  - [`getSaltEntityResolvers.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getSaltEntityResolvers.ts)
  - [`getSaltExamples.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getSaltExamples.ts)
  - [`getChanges.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getChanges.ts)
  - [`getIcon.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getIcon.ts)
  - [`getIcons.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getIcons.ts)
  - [`getCountrySymbol.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getCountrySymbol.ts)
  - [`getCountrySymbols.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getCountrySymbols.ts)
  - [`countrySymbolSearch.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/countrySymbolSearch.ts)

### Phase 2C. Extract Recommendation, Validation, Translation, And Migration Logic

Move:

- recommendation, discovery, validation, migration, and translation logic from the old `packages/mcp/src/tools` layout into `packages/semantic-core/src/tools`
- the translation and validation helper subfolders into `packages/semantic-core/src/tools/translation` and `packages/semantic-core/src/tools/validation`

Refactor while moving:

- separate domain logic from response formatting
- keep named runtime hints centralized and provisional
- keep MCP-specific truncation or presentation in `packages/mcp`

Recommended PR slices:

1. `semantic-core: move getCompositionRecipe plus the translation support it needs`
2. `semantic-core: move chooseSaltSolution and discoverSalt plus remaining discovery presentation helpers`
3. `semantic-core: move validation and migration reasoning`
4. `semantic-core: move translation modules`
5. `mcp: re-export canonical tool functions from semantic-core`

Verification:

- semantic regression tests pass
- translation tests pass
- tool-level tests still pass through `@salt-ds/mcp`

Status:

- started
- the recommendation and presentation support layer already lives in `semantic-core`
- `getCompositionRecipe` plus the shared translation modules it depends on now live in `semantic-core`
- `chooseSaltSolution`, `discoverSalt`, and their shared discovery-presentation helper now live in `semantic-core`
- the validation/migration stack now also lives in `semantic-core`
- the translation stack and `translateUiToSalt` now also live in `semantic-core`
- the residual entity/example/icon/country lookup helpers now also live in `semantic-core`
- Phase 2 is effectively complete
- Phase 3 is now started:
  - [`packages/semantic-core/src/tools/index.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/index.ts) provides the canonical tools barrel
  - the dead `packages/mcp/src/tools` wrapper surface has been removed, so canonical tool access now comes from the root `@salt-ds/mcp` export instead of deep wrapper paths
  - [`packages/mcp/src/index.ts`](D:/Work/salt-ds-3/packages/mcp/src/index.ts) is now a curated public surface that exposes the seven canonical tool functions, core types, registry helpers, and MCP server entrypoints rather than re-exporting all of `semantic-core`
  - MCP-only tool registration metadata now lives in [`packages/mcp/src/server/toolDefinitions.ts`](D:/Work/salt-ds-3/packages/mcp/src/server/toolDefinitions.ts), with registration and structured tool result shaping in [`packages/mcp/src/server/registerTools.ts`](D:/Work/salt-ds-3/packages/mcp/src/server/registerTools.ts) and a dedicated server barrel in [`packages/mcp/src/server/index.ts`](D:/Work/salt-ds-3/packages/mcp/src/server/index.ts)
  - the cross-package TypeScript settings in [`packages/mcp/package.json`](D:/Work/salt-ds-3/packages/mcp/package.json) remain intentional because declaration generation still needs to bundle semantic-core source into the published `@salt-ds/mcp` package
  - the published package now uses an `exports` map so only the curated root API is public; deep `server/*` and helper paths are internal by policy and by packaging

Exit criteria for Phase 2:

- canonical Salt reasoning can be imported from `semantic-core`
- `packages/mcp` no longer owns most of the design-system brain

## Phase 3. Thin `packages/mcp`

Goal:

- make `packages/mcp` mostly transport, tool registration, and agent-facing response shaping

Keep in `packages/mcp`:

- [`server`](D:/Work/salt-ds-3/packages/mcp/src/server)
- MCP-only tool registration metadata in [`server/toolDefinitions.ts`](D:/Work/salt-ds-3/packages/mcp/src/server/toolDefinitions.ts)
- MCP-only tool registration and result shaping in [`server/registerTools.ts`](D:/Work/salt-ds-3/packages/mcp/src/server/registerTools.ts)
- MCP launcher in [`cli.ts`](D:/Work/salt-ds-3/packages/mcp/src/cli.ts)
- source attribution and compact response helpers
- the curated MCP root export that exposes the supported public package API

Refactor targets:

- slim down [`index.ts`](D:/Work/salt-ds-3/packages/mcp/src/index.ts)
- keep the server-facing entrypoints explicit under [`server`](D:/Work/salt-ds-3/packages/mcp/src/server)
- split remaining mixed files where they still combine semantics and presentation

Recommended PR slices:

1. `mcp: reduce index exports to server plus semantic-core re-exports`
2. `mcp: add explicit server-facing entrypoints and remove dead wrapper surfaces`
3. `mcp: audit imports so no semantic code depends on server or CLI launcher code`

Verification:

- server tests pass
- tool definition tests pass
- external `@salt-ds/mcp` API stays coherent

Exit criteria:

- `packages/mcp` is clearly an agent-facing adapter, not the main owner of canonical logic
- `@salt-ds/mcp` root exports are intentionally smaller than `semantic-core`
- the remaining cross-package build settings are documented as intentional rather than temporary drift
- the published package enforces the root-only public contract with an `exports` map

## Phase 4. Build `runtime-inspector-core`

Goal:

- add a local evidence engine without mixing policy into the MCP

Scope:

- URL inspection
- screenshots
- runtime and console errors
- accessibility/landmark summaries
- support bundle artifacts

Design requirements:

- structured JSON outputs first
- no canonical Salt judgments
- no dependency on MCP code
- safe redaction defaults for support bundles

First design step:

- define schemas for:
  - doctor result
  - runtime inspect result

Recommended PR slices:

1. `runtime-inspector-core: add result schemas and types`
2. `runtime-inspector-core: add URL inspection and screenshot/artifact support`
3. `runtime-inspector-core: add runtime error and accessibility summaries`
4. `runtime-inspector-core: add doctor checks and support bundle output`

Verification:

- unit tests for result schemas
- fixture or integration tests for inspection output shape
- no Salt policy in outputs

Exit criteria:

- local runtime evidence can be generated without going through MCP or CLI text parsing

Status:

- started at the schema level
- initial doctor and runtime-inspect result schemas now live in `packages/runtime-inspector-core`
- runtime-inspect now covers browser-session evidence with screenshots, runtime/page errors, and fetched-html fallback
- doctor now covers runtime target reachability and support-bundle artifact generation

## Phase 5. Build `packages/cli`

Goal:

- add the operator-facing `salt` CLI on top of runtime-inspector-core

V1 commands:

- `salt doctor`
- `salt runtime inspect <url>`

Preferred fallback direction after V1:

- prefer adding a thin semantic query surface over `semantic-core`
- avoid introducing a separate exported AI artifact unless a real non-shell, non-MCP use case still requires one later

CLI requirements:

- human-readable output
- `--json`
- stable exit codes
- output directory/artifact flags
- clear failure modes when no runtime target exists

Recommended PR slices:

1. `cli: add command shell and json output conventions`
2. `cli: add salt doctor`
3. `cli: add salt runtime inspect <url>`
4. `cli: document CLI usage and support workflow`
5. `cli/dx: validate the CLI from a separate consumer repo and simplify the temporary private install path`

Implementation notes:

- do not parse human CLI text from other packages
- invoke `runtime-inspector-core` directly
- if semantic commands are ever added later, call `semantic-core` directly
- make the separate-repo smoke path agent-neutral by default:
  - verify MCP installation and tool serving
  - verify generic local skill installation into `.agents/skills`
  - verify local `salt` CLI invocation
- do not assume `CODEX_HOME` or any one editor host as the default skill target
- treat Codex-, Copilot-, or other client-specific smoke checks as optional follow-on coverage rather than the primary consumer validation path

Verification:

- CLI smoke tests
- JSON schema conformance tests
- docs examples verified against real command behavior

Exit criteria:

- the repo has a usable local fallback/operator surface even where MCP is unavailable
- the CLI has a repeatable separate-repo smoke-test path built on portable surfaces instead of one specific agent host

Status:

- started
- `salt doctor` now exists as a working CLI command backed by `runtime-inspector-core`
- `salt doctor` now includes runtime target reachability checks plus support-bundle output for doctor, manifest, and Salt config summaries
- `salt runtime inspect <url>` now prefers browser-session inspection with screenshots and runtime errors, and falls back to fetched-HTML mode when browser-session inspection is unavailable
- an agent-neutral separate-repo smoke path now exists in [`../../../scripts/consumerRepoSmoke.mjs`](../../../scripts/consumerRepoSmoke.mjs)
  - it validates local `@salt-ds/mcp`, local `@salt-ds/cli`, generic `.agents/skills` installation, the public manual CLI (`salt doctor`, `salt runtime inspect`, `salt lint`), and the hidden workflow transport together
  - it avoids assuming `CODEX_HOME` or any one editor host as the default consumer environment

## Phase 5A. Add `salt lint`

Goal:

- expose a local Salt validation command that reuses canonical `semantic-core` checks without requiring MCP

Initial command shapes:

- `salt lint .`
- `salt lint src`
- `salt lint src/components/App.tsx`
- `salt lint src --json`

V1 scope:

- resolve file and directory targets
- scan for likely Salt-bearing source files
- run existing validation and migration-aware reasoning from `semantic-core`
- report:
  - deprecated Salt usage
  - invalid or risky Salt composition
  - migration-relevant findings
  - recommended next action

Non-goals for V1:

- autofix or codemod behavior
- general non-Salt linting
- CLI-only policy rules that diverge from `semantic-core`
- project-conventions merge execution beyond reporting when a second pass may be needed

Implementation notes:

- call `semantic-core` directly rather than shelling out to MCP
- keep file discovery and output rendering in `packages/cli`
- keep canonical issue detection in `semantic-core`
- prefer stable JSON output so skills and CI can consume the results later

Recommended PR slices:

1. `cli: add lint command shell and target resolution`
2. `cli: bridge salt lint to semantic-core validation for file and directory targets`
3. `cli: add json and human-readable lint result rendering`
4. `cli: add lint fixtures plus consumer smoke or fixture coverage`

Verification:

- fixture tests for file and directory target resolution
- JSON contract tests for lint output
- at least one smoke or integration path proving `salt lint` works from a consumer-style repo target

Exit criteria:

- shell-capable agents and humans can run a local Salt validation pass without MCP
- `salt lint` remains a thin CLI surface over canonical `semantic-core` logic
- the command is usable inside build, review, and migration workflows without becoming a second rulebook

Status:

- started
- all four initial slices are now in place:
  - `salt lint` now resolves file and directory targets into likely Salt-bearing source files
  - `salt lint` now calls canonical `semantic-core` validation and migration-aware checks
  - `salt lint` now emits both human-readable and JSON output
  - `salt lint` now has consumer-style smoke coverage through [`../../../scripts/consumerRepoSmoke.mjs`](../../../scripts/consumerRepoSmoke.mjs)
- the next follow-up is only to keep the existing workflow transport minimal and aligned with the skills contract

## Phase 5B. Add Semantic CLI Queries

Goal:

- expose a restricted-environment Salt workflow transport through the CLI from `semantic-core` without enlarging the public manual CLI story

Initial transport coverage:

- discovery and recommendation
- entity and example lookup
- translation and upgrade analysis

Design requirements:

- call `semantic-core` directly
- return concise human output plus `--json`
- do not create a second source of truth outside `semantic-core`
- keep the public manual CLI small and aligned with the intended consumer model

Recommended PR slices:

1. `cli: add semantic query command shell over semantic-core`
2. `cli: add internal workflow transport commands over semantic-core`
3. `cli: add JSON contract tests for hidden workflow transport`
4. `docs: keep the public manual CLI small and teach skills plus CLI as the non-MCP fallback`

Exit criteria:

- the CLI provides a coherent restricted-environment transport without requiring a separate exported artifact
- skills can teach shell-capable agents when to use MCP versus hidden CLI transport

Status:

- started
- the public manual CLI remains limited to `salt doctor`, `salt runtime inspect`, and `salt lint`
- hidden CLI transport commands now cover:
  - discovery and recommendation
  - entity and example lookup
  - translation and upgrade analysis
- the consumer smoke harness now exercises both the manual CLI surface and the hidden workflow transport from a separate repo

## Phase 5C. Add A Salt UI Debug/Fix Workflow

Goal:

- make existing Salt UI bug-fix tasks more reliable than the current broad review path

Why this is separate from broad review:

- debugging an existing broken screen is an inverse problem
- the workflow needs a tighter loop:
  - isolate the broken region
  - resolve the canonical Salt target
  - inspect wrappers and local layout context
  - validate source
  - inspect runtime only if needed
  - return a smallest credible fix plus verification status

Recommended shape:

- do not create a new skill immediately
- first expand [`salt-ui-reviewer`](D:/Work/salt-ds-3/packages/skills/skills/salt-ui-reviewer/SKILL.md) with a dedicated debug/fix track
- only split into `salt-ui-debugger` later if real usage shows a materially different workflow

Implementation slices:

1. `reviewer: add explicit debug/fix mode`

   - trigger when the task is framed as:
     - fix this alignment
     - why is this centered wrong
     - why is this navigation off
     - why is this layout broken
   - shift the response shape toward:
     - root cause
     - smallest credible fix
     - validation and verification

2. `reviewer references: add fix-oriented runbooks`

   - add worked examples for:
     - dashboard and metric composition issues
     - navigation centering and shell alignment
     - wrapper/layout conflicts
     - wrong primitive choice such as `Button` vs `Link`

3. `skills/docs: teach the fix loop explicitly`

   - classify as a Salt UI fix/debug task
   - selection and grounding first
   - source validation second
   - runtime evidence only if source-level reasoning is still insufficient

Verification:

- updated skill examples cover real debug/fix tasks
- the reviewer output template distinguishes broad review from narrow root-cause debugging

Status:

- started
- [`salt-ui-reviewer`](D:/Work/salt-ds-3/packages/skills/skills/salt-ui-reviewer/SKILL.md) now has an explicit debug/fix mode for narrow UI bug tasks
- the dedicated workflow reference now lives in [`debug-workflow.md`](D:/Work/salt-ds-3/packages/skills/skills/salt-ui-reviewer/references/debug-workflow.md)
- reviewer guidance now teaches:
  - root cause first
  - smallest credible fix next
  - verification surface and remaining checks afterward

Exit criteria:

- reviewer can handle narrow Salt UI bug-fix tasks without falling back to generic review phrasing
- the workflow consistently separates:
  - canonical Salt guidance
  - local wrappers/conventions
  - runtime evidence

## Phase 5D. Expand Runtime Layout-Debug Evidence

Goal:

- make `salt runtime inspect <url>` more useful for layout and alignment debugging

Current gap:

- the runtime CLI already provides structure, roles, screenshots, and runtime errors
- it is still weak for CSS and box-model debugging

Target evidence additions:

- computed style summaries for the inspected node and key parents
- bounding boxes
- flex/grid parent-chain summaries
- alignment and overflow hints where feasible
- selector provenance only if it can be added without turning the tool into a browser devtools clone

Implementation slices:

1. `runtime-inspector-core: add layout-debug result schema`
2. `runtime-inspector-core: capture computed style and box summaries`
3. `runtime-inspector-core: add flex/grid ancestry summaries`
4. `cli/docs/skills: document when to use layout-debug evidence versus source-level fixes`

Status:

- started
- the runtime inspect result schema now includes a dedicated layout-evidence payload
- browser-session inspection now captures:
  - computed style summaries
  - bounding boxes
  - flex/grid ancestry
  - alignment and overflow hints
- fetched-html inspection now reports layout-debug evidence as unavailable instead of implying browser-session parity
- CLI/runtime tests and the consumer smoke path now validate the new payload shape

Guardrails:

- keep the output evidence-only
- do not make runtime inspect a policy engine
- do not block simpler workflows on fully solving browser-devtools-style inspection

Verification:

- integration tests for layout-debug payload shape
- at least one consumer-style smoke or fixture path for alignment debugging

Exit criteria:

- runtime inspection can explain common layout-debug questions better than screenshots alone
- fix-oriented skills can cite concrete runtime evidence when diagnosing centering, spacing, or shell-layout bugs

## Phase 5E. Re-Center Token Policy On Real Source Docs

Goal:

- remove dependence on duplicated token-summary guidance and make token correctness come from generated policy extracted from the real Salt docs

Why this is needed:

- the generated token registry already contains:
  - deprecation state
  - direct-use policy
  - usage-tier policy
  - docs links
- but validation does not yet enforce all of that generic policy
- a cross-cutting token summary route is a weak source of truth if it mainly duplicates the real foundation and characteristic docs

Working rule:

- theme, characteristic, and foundation docs remain the canonical human source
- generated token metadata remains the canonical machine-readable source
- any cross-cutting token summary route is optional summary material only

Implementation slices:

1. `token policy audit`

   - compare generated token policy fields against the real docs they point to
   - identify which rules are already captured generically and which are still only implied in prose

2. `validation: enforce generic deprecated-token policy`

   - flag deprecated token use wherever source analysis sees `--salt-*` references
   - keep this driven by generated token metadata, not by hand-written token-name lists

3. `build extraction: expand structured token policy where the docs support it`

   - extend token policy extraction from characteristic and foundation docs
   - prefer generic fields such as:
     - structural role
     - preferred uses
     - avoid uses
     - companion or pairing guidance
   - only add fields that can be justified from real docs

4. `validation: consume broader structured token policy`

   - use generated policy to catch wrong direct-use or family mistakes more generically
   - avoid narrow border-only or token-name-specific rules unless the docs still cannot express the distinction

5. `docs cleanup`

   - reduce wording that makes token-summary routes look like the primary source of truth
   - point maintainers back to the real docs plus generated policy

Status:

- started
- source validation now flags deprecated token use generically from generated token metadata
- token lookup and recommendation no longer inject the cross-cutting token-summary route by default when generated policy docs do not include it
- generated token policy now prefers the specific foundation or characteristic docs plus the design-tokens index
- generated token policy now carries the first structured semantics derived from the real docs:
  - structural roles for border thickness, separator colors, and default border styles
  - container pairing metadata for same-level background and border tokens
- source validation now consumes that structured policy for border-thickness, container-pairing, and separator checks instead of depending only on token-name parsing
- first audited family batch:
  - `extract now`: `content` (narrow static/default foreground roles only), `overlayable`
  - `docs first`: `actionable`, `target`
  - `guidance only`: `navigable`
- focused regression tests now cover:
  - generated token policy docs
  - deprecated-token validation
  - token lookup and recommendation doc surfaces

Guardrails:

- do not add agent-only docs whose main job is to be easier for the model to read
- do not solve token drift by teaching more token policy in skills
- do not hand-maintain token rule tables when the rule can be extracted from docs and metadata

Verification:

- targeted validation tests for deprecated-token findings
- registry integration tests for generated token policy fields
- tool-level tests showing the MCP or CLI uses generated policy data instead of duplicated summary prose

Exit criteria:

- deprecated token use is caught generically
- token policy enforcement depends on generated structured policy rather than duplicated token-summary docs
- maintainers no longer need to treat a cross-cutting token-summary route as the policy authority for AI tooling

## Phase 6. Structural Cleanup Without More Package Splits

Goal:

- reduce the remaining large-file hotspots in `semantic-core`, `runtime-inspector-core`, tests, and skills without reopening the package-boundary work

Working rule:

- this phase is about module boundaries, not new packages

### Phase 6A. Split Validation Core

Primary target:

- [`validateSaltUsage.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/validateSaltUsage.ts)

Recommended shape:

- `validation/detect*`
  - canonical issue detection
- `validation/synthesize*`
  - fix and migration recommendation synthesis
- `validation/present*` or equivalent helper layer
  - final result shaping

Guardrail:

- keep the public validation API stable while the internals move

Acceptance:

- `validateSaltUsage.ts` becomes a smaller orchestration file rather than the implementation bucket

Status:

- started and materially complete
- [`validateSaltUsage.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/validateSaltUsage.ts) is now a smaller orchestration file
- the extracted internals now live in:
  - [`validateSaltUsageHelpers.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/validation/validateSaltUsageHelpers.ts)
  - [`validateSaltUsageJsx.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/validation/validateSaltUsageJsx.ts)
  - [`validateSaltUsageStyle.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/validation/validateSaltUsageStyle.ts)
- code-analysis and registry integration tests still pass through the existing public API

### Phase 6B. Split Recommendation And Translation Decision Kernels

Primary targets:

- [`discoverSalt.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/discoverSalt.ts)
- [`chooseSaltSolution.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/chooseSaltSolution.ts)
- [`compareOptions.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/compareOptions.ts)
- [`getCompositionRecipe.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getCompositionRecipe.ts)
- [`sourceUiSemanticMatching.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiSemanticMatching.ts)

Recommended split:

- query and source-signal normalization
- ranking and comparison
- acceptance and fallback decisions
- explanation and result shaping

Guardrail:

- keep heuristics centralized rather than scattering them into many small files

Acceptance:

- the decision layer is broken into smaller kernels that can be tested directly

Status:

- started and materially complete for the highest-churn files
- [`discoverSalt.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/discoverSalt.ts) now delegates private routing, clarification, and related-entity helpers to [`discoverSaltHelpers.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/discoverSaltHelpers.ts)
- [`chooseSaltSolution.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/chooseSaltSolution.ts) now delegates private solution-type, ranking, and comparison helpers to [`chooseSaltSolutionHelpers.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/chooseSaltSolutionHelpers.ts)
- [`sourceUiSemanticMatching.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiSemanticMatching.ts) is now a thin semantic-index module over [`sourceUiSemanticSignals.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/translation/sourceUiSemanticSignals.ts)
- the main remaining kernel work is now [`compareOptions.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/compareOptions.ts) and [`getCompositionRecipe.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/getCompositionRecipe.ts)

Remaining slice plan:

1. `compareOptions`

   - extract candidate resolution helpers
   - extract scoring and difference helpers
   - keep [`compareOptions.ts`](D:/Work/salt-ds-3/packages/semantic-core/src/tools/compareOptions.ts) as orchestration plus final result assembly
   - verify with component and pattern comparison tests

2. `getCompositionRecipe`
   - extract pattern-alignment intent and scoring helpers
   - extract fallback recipe and next-step helpers
   - keep supporting-example, follow-up, and starter-code formatting separate from ranking logic
   - verify with recipe and translation-adjacent recommendation tests

### Phase 6C. Split Runtime Doctor Internals

Primary target:

- [`doctor.ts`](D:/Work/salt-ds-3/packages/runtime-inspector-core/src/doctor.ts)

Recommended split:

- environment and package checks
- runtime target and reachability checks
- support bundle writing

Priority:

- after Phase 6A and 6B unless `doctor.ts` starts blocking feature work

Remaining slice plan:

1. extract environment and package-manifest checks
2. extract runtime-target detection and reachability checks
3. extract support-bundle and manifest-writing helpers
4. keep [`doctor.ts`](D:/Work/salt-ds-3/packages/runtime-inspector-core/src/doctor.ts) as orchestration plus result assembly

### Phase 6D. Split Giant AI Workflow Tests

Primary targets:

- [`tools.spec.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/tools.spec.ts)
- [`codeAnalysisTools.spec.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/codeAnalysisTools.spec.ts)
- [`translationModules.spec.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/translationModules.spec.ts)

Recommended split:

- lookup and search
- recommendation and discovery
- validation and migration
- translation
- runtime-assisted CLI workflows where relevant

Acceptance:

- failures localize to one workflow family instead of a large mixed suite

Status:

- started and materially complete for code-analysis workflows
- validation/migration tests now stay in [`codeAnalysisTools.spec.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/codeAnalysisTools.spec.ts)
- remediation and analysis tests now live in [`codeAnalysisRecipes.spec.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/codeAnalysisRecipes.spec.ts)
- the next workflow-spec targets are still [`tools.spec.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/tools.spec.ts) and [`translationModules.spec.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/translationModules.spec.ts)

Remaining slice plan:

1. `finish code-analysis fixture consolidation`

   - move the remaining inline registry fixture in [`codeAnalysisTools.spec.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/codeAnalysisTools.spec.ts) onto [`codeAnalysisRegistry.ts`](D:/Work/salt-ds-3/packages/mcp/src/__tests__/fixtures/codeAnalysisRegistry.ts)
   - keep recipe and validation suites sharing the same registry source

2. `split tools.spec`

   - `tools.lookup.spec.ts`
   - `tools.entities.spec.ts`
   - `tools.consumer.spec.ts`
   - `tools.public.spec.ts`
   - move shared registry setup into a fixture file instead of repeating large inline records

3. `split translationModules.spec`

   - `translation.detect.spec.ts`
   - `translation.plan.spec.ts`
   - `translation.semantic.spec.ts`
   - keep grouped-flow regressions close to semantic matching rather than generic planning tests

4. `only after those`
   - decide whether any remaining mixed suites still need further decomposition

### Phase 6E. Centralize Shared Skill Workflow Policy

Goal:

- stop repeating the MCP-first, CLI-semantic-fallback, runtime-evidence-last rule across several skill files

Recommended shape:

- one shared reference file for the core workflow contract
- builder, reviewer, and migration skills reference it rather than restating it fully

Guardrail:

- keep the top-level skills readable; move only duplicated policy, not skill-specific guidance

Status:

- started and materially complete
- the shared workflow contract now lives in [`canonical-salt-tool-surfaces.md`](D:/Work/salt-ds-3/packages/skills/references/canonical-salt-tool-surfaces.md)
- builder, reviewer, and migration top-level skills now load that shared reference instead of carrying their own full copies of the MCP-first, CLI-semantic-fallback, runtime-evidence-last policy

## Immediate Next Structural PR Order

1. `mcp: finish shared fixture cleanup for code-analysis specs`
2. `semantic-core: split compareOptions comparison helpers`
3. `semantic-core: split getCompositionRecipe pattern-alignment helpers`
4. `mcp: split tools.spec by workflow family`
5. `mcp: split translationModules.spec by translation stage`
6. `runtime-inspector-core: split doctor internals if still warranted`

- the hidden workflow transport supports human-readable and JSON output plus shared registry resolution
- the current consumer smoke harness now exercises the manual CLI surface plus the hidden workflow transport from a separate repo
- the next follow-up is deciding how much hidden workflow transport still earns its keep once restricted-environment patterns settle

## Phase 7. Wire CLI Evidence Into Skills

Goal:

- use runtime evidence as a second-pass input to skills without turning it into policy

Skills to update:

- [`salt-ui-reviewer`](D:/Work/salt-ds-3/packages/skills/skills/salt-ui-reviewer/SKILL.md)
- [`salt-ui-builder`](D:/Work/salt-ds-3/packages/skills/skills/salt-ui-builder/SKILL.md)
- [`salt-migration-helper`](D:/Work/salt-ds-3/packages/skills/skills/salt-migration-helper/SKILL.md)

Workflow shape:

1. use Salt MCP semantic tools first
2. implement or analyze the code change
3. if runtime confidence is still needed, call `salt doctor` or `salt runtime inspect`
4. feed structured evidence back into reasoning
5. ask explicitly before destructive cleanup such as removing CSS overrides or migration shims

Recommended PR slices:

1. `skills/docs: keep build, review, and migration guidance aligned with the current CLI capability boundary`
2. `skills: expand runtime-assisted examples once browser-session evidence exists`
3. `skills: add richer runtime-assisted outputs once the CLI can produce browser-session evidence and screenshots`

Verification:

- skill docs and examples stay aligned with actual CLI commands
- runtime evidence is described as evidence, not canonical Salt truth

Exit criteria:

- skills can consume structured local evidence without bloating the core MCP

Status:

- started
- `salt-ui-builder`, `salt-ui-reviewer`, and `salt-migration-helper` now describe `salt doctor` and `salt runtime inspect <url>` as optional second-pass local evidence
- the shared docs plus builder/reviewer/migration references now include explicit browser-session and fetched-html fallback examples
- the remaining work here is to keep those examples aligned as the CLI grows beyond the first operator commands

## Phase 8. Optional Publication And Runtime MCP Bridge

Goal:

- decide later whether any additional surfaces should become public or MCP-accessible

Potential follow-up decisions:

- publish `packages/cli` if it becomes a supported operator tool
- keep `runtime-inspector-core` private even if CLI becomes public
- only add `packages/mcp-local-runtime` if a real shell-less client needs local runtime access
- only add a generated static AI artifact if a real non-shell, non-MCP fallback still needs one after the CLI transport story is settled

Recommended PR slices:

1. `cli: publication readiness review`
2. `runtime bridge: add thin mcp-local-runtime wrapper only if required`

Exit criteria:

- publication decisions are deliberate and justified by real consumers rather than by architecture purity

## Cross-Cutting Test Plan

Keep tests split by responsibility:

- `semantic-core`
  - semantic regression tests
  - translation tests
  - validation tests
  - registry integration tests
- `mcp`
  - server wiring tests
  - tool definition tests
  - response-shaping tests
- `runtime-inspector-core`
  - schema tests
  - inspection-result tests
  - artifact/output tests
- `cli`
  - command parsing tests
  - snapshot or text contract tests for human output
  - JSON contract tests

During the extraction, it is acceptable to keep tests physically in `packages/mcp/src/__tests__` for a while, but the ownership boundary should be updated in the test naming and import structure as code moves.

## Risk Register

Main risks:

- `semantic-core` extraction becomes a rewrite instead of a migration
- CLI work is blocked on perfect package separation
- runtime evidence starts to make canonical Salt judgments
- `@salt-ds/mcp` compatibility breaks during internal moves
- too many internal packages become accidental public APIs
- a generated fallback artifact becomes a second source of truth instead of a projection of `semantic-core`

Mitigations:

- keep `packages/mcp` re-exporting during the transition
- land changes in small PR slices
- keep runtime schemas policy-free
- keep internal packages private
- use focused regression tests before each larger move

## Immediate Next PRs

If starting from today, the next concrete implementation sequence should be:

1. `cli/dx: add a real separate-repo smoke test for MCP + skills + CLI`
   - completed with [`../../../scripts/consumerRepoSmoke.mjs`](../../../scripts/consumerRepoSmoke.mjs)
2. `cli/dx: simplify the temporary cross-repo install path while the CLI remains private`
3. `cli: add salt lint`
4. `cli: add a thin semantic query surface over semantic-core`
5. `cli: reintroduce project-conventions validation through the main salt CLI`
   - remove `salt-project-conventions doctor` from the external consumer path while the helper remains unpublished
   - bring it back later as a main CLI command such as `salt conventions doctor` or a scoped conventions check under `salt doctor`
6. `docs/skills: keep workflow guidance aligned with the current CLI capability boundary`
7. `cli: follow-on codemod and migration commands once the first operator surface is stable`

That path gets to visible progress quickly without taking on the whole extraction in one step.
