# Salt AI Tooling Positioning Memo

## Status

Proposed.

Created: April 20, 2026

## Purpose

Define how Salt AI tooling should be positioned before broader consumer rollout.

This memo is based on:

- the current Salt workflow and contract architecture
- the current next-releases plan
- the competitor audit covering MUI, Shopify, Storybook, Figma, v0/shadcn, and Claude Design

## Executive Summary

Salt should not try to win the market for broad AI-generated first drafts.

Salt should position itself as the best specialist design-system intelligence layer for safely applying Salt in real repos.

That means:

- Claude Design and similar tools can own broad exploration, ideation, and polished first drafts
- Salt should own grounding, constraints, follow-through, repo-aware refinement, review, migration, and upgrade safety

The right positioning is not:

- "Salt is our answer to Claude Design"

The right positioning is:

- "Salt is the safest and most reliable way to turn AI output into correct Salt implementation in a real codebase"

## Market Context

As of April 2026, the market is converging on a layered model:

- authoritative structured context
- host instructions or skills
- MCP or equivalent tool access
- validation loops
- stronger handoff into coding agents

This is visible in:

- MUI MCP and MUI Recipes
- Shopify AI Toolkit
- Storybook manifests plus MCP plus tests
- Figma MCP plus Code Connect
- shadcn registry plus MCP
- Claude Design plus Claude Code handoff

The important conclusion is:

first-class AI-native design-system products are not just docs, and they are not just raw tool surfaces either.

They combine:

- system knowledge
- host guidance
- a stable public model
- validation or safety signals

Salt already has the bones of that model.

## What Salt Should Be

Salt should be:

- the specialist AI layer for teams building with Salt
- the safest workflow product for applying Salt in real repos
- the authoritative system for create, review, migrate, and upgrade work in Salt consumer repos
- the design-system intelligence layer that tells an agent not only what to use, but whether it is safe to proceed

The best short version is:

Salt is the AI-native workflow and grounding layer for shipping correct Salt UI in real repositories.

## What Salt Should Not Be

Salt should not be:

- a general AI IDE
- a broad prompt-to-app generator
- a visual-design canvas product
- a generic UI code generator for any design system
- a second autonomous autofix system that bypasses agent judgment

If Salt tries to compete head-on with Claude Design on broad creative generation, it will dilute the parts of the product that are hardest to copy and most valuable.

## The Core Job To Be Done

The most important user job is not:

- "make me a pretty first draft"

It is:

- "help my agent make the correct Salt decision, in the correct repo, with the correct follow-through, without shipping the wrong thing"

That expands into five product jobs:

1. Ground the request in canonical Salt guidance.
2. Tell the agent whether the exact requested region is safe to implement.
3. Detect when the result is partial, broadened, blocked, or misrouted.
4. Refine the canonical answer using repo-local conventions without corrupting the canonical answer itself.
5. Carry the work through review, migration, and upgrade safely.

## Why Salt Still Matters Even With Claude Design

Claude Design is a real competitive signal.

As of April 17, 2026, Anthropic describes it as a product for creating designs, prototypes, slides, one-pagers, and more, with team design-system application, export, and handoff to Claude Code.

That is strong for:

- ideation
- visual exploration
- polished prototypes
- stakeholder communication
- early handoff

But Salt can remain highly valuable because Claude Design does not automatically solve the Salt-specific shipping layer:

- exact Salt grounding
- exact-request safety
- deterministic follow-through
- repo-aware wrapper and policy overlays
- transport-stable workflow behavior
- Salt-specific review and upgrade intelligence
- eval-backed contract stability

In practical terms:

- Claude Design can help teams generate or explore
- Salt should help them trust, constrain, and ship

## Product Category

The right category for Salt is:

- design-system workflow intelligence

Not:

- AI design tool
- general coding agent
- generic MCP docs server

This category has three defining traits:

1. It knows the design system deeply.
2. It carries workflow state, not just facts.
3. It helps the agent decide whether to continue safely.

That is a much narrower and stronger category than "AI design tooling."

## Positioning Statement

For teams shipping product UI with Salt in real repositories, Salt AI tooling is the workflow intelligence layer that grounds agent work in canonical Salt guidance, applies repo-specific conventions safely, and tells the agent when it is actually safe to proceed.

Unlike broad AI design and generation tools, Salt is optimized for correctness, follow-through, and real codebase application, not just fast first drafts.

## Messaging Pillars

### 1. Canonical Salt Grounding

Salt gives the nearest correct Salt answer from official Salt guidance.

Message:

- Use Salt when the cost of choosing the wrong component, pattern, or structure is real.

### 2. Safe Agent Workflow

Salt does not just recommend.
It tells the agent whether the exact request is safe to implement now.

Message:

- Salt helps agents know when to continue, when to stop, and what to do next.

### 3. Repo-Aware Refinement

