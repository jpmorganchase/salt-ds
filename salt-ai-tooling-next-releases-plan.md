# Salt AI Tooling Next Releases Plan

## Status

Approved for execution.
Release 1 signed off for controlled rollout.

Created: April 20, 2026
Approved: April 20, 2026

Structural scope is locked through Release 1.

Execution tracking: `packages/mcp/docs/release-1-execution-checklist.md`

Baseline snapshots:

- pre-change: `packages/mcp/docs/baselines/2026-04-20-release-1/`
- post-v3 shipped surface: `packages/mcp/docs/baselines/2026-04-20-release-1-v3/`

Release 1 evidence: `packages/mcp/docs/release-1-release-evidence.md`

Post-Release-1 follow-up backlog: `packages/mcp/docs/post-release-1-follow-up-backlog.md`

Current execution state:

- Release 1 fundamentals, contract freeze, create hardening, replay gates, and efficiency budgets are implemented and recorded in the execution checklist.
- The public workflow contract has been migrated to `salt_workflow_v3`, including additive full output, manifest versioning, and active API-matrix/README guidance.
- Pre-change and post-v3 shipped-artifact snapshots are both captured for rollout evidence and contract diffs.
- Release 1 repo-local host and fixture-repo validation is complete, and IntelliJ external host validation has confirmed manifest access, `v3` contract branching, and weak-context safety.
- Controlled rollout can proceed without another fundamentals refactor.
- The narrow post-Release-1 follow-up backlog has repo-local guidance, routing, and replay hardening in place; one real IntelliJ rerun remains to confirm the host behavior improves accordingly.
- Release 2 remains intentionally unstarted until a separate rollout decision is made.

This plan is the proposed replacement for the broader rewrite direction in `salt-ai-tooling-refactor-plan.md`.
It is intended to guide the next 1-2 releases before broader consumer rollout.

## Executive Decision

Do not change Salt's public product shape again before consumer rollout.

Keep the current public model stable:

- one public skill: `salt-ds`
- one public CLI: `salt-ds`
- one MCP package: `@salt-ds/mcp`
- one transport-stable workflow vocabulary:
  - `init`
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
  - `review --url`

Do not make `lookup_salt`, `discover_salt`, and `plan_salt_composition` the new public front door in the next 1-2 releases.

Instead:

1. correct and harden the current public API first
2. simplify brittle internals without changing the product story
3. expose advanced support tooling only where it clearly improves host behavior
4. invest next in stronger grounding, follow-through, and handoff UX

## Why This Plan Replaces The Broader Rewrite

The competitor landscape as of April 20, 2026 points to a consistent pattern:

- MUI uses MCP plus docs-backed guidance and host instructions, not a workflow rewrite into many public primitives
- Shopify ships plugin, skills, and MCP together, with one coherent product story
- Storybook combines structured component manifests, MCP tools, and validation loops
- Figma combines MCP, design-system connections, and explicit handoff into coding tools
- v0 and shadcn succeed with strong registry context, but they optimize for first-draft generation rather than repo-safe workflow control

Salt is strongest where the market is weakest:

- exact-request safety
- semantic match status
- follow-through gating
- repo-aware policy layering
- transport parity across MCP and CLI
- eval-driven workflow behavior

The current risk is not that Salt lacks enough tool surfaces.
The risk is that the current public API can still drift, misroute, or vary across transports in ways that reduce trust right before rollout.

## Product Principles For The Next 1-2 Releases

1. Keep the public workflow model stable.
2. Treat CLI and MCP compact output as the primary public API.
3. Fix correctness and parity before adding new surface area.
4. Prefer internal simplification over public renaming.
5. Use support tools to help strong hosts, not to replace the workflow story.
6. Use evals and replay coverage to justify every structural change.
7. Delay broad visual-generation ambitions until the current API is trustworthy.

## Competitive Success Bar

Salt does not need to out-design Claude Design, v0, or other visual-first systems.
It does need to be clearly better at the things those systems do not naturally guarantee.

For this plan to count as successful, Salt should be ahead on:

- public API stability across CLI, MCP, and skills
- exact-request safety and mismatch handling
- repo-aware policy layering and project-context correctness
- machine-readable capability metadata rather than prose-only setup
- portable handoff between design-side and code-side hosts
- eval-backed trust on common Salt workflows and known regressions
- versioned extension and conventions-pack layering without forking canonical Salt reasoning

Competitor implications:

- MUI, Shopify, and Storybook raise the bar on coherent setup and host guidance
- Figma and Claude Design raise the bar on handoff and design-intake quality
- v0 and shadcn raise the bar on speed from intent to useful starter output

Salt should answer by being the safest and most portable path from intent to correct Salt implementation, not by growing a larger and less stable public tool family.

## Efficiency Principle

Efficiency should be treated as a product requirement, not as a late optimization pass.

The goal is not generic micro-optimization.
The goal is workflow efficiency with correctness preserved.

The priority efficiency targets are:

- token efficiency
- tool-call efficiency
- host setup efficiency
- reasoning-path efficiency
- maintainer efficiency

That means:

- fewer redundant tool calls after a canonical answer is known
- smaller branchable compact responses
- less prose parsing by hosts
- fewer transport-specific integration branches
- faster path to a safe next step
- less duplicated maintainer logic across docs, CLI, MCP, and evals

Do not trade away correctness for cheapness.
Trade away redundant output, duplicated artifacts, fuzzy retries, and unnecessary host glue.

