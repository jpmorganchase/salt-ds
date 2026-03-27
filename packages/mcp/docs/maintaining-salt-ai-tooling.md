# Maintaining Salt AI Tooling

This guide is for agents and maintainers working on the Salt AI stack inside this monorepo.

Use it to keep the architecture stable as the MCP, skills, docs extraction, and project conventions evolve.

For the canonical AI entity model that the tooling should reason over, see [`./ai-domain-model.md`](./ai-domain-model.md).
For the shared install-diagnostics behavior across `doctor`, `info`, and MCP context, see [`./install-health-contract.md`](./install-health-contract.md).
For doc and example improvements that would let Salt AI rely less on hand-authored scaffolds, see [`./canonical-doc-and-example-improvements.md`](./canonical-doc-and-example-improvements.md).
For the recommended adapter-based live evaluation model that sits on top of the deterministic eval suite, see [`./live-eval-harness.md`](./live-eval-harness.md).

## Core Rule

Keep the source of truth outside the MCP runtime wherever possible.

The preferred order is:

1. canonical Salt docs
2. category maps and other small docs-owned metadata
3. registry build extraction
4. MCP runtime reasoning
5. skills orchestration

If a new behavior can be expressed in docs, category maps, or build extraction, do that before adding runtime MCP heuristics.

## Stable Layers

- Salt docs in `site/docs`
  - canonical Salt guidance
  - `When to use` and `When not to use` should carry the durable decision rules
- category maps in `site/component-category-map.json` and `site/pattern-category-map.json`
  - coarse semantic grouping
- registry build in `packages/semantic-core/src/build`
  - derives machine-readable semantics from docs and category maps
  - should remain the shared canonical owner used by both MCP and CLI
  - should prefer docs-derived regions, anatomy, and composition constraints before any hand-authored starter metadata
  - if a pattern still needs starter JSX, treat it as a fallback template layered after extracted semantics rather than as the canonical source of truth
- semantic core in `packages/semantic-core/src/tools`
  - recommendation, translation, validation, migration, and lookup
  - should consume registry semantics, not become a second rulebook
  - should own the workflow contract for create, review, migrate, and upgrade so MCP and CLI stay thin transports
- MCP adapter in `packages/mcp/src/server`
  - tool registration, attribution, and schema transport
  - should not become the main owner of canonical Salt logic or workflow semantics
  - public follow-up suggestions should stay within the six public workflow tools; helper-only IDs belong to the internal implementation layer
  - repo-aware MCP workflows must only consume repo policy through an explicit `context_id` returned by `get_salt_project_context`; do not reintroduce implicit session-global repo context
- MCP package glue in `packages/mcp/src/registry` and `packages/mcp/scripts`
  - bundles and serves the default generated snapshot
  - should not redefine canonical registry build/load behavior
- project conventions in `packages/semantic-core/src/policy`
  - repo-local refinements layered after canonical Salt guidance
  - should keep wrappers, theme defaults, token aliases, and token-family policy as structured overlay data rather than prose-only repo lore
  - repo-aware workflows should surface those overlays consistently in their artifacts, not only in create-time summaries
  - MCP should surface that overlay data through `artifacts.project_policy` after `get_salt_project_context` has populated repo context
  - when a declared wrapper clearly refines a canonical create result, expose that as a separate repo refinement artifact instead of silently rewriting the canonical Salt decision
- skills in `packages/skills`
  - thin workflow helpers
  - should orchestrate the MCP and project conventions, not duplicate Salt policy

## More Source-Derived

To keep Salt closer to a true design-system source model, prefer this order for new starter and recommendation work:

1. extract semantics from canonical docs and category maps
2. extract example code from real stories and usage docs
3. render starters from extracted semantics plus extracted examples
4. only then fall back to private helper templates

In practice that means:

