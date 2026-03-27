# Salt AI Top-Tier Design System Plan

This document is a handoff plan for turning Salt into a top-tier AI-native design system product.

It is intended to be shared with another agent or maintainer who will execute the work.

It is not the canonical status tracker.

Use this plan alongside:

- [`./ai-product-roadmap.md`](./ai-product-roadmap.md)
  - long-range product direction
- [`./ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md)
  - active execution tracker
- [`./ai-design-system-quality-standard.md`](./ai-design-system-quality-standard.md)
  - internal quality standard and positioning lessons
- [`./maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)
  - architecture and source-of-truth guardrails
- [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)
  - the single consumer-facing front door

## Contents

- [Goal](#goal)
- [Target Product Standard](#target-product-standard)
- [Current Gaps](#current-gaps)
- [Guardrails](#guardrails)
- [Execution Model](#execution-model)
- [Workstream 1: Rebuild The Consumer Story In `ai.mdx`](#workstream-1-rebuild-the-consumer-story-in-aimdx)
- [Workstream 2: Make `salt-ds` Feel Like A Top-Tier DS Skill](#workstream-2-make-salt-ds-feel-like-a-top-tier-ds-skill)
- [Workstream 3: Add Shared DS Intelligence For Common Surfaces And Design Judgment](#workstream-3-add-shared-ds-intelligence-for-common-surfaces-and-design-judgment)
- [Workstream 4: Move More Canonical Salt Knowledge Out Of Skill Prose](#workstream-4-move-more-canonical-salt-knowledge-out-of-skill-prose)
- [Workstream 5: Productize Distribution And Setup](#workstream-5-productize-distribution-and-setup)
- [Workstream 6: Add A Benchmark-Driven Evaluation Layer](#workstream-6-add-a-benchmark-driven-evaluation-layer)
- [Workstream 7: Host Positioning And Integration Polish](#workstream-7-host-positioning-and-integration-polish)
- [Suggested Delivery Phases](#suggested-delivery-phases)
- [Concrete File Plan](#concrete-file-plan)
- [Acceptance Checklist](#acceptance-checklist)
- [Non-Goals](#non-goals)
- [Instructions For The Next Agent](#instructions-for-the-next-agent)

## Goal

Make Salt feel like a top-tier AI-native design system product rather than:

- a collection of AI plumbing
- a workflow wrapper around MCP and CLI
- a specialist prompt pack that happens to know Salt

The end state should be:

- best-in-class for Salt-specific review, migrate, upgrade, and bounded create work
- meaningfully stronger than general-purpose agents operating without Salt tooling
- competitive with the strongest public design-system AI offerings

## Target Product Standard

Salt should feel strong in all of these dimensions at the same time:

1. Discoverability
   - users can tell what Salt AI does in under two minutes
   - users can copy a prompt and get a useful first result quickly
2. Design system intelligence
   - the agent understands not only APIs, but composition, hierarchy, density, patterns, and design judgment
3. Project awareness
   - the agent clearly starts from repo context and policy instead of guessing
4. Canonical grounding
   - named Salt details come from canonical docs, extracted knowledge, or workflow outputs, not from skill prose guesses
5. Workflow trust
   - the agent routes correctly between review, upgrade, migrate, create, and init
   - the agent asks instead of guessing when confidence is low
6. Packaging quality
   - docs, skill, MCP, CLI, and install story feel like one product
7. Evaluation discipline
   - changes are protected by benchmark tasks and explicit quality criteria

## Current Gaps

These are the main issues to address.

### 1. Consumer story is too workflow-heavy

[`ai.mdx`](../../../site/docs/getting-started/ai.mdx) is useful, but today it reads mostly as:

- workflow guidance
- transport explanation
- setup and troubleshooting

It does not yet fully read like:

- Salt as an AI-native design system
- what Salt knows
- how Salt reasons about common surfaces
- what makes Salt better than generic prompting

### 2. The skill is rigorous, but not yet product-polished

[`packages/skills/salt-ds/SKILL.md`](../../../packages/skills/salt-ds/SKILL.md) is strong on boundaries and routing.

It is weaker on:

- explicit example trigger phrases
- first-run approachability
- a compact "what Salt is good at" story
- design-language guidance beyond orchestration

### 3. Shared design-system intelligence is underpackaged

Salt has strong component, pattern, token, and theme knowledge spread across:

- site docs
- patterns docs
- semantic-core extraction
- MCP and CLI contracts

But it does not yet expose a compact AI-facing layer for:

- common product surfaces
- design judgment
- hierarchy and composition principles

### 4. Too much valuable knowledge still lives in hand-authored workflow prose

Salt's architecture already prefers canonical docs and extraction over skill prose.

That direction is correct, but the product is not finished yet:

- some repeated guidance is still carried by skill references instead of canonical docs/extraction
- the agent still relies on some hand-maintained orchestration text where stronger docs-derived semantics would be better

### 5. Distribution and install story still feels pre-product

The current consumer install path in [`ai.mdx`](../../../site/docs/getting-started/ai.mdx) still points at a branch-backed subtree.

That is acceptable for alpha, but not for a top-tier product.

### 6. Benchmarking is implied more than productized

Salt has tests and workflow acceptance coverage, but it still needs a more obvious benchmark-driven story for:

- common-surface quality
- routing quality
- design-system judgment quality
- comparison against strong external baselines

## Guardrails

The next agent should preserve these rules.

1. Keep [`ai.mdx`](../../../site/docs/getting-started/ai.mdx) as the main consumer-facing page.
2. Do not create a second consumer onboarding path.
3. Keep one public skill: `salt-ds`.
4. Keep one public CLI vocabulary: `salt-ds`.
5. Keep MCP and CLI as transports for the same product model.
6. Do not turn Salt into a general prompt-to-app generator.
7. Do not move repo-local conventions into the core canonical MCP layer.
8. Do not use skill prose as the primary source of canonical Salt rules if docs/extraction can own them.
9. Prefer improving canonical docs and extraction before adding more MCP runtime heuristics.
10. Keep runtime inspection as evidence, not the front door.

## Execution Model

Treat this as a coordinated productization pass with seven workstreams.

The workstreams are ordered, but some can run in parallel once the consumer story and file ownership are clear.

The recommended owner tags are:

- `Docs/Skills`
- `Semantic Core`
- `MCP/CLI`
- `Evaluation/QA`
- `Product`

## Workstream 1: Rebuild The Consumer Story In `ai.mdx`

### Outcome

[`ai.mdx`](../../../site/docs/getting-started/ai.mdx) should become the best single consumer explanation of Salt AI.

It should read like an AI-native design system product page, not just a workflow quickstart.

### Why this matters

This is the main front door.

If this page feels strong, Salt immediately feels more like a polished specialist product and less like internal infrastructure.

### Required changes

1. Rewrite the top section so it leads with:
   - what Salt AI is
   - what jobs it is best at
   - what it understands about Salt repos
   - why it is better than generic prompting
2. Replace the current "use these four jobs in this order" framing with:
   - route by user job
   - `review` as the best first trust loop
   - clear boundaries between review, upgrade, migrate, create, and init
3. Add an explicit "What Salt Knows" section:
   - components
   - patterns
   - foundations
   - tokens
   - repo context
   - project policy
   - runtime evidence only when needed
4. Add an explicit "How Salt Starts" section:
   - MCP project context when available
   - `salt-ds info --json` as CLI equivalent
   - what context is collected and why it improves correctness
5. Add a "Common Surfaces" section with copy-paste prompts for:
   - dashboard / overview page
   - table plus filters
   - form page
   - dialog workflow
   - navigation shell
   - empty / loading / error states
6. Add a "Design Language" section:
   - task-first composition
   - quiet hierarchy
   - layout ownership
   - density and information hierarchy
   - when to prefer patterns over custom composition
7. Keep setup, install, and troubleshooting, but move them below the product/value sections.
8. Keep host notes, but shorten them and make them secondary.
9. Add a "What Salt Does Not Do" section:
   - no generic prompt-to-app generation
   - no raw-image-first MCP workflows
   - no replacing repo-local product decisions with guessed Salt answers

### File targets

- [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)

### Definition of done

- the first 25-35% of the page explains value and capability before transport details
- the page contains explicit example asks for high-value DS tasks
- a first-time user can explain what Salt AI does without mentioning MCP internals

## Workstream 2: Make `salt-ds` Feel Like A Top-Tier DS Skill

### Outcome

[`packages/skills/salt-ds/SKILL.md`](../../../packages/skills/salt-ds/SKILL.md) should feel like a strong, specialized design-system skill rather than a workflow dispatcher.

### Why this matters

The current skill is strong on rigor.

The next step is product polish and discoverability.

### Required changes

1. Add 2-4 concrete trigger examples near the top:
   - "Review this Salt dialog layout"
   - "Create a Salt-native dashboard page"
   - "Migrate this non-Salt screen to Salt"
   - "Upgrade this feature from older Salt patterns"
2. Add a compact "what Salt handles best" section near the front:
   - review
   - upgrade
   - migrate
   - bounded create
   - repo bootstrap
3. Add a compact project-context statement early:
   - repo-aware work starts from canonical project context
   - MCP project context or `salt-ds info --json`
4. Keep the trigger boundary and negative triggers explicit.
5. Keep workflow routing by user job, not by IDE presence.
6. Keep the body as a router, but reduce anything that reads like an operations manual.
7. Link to short shared references for:
   - common surfaces
   - design principles

### File targets

- [`../../../packages/skills/salt-ds/SKILL.md`](../../../packages/skills/salt-ds/SKILL.md)
- [`../../../packages/skills/salt-ds/agents/openai.yaml`](../../../packages/skills/salt-ds/agents/openai.yaml)
  - only if Codex-specific metadata should remain aligned

### Definition of done

- the skill is easier to discover and invoke correctly
- the first section feels like a specialist capability contract
- the workflow references remain one level deep and compact

## Workstream 3: Add Shared DS Intelligence For Common Surfaces And Design Judgment

### Outcome

Salt should have small reusable AI-facing references that encode design-system judgment, not just workflow steps.

### Why this matters

This is one of the biggest gaps versus top-tier design-system AI products.

Salt should help the agent with:

- what to build
- how to structure it
- how to judge if it feels like Salt

### Required changes

Add two new shared references under `packages/skills/salt-ds/references/shared/`.

#### A. `surfaces.md`

This file should cover the priority consumer surfaces:

- dashboard / overview page
- data table with filters
- form page
- dialog / announcement / preferences workflow
- navigation shell
- loading / empty / error / success states

For each surface, include:

- when to use it
- what the main task is
- what the primary interaction should feel like
- what Salt patterns and primitives usually own the structure
- common mistakes to avoid

Keep it short.

This is not a scaffold library.

#### B. `design-principles.md`

This file should cover:

- task-first composition
- shallow hierarchy
- quiet visual defaults
- layout ownership
- appropriate density
- token/foundation discipline
- when customization is justified

Keep it at the level of design-system judgment, not generic UI taste.

### File targets

- `packages/skills/salt-ds/references/shared/surfaces.md`
- `packages/skills/salt-ds/references/shared/design-principles.md`
- [`../../../packages/skills/salt-ds/SKILL.md`](../../../packages/skills/salt-ds/SKILL.md)
  - to link to both files

### Definition of done

- Salt has small shared references for surface selection and design judgment
- `create` and `review` become more DS-native without becoming verbose

## Workstream 4: Move More Canonical Salt Knowledge Out Of Skill Prose

### Outcome

The product should rely more on canonical Salt docs and extracted semantics, and less on hand-maintained AI wording.

### Why this matters

This is the architecture advantage Salt can have over lighter-weight public alternatives.

It makes the product:

- easier to maintain
- easier to keep current
- more trustworthy

### Required changes

1. Audit where the skill references still carry canonical rules that should live in docs or extracted knowledge.
2. Expand canonical docs where the current docs are not explicit enough for AI extraction.
3. Prioritize missing explicit docs for:
   - common surface guidance
   - pattern selection boundaries
   - layout ownership
   - theme/bootstrap guidance
   - token and foundation use where agents often drift
4. Update [`canonical-doc-and-example-improvements.md`](./canonical-doc-and-example-improvements.md) with the concrete doc gaps discovered during this pass.
5. Prefer canonical docs improvements over new MCP runtime heuristics when the missing behavior is stable and docs-owned.

### File targets

- [`./canonical-doc-and-example-improvements.md`](./canonical-doc-and-example-improvements.md)
- relevant `site/docs/patterns/*`
- relevant `site/docs/getting-started/*`
- relevant extracted-doc sources in semantic-core if needed

### Definition of done

- important repeated Salt rules can be traced to canonical docs or extracted data
- the skill references carry routing and judgment, not duplicate canonical policy

## Workstream 5: Productize Distribution And Setup

### Outcome

The install and setup story should feel stable, copy-pasteable, and productized.

### Why this matters

A top-tier product cannot feel branch-bound or provisional in its default docs.

### Required changes

1. Replace branch-backed skill install instructions with one stable source.
2. Document the skill install source in one place only.
3. Keep one MCP setup snippet and one CLI fallback path.
4. Add a short verification checklist to [`ai.mdx`](../../../site/docs/getting-started/ai.mdx):
   - skill installed
   - Salt MCP connected if supported
   - `salt-ds info --json` works in fallback mode
   - first prompt returns a Salt workflow response
5. Keep the consumer story host-agnostic unless a host requires unique setup details.

### File targets

- [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)
- [`../../../packages/skills/README.md`](../../../packages/skills/README.md)
- [`./ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md)
  - if the install/distribution work needs updated execution items

### Definition of done

- the default consumer setup no longer depends on a branch path
- a new team can install and verify Salt AI from one page

## Workstream 6: Add A Benchmark-Driven Evaluation Layer

### Outcome

Salt should have a visible quality system for the product claims it makes.

### Why this matters

This is where Salt can surpass many public skills.

Top-tier design-system AI should prove:

- it routes correctly
- it grounds correctly
- it produces better DS outcomes than a generic assistant

### Required changes

1. Add or extend eval fixtures for priority surfaces:
   - dashboard / overview
   - table plus filters
   - form page
   - dialog workflow
   - migration from a non-Salt baseline
   - upgrade from older Salt usage
2. Score outputs on:
   - correct workflow choice
   - canonical grounding
   - repo awareness
   - conventions awareness
   - design-system judgment
   - escalation quality
   - migration fidelity
3. Add benchmark prompts that compare:
   - generic host prompt without Salt workflow
   - Salt skill plus MCP
   - Salt skill plus CLI fallback
4. Use public benchmark archetypes as inspiration for benchmark task shape, not for copying any outside product model.
5. Add at least one regression path that proves the new `ai.mdx` and skill positioning match the tested product expectations.

### File targets

- [`../../../packages/skills/__tests__/`](../../../packages/skills/__tests__)
- relevant MCP and CLI eval harness files
- [`./ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md)

### Definition of done

- there is a checked-in benchmark story for top-tier DS tasks
- maintainers can detect quality regression on routing and DS judgment, not just protocol shape

## Workstream 7: Host Positioning And Integration Polish

### Outcome

Salt should feel host-native without becoming host-fragmented.

### Why this matters

Salt will be consumed inside existing agent hosts.

The product should win there without branching into multiple product variants.

### Required changes

1. Keep host notes in [`ai.mdx`](../../../site/docs/getting-started/ai.mdx), but simplify them.
2. Focus on:
   - what prompt shape works best
   - how Salt should be invoked
   - what setup the host needs
3. Avoid duplicating the full product story per host.
4. Prefer one install/setup story and minimal host-specific deltas.
5. If consumer evidence justifies it later, add host-specific setup verification notes, not host-specific product variants.

### File targets

- [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)
- optionally future host setup snippets if real differences matter

### Definition of done

- the major hosts can all use the same Salt mental model
- host notes help with setup and prompting, but do not fork the product

## Suggested Delivery Phases

Use this order.

### Phase 1: Consumer Positioning

Do first:

- Workstream 1
- the trigger/example portion of Workstream 2

This produces the biggest visible lift quickly.

### Phase 2: Skill Productization

Do next:

- finish Workstream 2
- execute Workstream 3

This makes the skill feel more like a real design-system specialist.

### Phase 3: Canonical Knowledge Lift

Then:

- Workstream 4

This reduces future maintenance cost and improves trust.

### Phase 4: Distribution And Setup

Then:

- Workstream 5

This makes the product feel stable externally.

### Phase 5: Evaluation And Benchmarking

Then:

- Workstream 6

This protects the gains and makes the product claims credible.

### Phase 6: Host Polish

Then:

- Workstream 7

This is the final integration polish, not the first job.

## Concrete File Plan

### Consumer-facing

- [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)
  - primary consumer rewrite

### Skill-facing

- [`../../../packages/skills/salt-ds/SKILL.md`](../../../packages/skills/salt-ds/SKILL.md)
  - tighten front section and shared-reference routing
- `packages/skills/salt-ds/references/shared/surfaces.md`
  - new
- `packages/skills/salt-ds/references/shared/design-principles.md`
  - new
- [`../../../packages/skills/salt-ds/agents/openai.yaml`](../../../packages/skills/salt-ds/agents/openai.yaml)
  - optional metadata alignment only if still useful

### Maintainer planning

- [`./ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md)
  - add or revise execution items as work starts
- [`./ai-product-roadmap.md`](./ai-product-roadmap.md)
  - update if the product framing changes materially
- [`./canonical-doc-and-example-improvements.md`](./canonical-doc-and-example-improvements.md)
  - record doc/extraction gaps found during the pass

### Evaluation

- [`../../../packages/skills/__tests__/`](../../../packages/skills/__tests__)
- relevant MCP and CLI eval harness files

## Acceptance Checklist

The product should be considered meaningfully improved when all of these are true.

### Consumer experience

- [`ai.mdx`](../../../site/docs/getting-started/ai.mdx) reads like an AI-native design-system product page
- the top of the page explains value before transport
- a user can copy prompts for common DS surfaces directly from the page

### Skill quality

- `salt-ds` contains concrete trigger phrases
- `salt-ds` has explicit project-context-first guidance
- `salt-ds` links to shared DS references for surfaces and design principles
- `salt-ds` remains a single public entry point

### Design-system intelligence

- Salt has explicit AI-facing guidance for common product surfaces
- Salt has explicit AI-facing guidance for design judgment, not just API use

### Canonicality

- repeated Salt rules are increasingly owned by docs/extraction rather than prompt prose
- the skill remains thin enough to be maintainable

### Productization

- install path is stable
- setup verification is documented
- consumer docs, skill, MCP, and CLI tell the same story

### Quality

- benchmark tasks exist for priority surfaces
- routing and grounding regressions are testable
- Salt can show improvement over a generic non-Salt workflow on curated tasks

## Non-Goals

Do not treat these as part of this pass.

- building a generic prompt-to-app generator
- adding a second public skill for each workflow
- exposing more public MCP tool names in consumer docs
- making runtime inspection the main product
- replacing canonical docs with more skill prose
- introducing a host-specific product variant for every IDE

## Instructions For The Next Agent

1. Start by reading:
   - [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)
   - [`../../../packages/skills/salt-ds/SKILL.md`](../../../packages/skills/salt-ds/SKILL.md)
   - [`./ai-product-roadmap.md`](./ai-product-roadmap.md)
   - [`./ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md)
   - [`./maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)
2. Treat [`ai.mdx`](../../../site/docs/getting-started/ai.mdx) as the single consumer front door.
3. Do not create a second consumer guide.
4. Keep one public skill: `salt-ds`.
5. Start with Phase 1 and Phase 2 before deeper architectural work.
6. When a rule can live in canonical docs and extraction, prefer that over adding more skill prose.
7. Preserve the current guardrails around:
   - canonical Salt first
   - repo context before guessing
   - policy after canonical guidance
   - runtime evidence only when needed
8. If execution work begins, reflect status changes in [`./ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md) instead of turning this file into a tracker.
