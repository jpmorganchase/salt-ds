# AI Tooling Large Rewrite Plan

Status: active proposed rewrite path; Phase 0 frozen, Phase 1 support surface landed, and the first Phase 2/3 create changes are in repo
Date: April 22, 2026
Owner: AI tooling maintainers

## Purpose

This document defines the preferred path if the team is willing to do one more large internal rewrite before broader rollout.

It keeps the public Salt product story stable while replacing the remaining overgrown `create` internals with a clearer architecture:

- registry-first for context
- workflow-first for safety
- skill-led for orchestration

Use this document to answer:

- what gets rewritten versus preserved
- which public APIs stay stable
- what changes in semantic-core, MCP, CLI, and skills
- what old logic should be deleted rather than ported forward
- how to migrate without reopening the public product story again

Read this with:

- [`./ai-tooling-winning-foundation.md`](./ai-tooling-winning-foundation.md)
- [`./ai-tooling-change-review-rubric.md`](./ai-tooling-change-review-rubric.md)
- [`./public-api-matrix.md`](./public-api-matrix.md)

## Recommendation

If the team accepts one more large rewrite, prefer this plan over continued incremental `create` hardening.

Why:

- the compact `v1` workflow contract is now the only public workflow contract
- the remaining failures cluster in the same place:
  - rich `create` paths
  - mixed owner versus supporting-surface prompts
  - pattern versus component overreach
  - duplicated resolution logic across compact and full
- more local ranking patches would improve cases, but they would not make the system simpler

The rewrite should be:

- large internally
- small publicly
- strict about deletions

## Current Progress

Repo-local progress now in place:

- Phase 0 benchmark freeze is checked in through:
  - [`../src/__tests__/fixtures/create-catalog-benchmark.json`](../src/__tests__/fixtures/create-catalog-benchmark.json)
  - [`../src/__tests__/createCatalogSupport.spec.ts`](../src/__tests__/createCatalogSupport.spec.ts)
- the first support-surface slice of Phase 1 is now live:
  - semantic-core exposes a stable retrieval catalog support contract
  - CLI exposes support inspection through `salt-ds info --json --catalog-query`, `--entity`, and `--family`
  - MCP exposes `salt://catalog/manifest`, `salt://catalog/entity/{name}`, `salt://catalog/candidates/{query}`, and `salt://catalog/family/{family}`
  - entity summaries now expose aliases, route slugs, related/supporting surfaces, source-backed counts, and family/category groupings for stronger host-side inspection
- the public workflow story is unchanged:
  - compact `create` still owns workflow routing
  - the new support surface is additive only
- the first architecture simplification step is now live:
  - recommend-mode `create` resolves owner facts through the compact path first
  - full-mode `create` now enriches that resolved owner instead of re-running owner selection
  - compact/full parity coverage now exists for mixed-surface prompts and the old empty-`request` regression path
  - create owner resolution now lives in a shared resolve module consumed by both `create` and public-contract derivation
  - create enrichment now lives in a distinct enrichment module instead of an inline full-mode helper
  - the supported skill path now teaches `compact -> retrieval support -> exact follow-through -> full only when needed`
  - MCP-facing descriptions now state capability and boundary, while richer sequencing lives in the skill and shared transport guidance
  - resolve-layer owner arbitration now prefers explicit anchored surfaces and hint-aligned candidates when raw retrieval drifts
  - the frozen retrieval benchmark once again covers realistic `Content status`, `Tabs`, `Table`, `Switch`, `Metric`, and `App header` owner cases

Still intentionally not done:

- `create` has not been cut over to a fully standalone resolve engine for every internal path yet
- the enrichment layer is split out, but it still enriches inside the main `create` workflow instead of through a fully separate engine contract
- the skill and host orchestration rewrite is only partially landed

## Immediate Backlog

The next retrieval-first slices should stay narrow and cumulative:

1. finish the support surface before touching `create` again
   - expose family/category browsing everywhere the catalog is available
   - keep entity summaries rich enough that hosts can inspect candidates without requesting `full create`
   - add retrieval evals that grade owner quality, support quality, and evidence quality directly
   - close the remaining raw-retrieval ambiguity for multi-state regional prompts such as `Content status` versus single-state components, even though the resolved owner is now stable
2. move more semantics into generated artifacts
   - keep runtime scoring generic
   - reduce handwritten runtime intent classes and duplicate branches
3. keep `create` thin
   - compact chooses owner and next action from retrieval evidence
   - full only enriches the compact decision