- move more pattern anatomy, regions, and preserve-constraints into build extraction before adding new runtime notes
- add or improve canonical examples when the docs are correct but too implicit for extraction
- keep private templates in `starterCode.ts` small and generic so they remain implementation glue, not a second source of truth
- prefer source-backed starter snippets over hand-authored JSX blocks whenever a real pattern story or usage example exists

## Boundary Rules

### Core Salt MCP

- Must stay canonical and Salt-only.
- Must not ingest repo-specific wrappers, shells, or local conventions.
- Should answer: "What is the nearest correct Salt answer?"

### Project Conventions

- Stay outside the core MCP.
- Refine canonical Salt guidance for one consumer repo.
- Should answer: "How does this repo want Salt applied?"

### Skills

- Stay thin and consumer-repo oriented.
- Should tell the agent:
  - when to use the MCP
  - when to check project conventions
  - how to structure the workflow and response
- Should not become the source of truth for Salt component or pattern rules.

### Fix Application

- Salt tooling should return structured findings, fix candidates, confidence, and source attribution.
- Public create, review, migration, and upgrade outputs should expose stable workflow rule IDs so agents can reason about the result consistently across transports.
- Confidence should include what would raise confidence next, not just a label.
- Agents should decide which fixes to apply and in what order.
- Do not default to CLI or MCP tools mutating consumer files directly just because a remediation can be described mechanically.
- Direct file mutation belongs only in a very narrow, explicitly justified operator path with focused regression coverage.

The preferred split is:

- deterministic tooling
  - canonical findings
  - migration facts
  - structured fix candidates
  - structured post-migration verification checklists
  - deterministic policy-layer validation through `salt-ds doctor`
  - validation and runtime evidence
- agent workflow
  - apply selected changes
  - ask follow-up questions
  - decide when repo policy or runtime evidence changes the fix plan

## What To Change For Common Tasks

### New Or Updated Component

Prefer changing:

1. component docs in `site/docs/components/...`
2. `When to use` and `When not to use`
3. `site/component-category-map.json`
4. regression tests if the component affects recommendation or translation

Avoid changing:

- skill instructions
- MCP runtime heuristics

unless the component introduces a genuinely new semantic distinction the current model cannot express.

### New Or Updated Pattern

Prefer changing:

1. pattern docs in `site/docs/patterns/...`
2. `When to use` and `When not to use`
3. `site/pattern-category-map.json`
4. pattern regression tests if recommendation or translation depends on it

Avoid adding new pattern-specific MCP fallback logic unless the docs-derived semantics still cannot safely distinguish the case.

When starter code is still needed for a pattern:

- keep extracted scaffold semantics in the registry record
- keep JSX/import scaffolds in the fallback template layer
- do not treat fallback template code as the canonical source of pattern semantics

### New Repo-Specific Consumer Rule

Prefer changing:

1. project conventions contract or examples
2. `packages/semantic-core/src/policy`
3. the `salt-ds` skill references or assets if the authoring workflow needs to improve

Do not add the repo-specific rule to the core MCP.

### Token Policy Or Token Guidance Changes

Prefer changing:

1. the real theme, characteristic, and foundation docs in `site/docs`
2. build-time token policy extraction in `packages/semantic-core/src/build`
3. generated token metadata and validators that consume that extracted policy

Avoid changing:

- agent-only token summary docs that duplicate canonical guidance
- MCP runtime heuristics that guess token policy from prompt wording
- skills prose as the main enforcement path

If a cross-cutting token summary route exists, treat it as optional summary material only. It should not become the authoritative source of token policy for the AI stack.

First audited token-family batch:

- `content`
  - `extract now`, but only for narrow stable roles
  - current docs are explicit enough for default/static foreground semantics
  - do not yet try to enforce bold/background pairing or link treatment from token policy alone
- `overlayable`
  - `extract now`
  - current docs are explicit enough for hover-overlay and scrim roles
- `navigable`
  - `guidance only` for now
  - current docs are highly pattern-oriented and intentionally mix container, separable, content, and overlayable tokens
  - do not try to turn that into a broad validator until a clearer repeated rule emerges