## Explicit Non-Goals

Do not do these in the next 1-2 releases unless later eval evidence forces them:

- replace `create_salt_ui` as the public create front door
- introduce a second public workflow vocabulary
- split the public skill into multiple end-user skills
- expand the default visible MCP surface far beyond the current workflow tools
- turn Salt into a broad prompt-to-app generator
- add a second mutation-oriented autofix product surface

## Current Foundation To Preserve

- compact `v3` public workflow contract is now implemented and repo-locally validated
- top-level workflow state is authoritative for agent action
- default MCP surface stays workflow-first and small
- support tools exist but are implementation-layer or advanced-host helpers
- project conventions stay outside canonical Salt reasoning
- canonical doc improvements that add starter scaffolds, named regions, and clearer "when not to use" guidance should be kept and extended rather than rolled back

## Release Framing

Use two releases:

- Release 1
  - fundamentals, API correctness, transport parity, trimming unnecessary changes
- Release 2
  - advanced host support and stronger front-door grounding without changing the public workflow story

If Release 1 does not meet exit criteria, Release 2 should narrow rather than expand.

## Execution Discipline

This plan should remain the strategic source of truth, not a rolling brainstorm.

To keep this as the last major refactor:

1. Do not add new top-level workstreams unless they displace an existing item.
2. Treat `Release 1 Must Ship` as the rollout gate, not as a wish list.
3. Require every implementation item to map to:
   - one release bucket
   - one acceptance artifact
   - one test or eval gate
   - one owner
4. Record completion with evidence:
   - code path changed
   - tests added or updated
   - docs updated
   - release gate passing
5. Keep status tracking in a separate execution checklist or issue tracker rather than continuously reshaping this plan.
6. Do not reopen the public architecture unless a release gate or external consumer evidence shows the current plan is failing.
7. Once scope is approved, mark this plan as approved and treat it as locked for structural changes through Release 1.
8. Route new ideas after approval into one of three places only:
   - replace an existing approved item
   - the `Cut If Schedule Slips` bucket
   - the post-rollout innovation track

## Consumer Rollout Guardrails

Treat rollout readiness as an execution problem, not as another strategy discussion.

Before broader consumer rollout:

1. Capture baseline public-surface snapshots before major implementation changes:
   - CLI compact output
   - CLI full output
   - MCP compact output
   - MCP full output
   - MCP tool metadata and instructions
   - install and setup docs
2. Treat public compatibility as preserved by default:
   - no silent field removals
   - no silent field renames
   - no hidden semantic changes between CLI and MCP
3. Do not begin Release 2 implementation until Release 1 exit criteria are green and the primary workflows have been exercised in at least two real host environments.
4. Run a pre-rollout pilot in:
   - one internal Salt repo
   - one external-like fixture repo that does not rely on maintainer assumptions
5. Require a rollback or containment path for any contract-affecting change that unexpectedly regresses host behavior.

## Release 1: Fundamentals And Public API Corrections

Status: complete and externally validated for controlled rollout. See `packages/mcp/docs/release-1-execution-checklist.md`, `packages/mcp/docs/release-1-release-evidence.md`, and `packages/mcp/docs/post-release-1-follow-up-backlog.md`.

### Release Goal

Make the existing Salt public API trustworthy enough for broader consumer rollout without forcing hosts or users to relearn the product.

### Release 1 Scope Summary

- audit and freeze the current public API
- correct CLI and MCP output mismatches
- correct docs, metadata, and release-note drift against the shipped compact contract
- harden project-context correctness
- simplify `create` routing internals without changing the public workflow
- strengthen exact-name resolution and follow-through behavior
- add release gates around compact output correctness, parity, and payload size
- remove or defer unnecessary structural changes

### Release 1 Workstreams

#### 1. Public API Audit And Freeze

Create one canonical contract matrix for all public outputs:

- MCP compact default
- MCP `view: "full"`
- CLI workflow `--json`
- CLI workflow `--full`
- CLI `starter-only` JSON path
- support-tool outputs when exposed to advanced hosts

Required changes:

1. Write one canonical public API matrix doc covering field names, meanings, and stability promises.
2. Audit all workflow commands so CLI and MCP describe the same workflow states with the same semantics.
3. Confirm the compact top-level fields are authoritative everywhere:
   - `workflow`
   - `workflow_status`
   - `canonical_complete`
   - `safe_to_implement_exact_request`
   - `requested_entity`
   - `resolved_entity`
   - `match_status`
   - `blocking_reasons`
   - `next_step`
   - `summary`
4. Audit all docs, README text, skill references, and server metadata so they describe the same public story.
5. Define which outputs are public contract, which are advanced contract, and which are internal-only.
6. Add an explicit policy for support-tool availability:
   - default workflow-only surface
   - optional advanced-host surface
   - no hidden change in meaning when support tools are absent
7. Remove public wording that tells hosts to branch on rich-only fields such as `result.ide_summary` or `workflow.implementation_gate` in default compact mode.
8. Make install and setup docs version-coherent:
   - do not mix branch-pinned skill install instructions with `@latest` MCP or CLI package instructions unless the doc is explicitly labeled as branch-only
   - pick one release-specific install story for skill, MCP, and CLI
9. Audit release notes, changesets, and launch-facing package docs so public tool counts and workflow descriptions match the actual shipped surface.
10. Fix broken or misleading public links in package READMEs and setup docs.
11. Add one machine-readable capability and version manifest that hosts can inspect without parsing prose:

- public workflow vocabulary
- support-tool availability policy
- compact contract version
- CLI/MCP runtime version
- registry version and generated-at date
- visual-input and handoff capabilities when supported

12. Capture baseline public-surface snapshots before contract-affecting implementation work and keep a diffable record through rollout.
13. Require explicit documentation for any intentional public contract change rather than letting it ride inside implementation cleanup.

Trim or remove:

- any new public-tool renames
- any new public workflow names
- any proposal that makes hosts choose between two competing product stories

#### 2. CLI And MCP Output Parity

The current top priority is not new architecture. It is making the current API correct.

Required changes:

1. Add golden parity fixtures for each workflow across CLI and MCP compact output.
2. Add golden parity fixtures for each workflow across CLI `--full` and MCP `view: "full"` where field meaning overlaps.
3. Audit `create`, `review`, `migrate`, `upgrade`, and `context` responses for naming drift and semantic drift.
4. Verify compact output remains machine-clean and single-object for CLI JSON mode.
5. Confirm full output stays explicit-only and cannot leak into compact paths accidentally.
6. Decide whether CLI `starter-only` is:
   - a supported public special-case contract
   - an advanced workflow artifact contract
   - a legacy convenience path that should be narrowed or removed
7. If `starter-only` remains, document it explicitly and test it as a separate contract rather than letting it drift unofficially.
8. Ensure `next_step` and follow-through semantics are equivalent across transports.
9. Ensure the same exact-request mismatch can never look safe in one transport and blocked in another.

Trim or remove:

- undocumented one-off JSON shapes
- transport-specific wording that changes the action the host should take

#### 3. Project Context Reliability

Repo-aware correctness is a first-class dependency and must be fixed before wider rollout.

Required changes:

1. Harden `resolution.status` for project context:
   - `resolved`
   - `fallback`
   - `needs_explicit_root`
   - `mismatch`
2. Ensure weak or mismatched context never marks repo-aware readiness as safe.
3. Add explicit `retry_with.root_dir` and `retry_with.context_id` guidance.
4. Ensure weak context is not cached as if it were trusted context.
5. Add compact context health summaries that hosts can branch on safely.
6. Strengthen docs and metadata so hosts pass `root_dir` on first repo-aware use and reuse `context_id` after that.
7. Add negative tests for wrong-root and multi-root cases.

Trim or remove:

- any implicit session-global repo assumptions that bypass explicit context

#### 4. Create Workflow Corrections Without Public Rewrite

`create_salt_ui` should be internally simpler and more reliable, but it should remain the public create workflow for now.

Required changes:

1. Reduce `resolveSolutionType` and keyword-routing brittleness.
2. Make exact entity and alias resolution dominate broad keyword hints.
3. Add known-component safeguards so follow-up prompts do not drift after a canonical entity is known.
4. Improve primary-noun handling for prompts like:
   - confirmation dialog with warning icon
   - user profile with tabs and avatar
   - file manager with breadcrumbs and table
5. Improve comparison quality for:
   - `Table` vs `Data grid`
   - `Dialog` vs nearby containers
   - chart prompts vs layout primitives
   - navigation shell prompts vs tabs or toolbar drift
6. Keep `discover_salt` and `get_salt_entity` as internal support paths for now rather than making them the new public entry story.
7. Preserve current workflow outputs and public compact semantics while simplifying internals.

Trim or remove:

- any proposal that deprecates `create_salt_ui` in Release 1
- any new public `lookup_salt` tool added just to mirror `get_salt_entity`

#### 5. Follow-Through And Host Safety

Follow-through is one of Salt's real differentiators and should become more deterministic.

Required changes:

1. Make exact-name follow-up the default once the canonical entity is known.
2. Add structured `next_call` guidance or equivalent deterministic call-shape metadata.
3. Keep `suggested_follow_ups` intentionally small.
4. Stop emitting fuzzy broad-query follow-ups when an exact target is already known.
5. Add stable rule IDs for follow-through and blocked states where missing.
6. Ensure `required_follow_through` stays aligned with page-level or region-level composition expectations.
7. Add replay coverage for known follow-up drift failures.

Trim or remove:

- large lists of speculative follow-ups in compact output
- fuzzy re-query instructions that undercut an already-known canonical answer

#### 6. Efficiency And Payload Discipline

Public outputs should stay token-efficient and host-friendly.

Required changes:

1. Keep compact output focused on branchable top-level state.
2. Deduplicate repeated notes, URLs, and policy fragments.
3. Add payload-size budgets for compact responses.
4. Add growth budgets for full responses so they do not sprawl without limit.
5. Keep starter code, long guide lists, and raw debug data behind explicit rich/full access.
6. Add workflow-efficiency budgets, not just payload budgets:
   - tool calls per successful workflow
   - repeated-call rate after canonical resolution
   - time-to-safe-next-step
   - setup steps to first successful run
7. Prefer machine-readable metadata and manifests over repeated prose explanation where hosts need to branch programmatically.

Trim or remove:

- evidence dumps in compact mode
- repeated guidance fragments that hosts do not need to branch safely

#### 7. Skills, Docs, And Host Guidance Alignment

The host story should be as coherent as the runtime story.

Required changes:

1. Align skill wording with the accepted compact public contract.
2. Align README, server metadata, MCP setup docs, and CLI help.
3. Document advanced support tools as optional host enhancements rather than the default user journey.
4. Add one clear "public product story" page:
   - workflow-first by default
   - support tools for advanced hosts
   - compact first, full only when needed
5. Add one clear "host integration contract" page for Codex, Claude Code, Cursor, Copilot, and JetBrains-style hosts.
6. Align maintainer and eval docs with the compact-contract decision:
   - compact top-level workflow fields are the public branching contract
   - `result.ide_summary` remains rich/full or eval-normalized detail, not the default public contract
7. Make release-candidate docs review a required gate before publish:
   - package README accuracy
   - setup/install path coherence
   - release note accuracy
   - broken-link check

Trim or remove:

- stale wording that implies support tools are absent forever
- stale wording that implies a broader public-tool rewrite is already planned

#### 8. Eval And Release Gates

Release 1 should be blocked by correctness regressions, not by taste debates.

Required changes:

1. Add transcript replay fixtures for real failure cases.
2. Score outputs on:
   - exact-request correctness
   - context safety
   - next-step quality
   - payload size
   - CLI/MCP parity
   - workflow efficiency
3. Add release gates for compact public contract regressions.
4. Add release gates for common-surface create queries:
   - dashboard
   - table plus filters
   - form page
   - dialog workflow
   - navigation shell
5. Add release gates for known exact-name prompts and aliases.
6. Add efficiency scorecards for the public workflows:
   - compact payload bytes
   - full payload bytes
   - tool calls per successful outcome
   - repeated-call rate after canonical resolution
   - approximate time-to-safe-next-step
   - setup steps to first successful run
7. Add cross-host acceptance runs for the primary workflows in at least two real host environments before Release 1 is considered done.
8. Add one internal-repo pilot and one external-like fixture-repo pilot before broader rollout.

### Release 1 Recommended Cut Line

Must ship in Release 1:

- public API audit and freeze
- CLI/MCP compact parity
- project-context hardening
- create-routing fixes without public rewrite
- follow-through hardening
- payload budgets
- transcript replay gates

Can slip from Release 1 if needed:

- full-mode cleanup beyond parity-critical work
- broad docs polish beyond contract clarity

Must not be added to Release 1:

- new public workflow vocabulary
- `lookup_salt` public front-door rollout
- public deprecation of `create_salt_ui`
- broad visual-generation product work

### Release 1 Exit Criteria

1. Compact CLI and MCP outputs are contract-stable and parity-tested.
2. Repo-aware workflows fail closed on weak context.
3. Exact named asks no longer regress on the main known drift cases.
4. Hosts can branch on top-level workflow fields without nested artifact inspection.
5. All public docs describe the same product model.
6. Install docs, release notes, and package READMEs describe the same shipped surface and version story.
7. Hosts can inspect supported workflow surface and version metadata from a machine-readable capability manifest rather than prose alone.
8. Public workflows meet agreed efficiency budgets without regressing correctness.
9. Baseline and final public-surface snapshots can be diffed and every contract-affecting change is documented.
10. Primary workflows have passed in at least two real host environments using the documented setup path.
11. One internal Salt repo and one external-like fixture repo have passed the pre-rollout pilot.

## Release 2: Advanced Host Support And Better Front-Door Grounding

### Release Goal

Improve the quality of the first interaction and advanced-host behavior without destabilizing the public workflow contract.

### Release 2 Scope Summary

- expose optional support tooling where it helps strong hosts
- improve browse/lookup behavior without changing the public create story
- add constrained visual and design-input grounding where it materially improves migrate and create
- improve handoff and design-system ingestion

### Release 2 Workstreams

#### 1. Advanced Support Tool Surface

This is the safest place to add capability after fundamentals are fixed.

Candidate changes:

1. Decide whether to expose `discover_salt`, `get_salt_entity`, and `get_salt_examples` as an advanced-host MCP surface.
2. If exposed, keep them clearly secondary to the workflow-first public story.
3. Document the host fallback behavior when support tools are unavailable.
4. Keep workflow outputs transport-stable even when support tools are present.
5. Do not add a new public `lookup_salt` if `get_salt_entity` already covers the need.

Preferred direction:

- expose and document the existing support tools rather than inventing parallel replacements

#### 2. Discover And Lookup Improvements

Improve the browsing layer, but keep it clearly separate from the workflow-first story.

Candidate changes:

1. Reposition `discover_salt` as optional catalog and exploration support for strong hosts.
2. Move broad exploratory ranking and fuzzy browsing behavior into `discover_salt` where useful.
3. Keep exact lookup grounded in `get_salt_entity`.
4. Keep `create_salt_ui` responsible for public create workflow semantics and safety gating.

#### 3. Visual Grounding And Design Inputs

Competitors are raising the bar on design-system-aware first drafts and handoff.
Salt should answer that, but narrowly.

Candidate changes:

1. Add screenshot and mockup grounding for `migrate` first.
2. Add visual evidence to `review` only where it materially improves source-first validation.
3. Keep create-time visual generation constrained and secondary.
4. Normalize design-tool inputs into workflow-safe artifacts such as `source_outline`.
5. Add component-mapping support before broader design-to-code ambitions.

Do not do:

- broad prompt-to-app generation
- turning Salt MCP into a general design canvas

#### 4. Design-System Ingestion And Handoff

Claude Design, Figma, Storybook, and Shopify all strengthen the bridge between structured system context and real implementation.
Salt should improve that bridge in a focused way.

Candidate changes:

1. Improve ingestion of real examples and stories into registry semantics and starter generation.
2. Prefer source-backed examples over hand-authored fallback starter snippets when possible.
3. Improve handoff artifacts from create and migrate into code-editing flows.
4. Add one clear "design-system handoff" story for:
   - canonical Salt choice
   - required follow-through
   - starter plan
   - review/verification step
5. Define one portable `salt_handoff_bundle_v1` artifact that can be produced by CLI or MCP and consumed by coding hosts without transport-specific parsing.
6. Make the handoff bundle capable of carrying:
   - canonical decision
   - final decision after repo refinement
   - compact workflow state
   - required follow-through
   - starter snippets or starter plan
   - verification checklist
   - source URLs and version metadata
7. Add one external design-intake contract so upstream tools such as Figma Code Connect, Storybook manifests, or design-host handoff bundles can normalize into Salt-safe workflow inputs instead of requiring one-off adapters per host.

#### 5. Distribution And Host-Native Setup

Competitors are making setup and instructions easier.
Salt should match that.

Candidate changes:

1. Add clearer host-native setup docs for:
   - Codex
   - Claude Code
   - Cursor
   - VS Code Copilot
   - JetBrains
2. Add recommended repo instruction snippets for each host.
3. Add a one-page install path for:
   - skill
   - MCP
   - CLI fallback
4. Clarify scope hierarchy where hosts support repo/user/org instructions.
5. Expose the machine-readable capability manifest in the places hosts already inspect:
   - MCP runtime metadata
   - CLI info output
   - canonical setup docs
6. Document host capability negotiation:
   - what to do when only workflow tools are present
   - what to do when advanced support tools are present
   - what to do when visual-input or handoff contracts are unavailable
7. Productize shared conventions packs as versioned extension units:
   - explicit compatibility with Salt tooling versions
   - clear provenance for which pack or pack layer influenced the final answer
   - private or package-backed distribution paths for enterprise consumers

### Release 2 Recommended Cut Line

Must ship only if Release 1 is solid:

- advanced support-tool exposure decision
- discover/lookup improvements using existing support tools
- targeted migrate-first visual grounding
- stronger source-backed example and handoff pipeline

Can slip:

- broader host documentation polish
- optional design-tool adapters

Must not be added to Release 2 unless separately justified:

- public workflow model rewrite
- second public skill
- public rename from `create_salt_ui` to a new tool family

### Release 2 Exit Criteria

1. Strong hosts can use support tools without changing the default user story.
2. Visual grounding measurably improves migrate or create quality on evals.
3. Handoff quality improves without weakening safety gates.
4. Setup and instruction docs are competitive with MUI, Shopify, Storybook, and Figma.
5. A portable handoff bundle exists so design-side and code-side hosts can continue the same Salt workflow without transport-specific glue.

## Full Candidate Change List

Use this as the scoping list when deciding what actually ships.

### Must Keep

- compact `v3` workflow contract
- workflow-first public story
- exact-request safety fields
- `implementation_gate` and follow-through semantics
- project-context and project-policy layering
- MCP and CLI transport parity

### Must Correct

- CLI/MCP output inconsistencies
- weak context appearing usable
- exact-name routing brittleness
- fuzzy follow-up drift after canonical resolution
- compact payload bloat
- stale docs and metadata drift

### Should Add

- canonical API matrix and freeze doc
- transcript replay gates
- structured next-call guidance
- machine-readable capability manifest
- advanced-host support-tool story
- portable handoff bundle
- external design-intake contract
- versioned conventions-pack distribution
- stronger source-backed examples and starter generation
- migrate-first visual grounding
- explicit workflow-efficiency scorecards and release budgets

### Should Delay

- public-tool family rewrite
- major create workflow renaming
- multi-surface design canvas ambitions
- broad new generation surfaces

## Baseline Scope Recommendation

Recommended scope:

- Release 1: complete
- Release 2: medium

That means:

- fully harden fundamentals first
- expose optional advanced-host tooling next
- add constrained visual grounding only after Release 1 parity is proven

Do not take on a public architectural rewrite before consumers start using the current foundation.

## Decision Questions For Scope Approval

1. Is `starter-only` a supported public contract, or should it be narrowed to advanced/internal usage?
2. Should support tools become officially documented in the next release, or remain implementation-layer only until after consumer rollout?
3. Is Release 2 allowed to include visual grounding, or should it stay strictly API and host-surface focused?
4. Do we want a formal public API freeze for the current workflow vocabulary through consumer rollout?

## Core Recommendation

Approve this plan with one hard rule:

No new public product story until the current one is correct.

That means the next release should primarily be a correctness and contract release, not a reinvention release.

## Post-Rollout Innovation Track

Do not treat these as part of the final pre-rollout refactor.
Treat them as the first candidate innovations after the public model has stabilized.

### Workflow Inspector And Benchmark Scorecard

Salt should likely add a small inspection and trust surface after rollout that answers:

- why did Salt choose this?
- which policy layer changed the answer?
- is the current repo or host setup healthy?
- did this result pass the common-surface benchmark?
- where did cost, latency, or repeated calls expand unnecessarily?

The ideal shape is:

- a workflow inspector view or report
- benchmark scorecards for common surfaces
- setup-health and contract-health summaries
- provenance summaries that separate:
  - canonical Salt
  - repo policy
  - final answer

Why this matters:

- it improves trust without changing the workflow architecture
- it helps enterprise consumers debug setup and policy drift
- it gives Salt a visible product differentiator that most competitors still lack
- it turns internal eval and provenance work into an external trust asset

Do this only after the Release 1 and Release 2 core work is stable.

## Scope Options

Use these options to choose the actual delivery scope before implementation starts.

### Option 1: Minimum Safe Release 1

Use this if the main objective is to remove rollout risk quickly.

Includes:

- public API audit and freeze
- CLI and MCP compact parity
- project-context hardening
- exact-name and alias robustness fixes in `create`
- follow-through hardening for known canonical targets
- payload-size budgets and compact-output cleanup
- replay and parity release gates
- docs and metadata cleanup needed for contract clarity

Excludes:

- advanced support-tool exposure
- visual grounding work
- broader source-backed starter overhaul
- host-specific polish beyond required setup clarity

Expected outcome:

- safest path to consumer rollout
- lowest product churn
- most direct answer to "is the current API correct and stable?"

Main tradeoff:

- improves trust and correctness more than discoverability or first-draft UX

### Option 2: Recommended Release 1 + Controlled Release 2

Use this if the objective is to be production-serious and still close obvious competitive gaps without changing the public product model.

Includes everything in Option 1, plus:

- official advanced-host story for `discover_salt`, `get_salt_entity`, and `get_salt_examples`
- improved browse and lookup behavior using the existing support tools
- constrained migrate-first visual grounding
- stronger source-backed examples and starter/handoff improvements
- host-native setup and instruction docs for major agent environments

Excludes:

- public rename of `create_salt_ui`
- new public `lookup_salt` front door
- second skill or second workflow vocabulary
- broad design-canvas ambitions

Expected outcome:

- strong consumer-ready foundation
- better host quality for capable agents
- better answer to Claude Design / Figma / Storybook pressure without overreacting

Main tradeoff:

- more work and more moving pieces than Option 1
- requires Release 1 correctness to land cleanly first

### Option 3: Aggressive But Still Sane

Use this if you want to push hard before rollout while still protecting the current public model.

Includes everything in Option 2, plus:

- documented advanced-host MCP surface with support tools available by policy, not by accident
- explicit `next_call` contract and stable follow-through rule IDs everywhere
- stronger create decomposition behavior using support-tool-aware host guidance
- migrate and create handoff artifacts tuned for coding-agent workflows
- more ambitious source-backed starter generation and example extraction
- a first-pass design-input adapter layer that normalizes screenshots or design-tool evidence into workflow-safe inputs

Still excludes:

- replacing the public workflow-first story
- public deprecation of `create_salt_ui`
- broad prompt-to-app generation
- large public surface expansion beyond workflow plus advanced support tools

Expected outcome:

- strongest near-term competitive position without another foundational rewrite
- much better agent ergonomics
- materially less brittle create behavior

Main tradeoff:

- highest implementation cost
- highest regression risk if not strictly gated by evals
- requires disciplined sequencing so "aggressive" does not collapse back into API churn

## Aggressive Scope Recommendation

If you want to be aggressive, choose:

- Option 3 overall
- but sequence it as:
  1. ship all Option 1 work first
  2. then add the Option 2 and Option 3 layers only after parity and safety gates are green

In practice that means:

- Release 1 should still look like a hard correctness release
- Release 2 can then be aggressive on host support, grounding, and handoff

This is the highest-aggression path I would recommend without reopening the public architecture.

## Does This Address The Create API Concern?

Yes, mostly.

The concern appears to be:

- `create` is too brittle
- small search or scoring changes can redirect outcomes unpredictably
- the tool is doing too much local routing instead of leaning into the agent

This plan addresses that concern in the right order.

### What It Fixes

1. It reduces brittle internal routing first.

   - exact names and aliases should dominate generic scoring
   - known canonical answers should lock follow-through onto exact entities
   - common drift cases get replay coverage and release gates

2. It moves broad exploratory behavior to the right place.

   - browsing and fuzzy exploration belong in `discover_salt`
   - exact grounding belongs in `get_salt_entity`
   - public create safety and follow-through still belong in `create_salt_ui`

3. It leans more on the agent without throwing away Salt's differentiators.

   - strong hosts can use support tools for decomposition and exact lookup
   - the public workflow layer still provides safety gates, match status, and repo-aware guidance

4. It stops random ranking changes from silently becoming product changes.
   - parity tests
   - replay fixtures
   - payload budgets
   - explicit compact-contract release gates

### What It Does Not Do

It does not fully turn `create` into a dumb lookup wrapper.

I do not think that would be the right move before consumer rollout, because `create` currently owns too much of the public safety contract:

- exact-request safety
- blocking reasons
- next-step guidance
- implementation gating
- follow-through

If you remove that too early, you may reduce ranking brittleness while also losing the thing that makes Salt safer than docs-only MCP products.

### The Correct Lean-Into-Agents Move

The right agent-centric move is:

- keep `create_salt_ui` as the public workflow contract
- make it less heuristic and less fuzzy internally
- let advanced hosts use support tools for decomposition, discovery, and exact lookup
- keep Salt responsible for deterministic safety and workflow state

That is a better balance than either extreme:

- not "one smart monolith forever"
- not "three raw tools and hope the host does the rest"

## Create API Recommendation

Choose Option 3, but enforce this rule:

No Release 2 aggression until Release 1 proves the current API is correct.