Salt keeps canonical Salt guidance separate from repo-specific rules, wrappers, and conventions.

Message:

- Salt understands both the design system and the repo that is using it.

### 4. Full-Lifecycle Value

Salt is not only for create-time recommendation.
It is also for review, migration, and upgrade.

Message:

- Salt is useful after the first draft, not only before it.

### 5. Eval-Backed Trust

Salt should be positioned as a system with explicit workflow contracts and regression gates, not as a "usually smart" assistant.

Message:

- Salt is built to be trusted in production agent loops.

## Competitive Framing

### Against Claude Design

Claude Design is for:

- exploration
- visual ideation
- design output
- prototype handoff

Salt is for:

- canonical Salt decisions
- exact-request safety
- repo-aware application
- follow-through
- review, migrate, and upgrade safety

Internal shorthand:

- Claude Design explores
- Salt grounds and ships

### Against Figma MCP And Code Connect

Figma is strongest where the source of truth begins in design files and design-to-code mapping.

Salt is strongest where the source of truth is the Salt design system and the consuming repo.

Internal shorthand:

- Figma explains the design
- Salt explains the correct Salt implementation

### Against Storybook MCP

Storybook is strong on component docs, stories, and validation loops for local component libraries.

Salt is strong on specialist design-system choice, workflow gating, and repo-aware usage of Salt itself.

Internal shorthand:

- Storybook validates component usage
- Salt validates Salt-native direction

### Against MUI MCP And Similar Docs Servers

Docs-backed MCP products are strong at retrieval.

Salt should be stronger on:

- workflow state
- safety gating
- follow-through
- repo conventions

Internal shorthand:

- docs MCP tells you what exists
- Salt tells you what to do and whether it is safe

## Strategic Product Boundary

Salt should own the "post-prototype" and "pre-merge" part of the workflow.

That means the center of gravity should be:

- create with workflow safety
- review with fix candidates
- migrate with preserved interaction intent
- upgrade with explicit modernization guidance

This is the part of the product lifecycle where specialized design-system intelligence has the highest durable value.

## Implications For The Next 1-2 Releases

This positioning implies:

1. Fundamentals come first.

   - public API correctness
   - transport parity
   - context safety
   - create routing robustness

2. Support tools should help strong hosts, not replace the public workflow story.

3. Handoff quality matters.

   - Salt should become easier to use with coding agents after the initial grounding step

4. Visual grounding should be narrow and workflow-safe.

   - especially for migration and constrained create cases

5. Docs and setup must become dramatically easier.
   - first-class products are also first-class to adopt

## What Salt Should Say Publicly

Recommended product language:

- Salt AI helps agents build with Salt correctly in real repos.
- Salt gives canonical Salt guidance, repo-aware refinement, and safe next steps.
- Salt is optimized for create, review, migrate, and upgrade workflows.
- Salt is for teams that want AI speed without giving up design-system correctness.

Avoid saying:

- Salt generates your entire app from one prompt.
- Salt is a design canvas.
- Salt replaces design tools.
- Salt is a general-purpose coding assistant.

## Internal Decision Rules

When evaluating new features, ask:

1. Does this make Salt better at grounding, constraining, or safely shipping?
2. Does this strengthen create, review, migrate, or upgrade?
3. Does this preserve the workflow-first public story?
4. Does this improve real repo use rather than generic generation demos?
5. Would this still matter if users begin the process in Claude Design or Figma?

If the answer to the last question is no, the feature is probably not core.

## Success Metrics

Salt should judge itself on:

- exact-request correctness
- rate of safe vs unsafe implementation signals
- follow-through quality
- review usefulness
- migration fidelity
- upgrade clarity
- CLI/MCP parity
- setup success in major hosts
- repeated use after the first create workflow

Not primarily on:

- prettiness of first drafts
- novelty of generated layouts
- breadth of greenfield generation

## Final Position

Salt should be positioned as the trusted Salt shipping layer in an AI-native workflow stack.

Users may start in:

- Claude Design
- Figma
- Storybook
- a host coding agent
- plain prompts in an IDE

But Salt should be the system they rely on when the question becomes:

- what is the correct Salt direction here?
- is this safe to implement?
- what follow-through is still required?
- how should this repo apply the canonical answer?
- is this implementation actually good enough to merge?

That is a strong and durable place to compete.

## Short External-Facing Narrative

Salt AI helps teams use AI to build with Salt correctly in real repositories.

Instead of only generating a fast first draft, Salt grounds agent work in canonical Salt guidance, checks whether the exact request is actually safe to implement, and carries that work through review, migration, and upgrade. It also keeps repo-specific conventions separate from the core Salt answer, so teams can move quickly without losing consistency or trust.

You can start the workflow anywhere, including a coding agent, a design handoff, or an early prototype. Salt is the layer that helps turn that work into correct, reviewable, production-ready Salt UI.