- `actionable`
  - `docs first`
  - the docs are rich, but the state and sentiment matrix is still too large to encode safely as generic validator policy without a clearer canonical summary
- `target`
  - `docs first`
  - there is no dedicated target-characteristic page today
  - target guidance is split across container docs and token tables, so extraction would still be partly interpretive

### New Workflow

If the change is about:

- canonical Salt behavior
  - update docs, build extraction, or MCP runtime
- repo-local application behavior
  - update project conventions docs/runtime
- task orchestration
  - update skills

### New Fix Or Remediation Capability

Prefer:

1. returning better structured `fixCandidates`
2. improving confidence and source attribution on those candidates
3. letting the agent apply the chosen change through the normal workflow

Avoid:

- growing a general-purpose autofix CLI
- teaching consumers a separate fix command surface
- coupling review output to direct file mutation by default

## Source-Of-Truth Checks

Before adding MCP runtime logic, ask:

1. Can this rule live in `When to use` or `When not to use`?
2. Can a category map express the coarse grouping?
3. Can the registry build derive the needed semantics?
4. Can the runtime consume existing semantics more generically?

Only add runtime heuristics if the answer is still no.

## Placement Guide

Use this rule when deciding whether behavior belongs in docs, build extraction, MCP runtime, skills, or the model's own judgment.

### Put It In Docs

- durable canonical Salt guidance
- `When to use` and `When not to use`
- explicit alternatives such as "use X instead of Y"
- pattern anatomy, layout, accessibility, and state guidance
- required versus optional pattern structure where it genuinely helps readers and does not distort diagram-driven anatomy

Choose docs first when the rule should be readable by humans and survive model or client changes.

### Put It In Build Extraction

- machine-readable semantics that can be derived from docs or metadata
- aliases, topic signals, accessibility summaries, related entities, and category normalization
- stable extraction from structured docs sections or small metadata files
- token usage policy derived from characteristic docs, foundation docs, deprecation markers, and token metadata

Choose build extraction when the MCP should consume the rule generically instead of hardcoding it at runtime.

Do not create extra docs whose main purpose is to be easier for the agent to read. If the rule matters, extract it from the real source docs instead.

### Put It In The MCP Runtime

- source normalization that multiple tools must share
- deterministic grouping, provenance, or merge behavior
- stable ranking or rejection rules that need regression tests
- structured blockers, confidence, and fallback decisions

Only do this when removing the code would make behavior:

1. less consistent across tools or clients
2. less testable
3. less structured
4. too dependent on prompt wording

### Put It In Skills

- workflow order
- confirmation points
- when to re-check, validate, or ask the user
- how to present output
- repo-facing orchestration around the MCP and project conventions

Skills should tell the model what process to follow, not redefine canonical Salt semantics.

### Rely On Model Judgment

- synthesis across already-structured Salt guidance
- summarization, prioritization, and explanation
- context-sensitive tradeoffs where deterministic rules would be brittle
- cases where the MCP already exposes enough structured evidence and the remaining task is reasoning, not normalization

Prefer the model when the behavior does not need to be identical across tools and cannot be expressed cleanly as a stable tested rule.

## Model-Dependence Rule

Better models can improve results, but they should improve results on top of a stable canonical substrate rather than replace it.

Use model intelligence for:

- choosing among well-structured candidates
- adapting explanations to the user task
- asking better follow-up questions
- synthesizing multiple guidance sources

Do not rely on model intelligence alone for:

- canonical Salt facts
- deterministic merge behavior
- repeatable cross-tool source interpretation
- repo/client-independent fallback behavior
- anything that must be protected by regression tests

The MCP should not try to outsmart the model everywhere. It should make the model less likely to drift on the stable parts of the job.

## Runtime Heuristic Bar

A new runtime heuristic is justified only if all of the following are true:

1. docs or metadata cannot express the rule cleanly
2. build extraction cannot derive it generically
3. multiple tools need the same behavior
4. the output needs to be structured or repeatable
5. the rule can be tested with focused regressions

If any of those are false, prefer docs, build extraction, skills, or model judgment instead.

When a runtime heuristic is added anyway, treat named contextual hint logic as provisional by default.

- record the reason it exists
- prefer keeping it in one place such as `sourceUiContextualHints.ts`
- revisit it when docs extraction, category metadata, or external semantics can replace it
- simplify or remove it once a better source-of-truth path exists

## MCP Runtime Rules

- Prefer registry-driven ranking over query regexes.
- Prefer source-intent matching over Salt-specific hardcoded target names.
- Prefer generic blockers and question generation over kind-specific rule tables.
- Prefer compact outputs by default.
- Keep `raw` and debug payloads opt-in.
- Preserve request-local caching and cheap first-pass matching when translation grows.

## Skills Rules

- A new component or pattern should usually require no skill change.
- A skill change is justified when:
  - the workflow order changes
  - a new task category exists
  - project-conventions handling changes materially
- Keep detailed policy in references only when needed.
- Do not repeat long Salt guidance that already exists in docs or the MCP.
- Do not use skills as the main place to encode token policy. Skills should require token grounding and validation, but the actual policy should come from extracted canonical docs data.

## Project Conventions Rules

- Keep the contract explicit and versioned.
- Prefer `.salt/team.json` as the default consumer discovery point.
- Add `.salt/stack.json` only when the consumer actually needs layered conventions or package-backed upstream sources.
- Keep theme defaults, token aliases, and token-family policy explicit in the conventions data when repo policy depends on them.
- Keep merge order stable:
  1. `banned_choices`
  2. `preferred_components`
  3. `approved_wrappers`
  4. `pattern_preferences`
  5. canonical Salt answer
- Preserve provenance:
  - canonical Salt choice
  - applied project convention
  - final choice
- For workflow envelopes, treat `workflow.provenance.source_urls` as the authoritative source list. The top-level transport `sources` array is a normalized view of that provenance, not a second source-discovery system.
- Do not present repo-local conventions as part of the Salt registry.

## Performance And Context Discipline

- Keep default outputs compact.
- Avoid repeatedly carrying large starter code or raw debug payloads across turns.
- Prefer build-time extraction over runtime recomputation.
- Add targeted caching before adding broader heuristics.
- If a change increases translation or recommendation work per region or per candidate, add or update tests that protect latency-sensitive behavior.

## Tests To Update

When the source of truth changes, prefer updating tests in this order:

- `packages/mcp/src/__tests__/semanticRegression.spec.ts`
  - curated semantics guardrails
- `packages/mcp/src/__tests__/registry.integration.spec.ts`
  - full registry build behavior
- `packages/mcp/src/__tests__/translationModules.spec.ts`
  - translation semantics and blockers
- `packages/mcp/src/__tests__/tools.spec.ts`
  - outward-facing MCP behavior
- `packages/mcp/src/__tests__/projectConventions.spec.ts`
  - schema and merge behavior for project conventions

If a skill changes, also verify:

```sh
cmd /c npx skills add <documented-source> --list
```

## Anti-Patterns

Avoid these:

- adding repo-local conventions to the core MCP
- teaching the skills canonical Salt rules that belong in docs or the MCP
- adding new runtime heuristics when docs extraction can solve the problem
- adding agent-only summary docs when build extraction from canonical docs can solve the problem
- snapshotting full registry output instead of asserting high-value semantics
- making default MCP outputs verbose just to expose debugging information
- changing skills every time a component or pattern changes

## Working Rule

Keep the division stable:

- Salt MCP answers:
  - what is the nearest correct Salt answer
- project conventions answer:
  - how this repo wants Salt applied
- skills answer:
  - what workflow to follow and how to present the result

If a change blurs those boundaries, stop and redesign it before implementing.