4. keep orchestration in the skill and host path
   - compact first
   - retrieval support second
   - exact follow-through third
   - `full` only when the compact result and support surface say deeper artifacts are needed

## Stable Public Decisions

These decisions should remain stable through the rewrite:

### Keep

- `salt_workflow_v1` as the public workflow contract
- the workflow-first product story:
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
- the workflow-first default MCP surface plus read-only Salt support tools
- one public CLI
- one public skill
- compact as the authoritative workflow contract
- full as additive-only

### Do Not Add

- new default public workflow names
- a larger default MCP tool list
- a raw catalog dump as the main front door
- a second “smart create” public mode

### Allowed Additions

- retrieval or catalog support surfaces behind MCP resources or resource templates
- advanced CLI inspection flags under support-oriented behavior
- richer skill guidance for sequencing and decomposition

## Core Diagnosis

The current failures are not evidence that the public workflow model is wrong.

They are evidence that the internal `create` stack still mixes too many concerns:

- candidate retrieval
- owner selection
- pattern versus component arbitration
- composition inference
- rich artifact generation
- follow-through planning

The winning rewrite separates those concerns and gives each one one job.

## Target Architecture

The rewritten system should be split into six layers.

### 1. Canonical Source Layer

Source of truth remains:

- Salt docs
- category maps
- extracted examples
- starter metadata only where extraction still needs a fallback

This layer owns:

- entity identity
- `when_to_use`
- `when_not_to_use`
- anatomy
- composition constraints

### 2. Retrieval Index Layer

Build a first-class retrieval artifact from canonical Salt sources.

Each candidate document should carry:

- entity name
- entity type
- canonical aliases only
- category and family tags
- `when_to_use`
- `when_not_to_use`
- starter availability
- supporting-surface hints
- source-backed evidence fields
- provenance

This layer answers:

- what are the plausible Salt candidates for this prompt
- why are they plausible
- what is the owner-likelihood of each candidate

### 3. Resolve Engine

The resolve engine should consume the retrieval artifact and return:

- top ranked candidates
- chosen owner when confidence is strong enough
- `match_status`
- confidence and ambiguity markers
- deterministic blockers
- deterministic next action

This is the only place owner selection should happen.

### 4. Workflow Contract Layer

The workflow layer should translate the resolve result into `salt_workflow_v1`.

Its job is not to search again.

It should expose:

- request facts
- resolved owner
- blockers
- action
- summary

Compact `create` should stop here.

### 5. Enrichment Layer

The enrichment layer should accept an already-resolved owner and only then add:

- starter code
- composition detail
- richer examples
- implementation notes
- provenance detail

It must never:

- change owner
- change `match_status`
- empty or rewrite `request`
- broaden into a new plan because full mode was requested

### 6. Orchestration Layer

The orchestration layer belongs in:

- the `salt-ds` skill
- host guidance
- CLI support behavior

This layer decides:

- compact-first branching
- when to inspect candidates
- when to ask for full output
- when to follow supporting surfaces after the owner is grounded

## Public API Shape After Rewrite

### Compact `create`

Compact remains the routing contract.

It should always answer:

- what is the likely owner
- how strong is that match
- what blocks safe completion
- what the next safe action is

If grounding is weak:

- stay partial or blocked
- return a grounded next action
- optionally point the host at retrieval support

### Full `create`

Full should be compact plus `details`.

It should never be a second decision engine.

Rules:

1. same owner as compact
2. same `match_status` as compact
3. same blocker truth as compact
4. same action truth as compact
5. richer artifacts only after those facts are stable

### MCP Support Surface

Keep the six workflow tools.

Add retrieval support through resources or resource templates such as:

- `salt://catalog/candidates/{query}`
- `salt://catalog/entity/{name}`
- `salt://catalog/family/{family}`

The capability manifest should advertise:

- support-surface availability
- retrieval contract version
- full-mode additive-only behavior

### CLI Support Surface

Keep the default workflow CLI stable.

Preferred additions:

- `salt-ds info --json --catalog-query "<prompt>"`
- `salt-ds info --json --entity "<name>"`

Those should expose support context without turning `create` into a second search UI.

### Skill Surface

The skill should become more explicit about:

- compact-first workflow
- when to inspect candidates
- when to request full output
- when to decompose mixed prompts
- when to stop instead of guessing

## What Gets Deleted

This rewrite should remove old complexity, not preserve it in new wrappers.

Delete or collapse these classes of behavior:

1. duplicated owner-selection logic in compact and full paths
2. prompt-specific create-routing patches that exist only to rescue one phrase
3. full-mode logic that re-plans or broadens the owner
4. support or alias token hacks that stand in for better retrieval evidence
5. tool-description prose that tries to substitute for proper orchestration
6. incidental composition inference that comes from low-signal doc overlap instead of query evidence or required scaffold facts

For code review, every migration PR should answer:

- what old logic is deleted
- what responsibility moved earlier in the stack
- what failure class is now handled more generally

## Layer Ownership After Rewrite

### Semantic-Core

Own:

- retrieval artifact generation
- resolve engine
- compact workflow truth
- enrichment gating
- deterministic follow-through

Do not own:

- host-specific sequencing policy
- rich tool-description coaching

### MCP

Own:

- stable workflow tool transport
- capability manifest
- retrieval support resources
- schema transport

Do not own:

- canonical ranking logic
- orchestration policy beyond brief capability guidance

### CLI

Own:

- transport parity with MCP
- compact-first default behavior
- support inspection flags under `info`

Do not own:

- a separate workflow vocabulary
- a more magical `create`

### Skill

Own:

- sequencing policy
- compact-first branching
- mixed-prompt decomposition after owner grounding
- escalation decisions for full output or support inspection

Do not own:

- canonical Salt answer selection
- alias or entity semantics that belong in retrieval

## Migration Sequence

### Phase 0. Freeze And Benchmark

Before rewriting:

- freeze the current `v1` contract fixtures
- freeze external-host failure packets
- freeze the current retrieval regression corpus

Required output:

- one benchmark packet that distinguishes:
  - compact owner quality
  - full-mode owner drift
  - follow-through precision
  - support-surface usefulness

### Phase 1. Retrieval Artifact Rewrite

Build the stable retrieval contract first.

Deliver:

- retrieval document schema
- ranked candidate result schema
- provenance schema
- registry build integration
- CLI/MCP support read paths

Do not change `create` behavior yet beyond shadow-mode evaluation.

### Phase 2. Resolve Engine Cutover

Replace current `create` owner selection with the resolve engine.

Deliver:

- one owner-selection path
- one confidence policy
- one ambiguity policy
- one follow-through input model

Acceptance:

- compact `create` never uses legacy selection paths
- exact and descriptive prompts use the same resolve substrate

### Phase 3. Enrichment Engine Rewrite

Remove full-mode re-planning.

Deliver:

- full consumes a resolved compact result
- starter gating only after stable grounding
- `request` and `resolved_entity` invariants enforced

Acceptance:

- full-mode owner drift goes to zero on the benchmark corpus
- empty `request` regressions are impossible by construction

### Phase 4. Skill And Host Rewrite

Update the `salt-ds` skill and host guidance to match the new boundary.

Deliver:

- compact-first instructions
- retrieval-inspection instructions
- mixed-prompt decomposition guidance
- full-mode escalation rules

Acceptance:

- supported hosts stop using full as first resort
- agent flows branch from compact workflow state

### Phase 5. Cleanup And Deletion

After the new stack is green:

- remove obsolete heuristics
- remove transitional layers
- archive superseded planning docs if their rules are fully absorbed

Do not leave both systems live indefinitely.

## Evaluation Gates

Do not call the rewrite complete unless it passes:

### Contract Gates

- compact/full parity on owner facts
- no empty `request` objects
- no silent owner broadening in full mode

### Retrieval Gates

- owner in top 1
- owner in top 3
- evidence quality good enough for host inspection

### Workflow Gates

- correct partial versus success behavior
- correct follow-through precision
- weak grounding fails closed into action or inspection

### Host Gates

- one MCP-only real host pass
- one skill-supported real host pass
- one CLI repo pilot

## Success Definition

This rewrite is successful when all of these are true:

- registry context is first-class and inspectable
- compact `create` is the only owner-resolution contract
- full `create` is enrich-only
- CLI, MCP, and skill all tell the same compact-first story
- future fixes target retrieval quality or skill orchestration instead of making `create` magical again
- maintainers can delete more logic than they add in the final cleanup phase

## Bottom Line

If the team wants one more large rewrite, this is the right one:

- keep the public Salt workflow story stable
- rewrite the internals around retrieval, resolve, and enrich
- move sequencing up into the skill
- delete the old overlapping `create` intelligence instead of preserving it

That gets Salt to the end state that should actually ship:

- registry-first for context
- workflow-first for safety
