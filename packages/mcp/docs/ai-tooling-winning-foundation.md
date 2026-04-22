# AI Tooling Winning Foundation

Status: active target architecture
Date: April 21, 2026
Owner: AI tooling maintainers

## Purpose

This document defines the end-state Salt AI model that future work should move toward.

Use it to answer:

- what Salt is trying to become
- what belongs in the core tooling versus the skill or host
- how Salt should compare to strong public AI design-system products
- when a change is moving Salt toward the target versus back into brittle workflow intelligence

This is not a sprint tracker.

Use [`./ai-tooling-change-review-rubric.md`](./ai-tooling-change-review-rubric.md) to judge specific proposals or PRs against this direction.

## North Star

Salt should be:

- registry-first for context
- workflow-first for safety
- repo-aware for real implementation
- thin at the public API boundary

The winning version of Salt is not:

- a general-purpose AI IDE
- a broad prompt-to-app generator
- a giant create tool that searches, classifies, decomposes, plans, and synthesizes in one step
- a raw metadata dump with no workflow contract

## Product Position

Salt should win as the specialist AI layer for shipping correct Salt UI in real repositories.

That means:

- stronger grounding than generic prompting
- stronger workflow safety than registry-only systems
- stronger repo and policy awareness than docs-only MCP servers

Salt does not need to beat visual-ideation products at greenfield generation.
It needs to be the best system for grounded Salt implementation, review, migration, and upgrade work.

## What Strong Competitors Actually Do

The strongest public products currently converge on a few patterns:

- registry or manifest-backed context
- code mappings where available
- small stable tool surfaces
- agent skills or plugins for orchestration
- validation or test loops after generation

Salt should adopt those strengths without losing its own specialist workflow contract.

## Winning Product Model

### 1. Canonical Source Layer

The source of truth stays in:

- Salt docs
- category maps
- registry build extraction
- source-backed examples and starter metadata

This layer should answer:

- what Salt entities exist
- when to use them
- when not to use them
- how they compose

### 2. Registry And Retrieval Layer

The registry should be first-class product infrastructure, not only an internal build artifact.

It should provide:

- canonical entity identity
- retrieval-ready semantic documents
- starter availability
- supporting-surface hints
- `when_to_use`
- `when_not_to_use`
- provenance for why a candidate matched

This layer should answer:

- what are the best Salt candidates for this prompt
- why are they candidates
- which candidate looks like the likely owner

### 3. Workflow Contract Layer

The public workflow layer should remain thin and stable.

Its job is:

- choose the most likely primary owner when evidence is strong enough
- report `match_status`
- report blockers or deterministic follow-through
- return the next safe `action`

This layer should answer:

- what should the host do next
- is the current result safe to continue from

### 4. Rich Support Layer

Richer context should exist, but it should be additive and secondary.

This includes:

- top retrieval candidates
- candidate evidence
- composition hints
- starter artifacts
- examples and richer implementation details

This layer should help strong hosts reason better without forcing weaker hosts to infer everything.

### 5. Host And Skill Orchestration Layer

Hosts and skills should do the orchestration work:

- compact-first branching
- follow-up decomposition
- deciding when to request rich output
- deciding when to query secondary surfaces

This layer should not redefine the canonical Salt answer.

## Public API Principles

### Compact Is Authoritative

Compact workflow output is the main public contract.

It should always contain the routing facts the host needs:

- workflow
- status
- request
- resolved entity
- match status
- blockers
- next action

### Full Is Additive

Full output must keep the same top-level routing facts as compact output.

Full mode may add `details`, but it must not:

- drop `request`
- lose the resolved owner
- broaden the owner silently
- invent starter expansion while grounding is still weak

### `Create` Must Stay Thin

`create` should do:

1. grounded owner resolution
2. match and confidence reporting
3. blocker and follow-through reporting
4. next-step routing

`create` should not do:

- broad search-plus-planning in one response
- speculative rich synthesis when grounding is weak
- deep mixed-surface decomposition in the first step
- use full mode as an excuse to change the primary answer

### Catalog Support Is Secondary

Salt should expose richer registry or retrieval support for strong hosts, but that support should not replace the workflow contract.

The right model is:

- `create` for safe workflow routing
- catalog or retrieval support for deeper search and decomposition

Not:

- `create` doing everything
- or catalog dumps becoming the new public front door

## Layer Ownership

Future work should prefer this order:

1. docs and examples
2. registry extraction and retrieval artifacts
3. semantic-core workflow logic
4. MCP or CLI transport glue
5. skills or host guidance

If a behavior can be solved in an earlier layer, do not push it later.

## What Salt Should Preserve

These should remain stable:

- one public skill
- one public CLI
- one MCP package
- one workflow-first public story
- one stable compact contract
- repo-aware policy as an overlay, not part of the canonical Salt answer

## What Salt Should Add

The winning version still needs three things:

### 1. A Stronger Retrieval Support Surface

Strong hosts should be able to inspect:

- top candidates
- evidence
- `when_to_use`
- `when_not_to_use`
- supporting surfaces

without forcing `create` to behave like a search-and-plan engine.

### 2. Stricter Compact/Full Discipline

Rich output should enrich only after owner grounding is stable.

If grounding is weak:

- stay partial
- return a grounded next action
- or return retrieval-backed clarification support

### 3. Better Benchmark Coverage

Salt should keep measuring the specialist tasks that matter:

- metrics and summary surfaces
- tabs and same-page section switching
- tables with navigation support
- control-in-form prompts
- content states
- shells and navigation structures
- review, migrate, and upgrade flows

## What Salt Should Explicitly Avoid

Reject changes that move Salt back toward these anti-patterns:

- prompt-specific entity patches as the long-term answer
- runtime heuristics that duplicate docs-derived semantics
- larger public tool surfaces without evidence
- rich create responses that try to resolve weak grounding by guessing harder
- host-specific hacks in canonical reasoning
- treating a raw component list as a better default than the workflow contract

## Definition Of Done

The winning version is in place when all of these are true:

- exact prompts stay exact in compact and full modes
- descriptive prompts anchor on the right owner on first pass often enough to trust the workflow
- weak grounding fails closed instead of broadening into speculative plans
- full mode preserves compact routing facts exactly
- richer retrieval context is available to strong hosts without replacing the workflow front door
- docs, skill, CLI, MCP, and registry all tell the same product story

## Bottom Line

Salt should combine the best parts of two product categories:

- registry and manifest systems for context
- workflow systems for safety

That is the winning model:

- registry-first for context
- workflow-first for safety

Everything else should be judged by whether it reinforces or weakens that split.