If that sequencing holds, then yes: this plan should directly address the core `create` brittleness concern while still leaning more into agent orchestration in a controlled way.

## Concrete Execution Backlog

This backlog assumes the approved scope is:

- Option 3 overall
- with Release 1 shipping all must-have correctness work before Release 2 expands the surface

Use the buckets below as the actual implementation tracker.

## Release 1 Must Ship

These items should block broader consumer rollout.

### A. Public API And Contract Freeze

1. Publish one canonical API matrix for all public workflow outputs:
   - MCP compact
   - MCP full
   - CLI `--json`
   - CLI `--full`
   - CLI `starter-only`
2. Classify each output path as:
   - public stable
   - advanced stable
   - internal only
3. Align docs and wording across:
   - `packages/mcp/README.md`
   - skill references
   - MCP metadata and instructions
   - CLI help
   - acceptance docs
4. Freeze the public workflow vocabulary through rollout.
5. Resolve the concrete branch-review doc drift before rollout:
   - fix MCP README wording that currently points hosts at `result.ide_summary` and `workflow.implementation_gate` as if they were the default compact contract
   - fix the consumer AI page so the skill, MCP, and CLI install paths all describe the same version story
   - fix maintainer and eval docs that still describe `result.ide_summary` as the first-class public contract
   - fix release notes or changesets that describe the wrong default MCP tool count
   - fix broken README links to maintainer docs
6. Ship one machine-readable capability manifest for hosts:
   - contract version
   - workflow vocabulary
   - support-tool policy
   - runtime version
   - registry version and generated-at date
7. Capture and store baseline public-surface snapshots before code changes:
   - CLI compact/full
   - MCP compact/full
   - MCP tool metadata
   - current install/setup docs
8. Record intentional public contract changes explicitly rather than bundling them into unrelated cleanup.

Primary repo areas:

- `packages/mcp/README.md`
- `packages/skills/salt-ds`
- `packages/mcp/src/server/serverMetadata.ts`
- `packages/cli/src/commands`
- root acceptance docs

### B. CLI And MCP Parity

1. Add golden parity fixtures for every workflow compact response.
2. Add parity checks for overlapping rich/full semantics.
3. Audit `next_step`, `summary`, `blocking_reasons`, and exact-request safety across transports.
4. Decide and document whether CLI `starter-only` remains supported.
5. Remove or narrow any undocumented JSON variants.

Primary repo areas:

- `packages/mcp/src/server/workflowOutputs.ts`
- `packages/cli/src/commands/workflow.ts`
- `packages/semantic-core/src/tools/publicContract.ts`
- CLI and MCP contract tests

### C. Project Context Reliability

1. Harden context `resolution.status`.
2. Add wrong-root and mismatch detection.
3. Add `retry_with.root_dir` and `retry_with.context_id`.
4. Ensure weak context never marks repo-aware work safe.
5. Ensure weak context is never cached as trusted.
6. Add compact host-branchable context health summaries.

Primary repo areas:

- `packages/mcp/src/server/projectContext.ts`
- `packages/mcp/src/server/toolDefinitions.ts`
- project-context tests

### D. Create Routing Corrections

1. Reduce keyword winner-take-all routing in `create`.
2. Make exact entity and alias matches dominate broad intent scoring.
3. Add protections so known canonical targets do not drift on follow-up.
4. Fix the main known prompt failures:
   - confirmation dialog with warning icon
   - user profile with tabs and avatar
   - file manager with breadcrumbs and table
5. Tighten comparison behavior for:
   - Table vs Data grid
   - Dialog vs nearby containers
   - chart prompts vs layout primitives
   - navigation shell prompts vs tabs or toolbar

Primary repo areas:

- `packages/semantic-core/src/tools/createSaltUi.ts`
- `packages/semantic-core/src/tools/createSaltUiHelpers.ts`
- `packages/semantic-core/src/tools/recommendComponent.ts`
- semantic-core and MCP regression tests

### E. Follow-Through Safety

1. Make exact-name follow-up the default when the canonical target is known.
2. Add structured `next_call` or equivalent deterministic call metadata.
3. Keep `suggested_follow_ups` minimal and intentional.
4. Add stable rule IDs for blocked and follow-through states.
5. Ensure page-level and region-level follow-through remain aligned.

Primary repo areas:

- `packages/semantic-core/src/tools/workflowContracts.ts`
- `packages/semantic-core/src/tools/publicContract.ts`
- `packages/mcp/src/server/workflowOutputs.ts`

### F. Efficiency, Payload, And Response Discipline

1. Add compact payload budgets.
2. Add full-output growth budgets.
3. Deduplicate repeated notes, URLs, and policy fragments.
4. Keep starter code and raw debug data behind explicit rich/full access.

Primary repo areas:

- `packages/mcp/src/server/workflowOutputs.ts`
- `packages/cli/src/commands/workflow.ts`
- payload budget tests

### G. Replay And Release Gates

1. Add transcript-derived replay fixtures for real drift and context failures.
2. Score outputs on:
   - correctness
   - context safety
   - next-step quality
   - payload size
   - transport parity
3. Make these release blockers for Release 1.
4. Produce baseline-vs-final contract diffs as release evidence.
5. Run the primary workflow acceptance set in at least two real host environments using the documented setup instructions.
6. Run one internal-repo pilot and one external-like fixture-repo pilot before broader rollout.

Primary repo areas:

- `packages/mcp/src/evals`
- `packages/mcp/src/__tests__/agenticEvals.spec.ts`
- `packages/mcp/src/__tests__/workflowEvalReplay.spec.ts`
- `packages/cli/src/__tests__/cli.spec.ts`

### Release 1 Cut If Schedule Slips

These can move out of Release 1 without weakening the core rollout safety story:

- non-critical full-mode cleanup
- docs polish beyond contract clarity
- secondary payload optimization after compact budgets are enforced
- low-priority comparison improvements outside the known regression set

## Release 2 Aggressive

These items should start only after Release 1 exit criteria are green.

### A. Advanced Host Support Surface

1. Officially document the advanced-host use of:
   - `discover_salt`
   - `get_salt_entity`
   - `get_salt_examples`
2. Define availability policy:
   - what strong hosts can rely on
   - what happens when support tools are absent
3. Keep the default public story workflow-first.

Primary repo areas:

- `packages/mcp/src/server/toolDefinitions.ts`
- `packages/mcp/README.md`
- host guidance docs

### B. Discover And Lookup Improvements

1. Reposition `discover_salt` as exploration and catalog support for strong hosts.
2. Improve exact grounding through `get_salt_entity`.
3. Move broad exploratory ranking where appropriate into `discover_salt`.
4. Keep public create semantics and safety in `create_salt_ui`.

Primary repo areas:

- `packages/semantic-core/src/tools/discoverSalt.ts`
- `packages/semantic-core/src/tools/discoverSaltHelpers.ts`
- `packages/semantic-core/src/tools/getSaltEntity.ts`

### C. Agent-Centric Create Decomposition

1. Add host guidance that encourages:
   - exact lookup for known entities
   - discover for exploration
   - create for workflow-safe canonical recommendation and gating
2. Add stronger support-tool-aware decomposition patterns for multi-entity prompts.
3. Keep deterministic workflow gating in create rather than pushing all responsibility to the host.

Primary repo areas:

- `packages/skills/salt-ds`
- MCP metadata and host docs
- replay and eval scenarios

### D. Handoff Artifacts For Coding Agents

1. Improve create and migrate handoff bundles for agent implementation loops.
2. Make handoff artifacts carry:
   - canonical decision
   - final decision
   - follow-through requirements
   - starter plan
   - review/verification expectations
3. Tighten repo-refinement artifacts for project-policy-aware implementation.
4. Standardize the handoff shape as `salt_handoff_bundle_v1` so hosts do not need transport-specific parsing logic.
5. Ensure the handoff bundle can accept normalized upstream design context from external tools rather than only Salt-native workflow state.

Primary repo areas:

- `packages/mcp/src/server/workflowOutputs.ts`
- `packages/semantic-core/src/tools/workflowContracts.ts`
- CLI rich/full workflow output paths

### E. Source-Backed Examples And Starter Quality

1. Prefer docs- and story-derived examples over hand-authored fallback snippets.
2. Improve example extraction and starter generation.
3. Keep fallback templates as glue, not as the main source of truth.

Primary repo areas:

- `packages/semantic-core/src/build`
- `packages/semantic-core/src/tools/starterCode.ts`
- docs/example quality tests

### F. Visual Grounding, Narrowly Applied

1. Add migrate-first screenshot/mockup grounding.
2. Add review visual evidence only where source-first validation still benefits.
3. Normalize design or screenshot inputs into workflow-safe structures rather than free-form runtime magic.
4. Do not expand into general design generation.

Primary repo areas:

- migrate/review workflow paths
- eval harnesses
- skill guidance

### G. Host Setup And Instruction Quality

1. Publish host-native setup guides for Codex, Claude Code, Cursor, Copilot, and JetBrains.
2. Publish recommended instruction snippets and scope guidance.
3. Clarify repo/user/org instruction hierarchy where relevant.
4. Publish how hosts should inspect and use the capability manifest.
5. Document behavior when advanced support tools, visual-intake contracts, or handoff bundles are unavailable.

Primary repo areas:

- install docs
- MCP README
- skill references
- site docs

### Release 2 Aggressive Cut If Schedule Slips

Cut these first before touching the core aggressive items:

- broad host polish outside the top 3-4 host environments
- optional design-tool adapters
- non-essential full-mode artifact expansion
- secondary discover ranking improvements after exact-lookup quality is solid

## Cut If Schedule Slips

These should be the first items removed from the total 1-2 release scope if time compresses.

1. Any public rename of tools or workflows.
2. Any new `lookup_salt` wrapper that duplicates `get_salt_entity`.
3. Broad design-tool orchestration beyond screenshot or normalized input adapters.
4. Large new create-time generation surfaces.
5. Host-specific polish that does not change correctness or adoption.
6. Deep full-mode enrichment that does not affect compact branching.
7. Nice-to-have docs cleanup after the public contract is already clear.

## Suggested Delivery Sequence

1. API matrix and contract freeze
2. CLI and MCP parity
3. project-context hardening
4. create routing corrections
5. follow-through safety
6. payload discipline
7. replay and release gates
8. advanced-host support-tool policy
9. discover and lookup improvements
10. handoff and source-backed starter improvements
11. migrate-first visual grounding
12. host setup and instruction polish

## Approval Shortcut

If you want the shortest scoping decision:

- approve all `Release 1 Must Ship`
- approve `Release 2 Aggressive`
- pre-approve everything under `Cut If Schedule Slips` as removable without another architecture discussion

That gives you an aggressive plan with a hard safety boundary.
