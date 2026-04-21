# Create Retrieval Architecture Proposal

Status: Draft
Date: April 21, 2026
Owner: AI tooling maintainers

## Decision

Do not keep fixing `create_salt_ui` with target-specific intent patches.

Replace the current prompt-specific routing drift fixes with a proper create-retrieval pipeline that:

- keeps canonical entity identity literal
- separates exact lookup from semantic retrieval
- chooses a primary owner only when evidence is strong
- lets agents help with decomposition after retrieval, not instead of retrieval
- keeps the public `salt_workflow_v3` contract stable

## Why This Change Is Needed

The current create path works, but too much logic is coupled together:

- solution-type routing happens early in [`createSaltUiHelpers.ts`](./../../semantic-core/src/tools/createSaltUiHelpers.ts)
- exact and prefix anchoring happen in [`createQueryAnchors.ts`](./../../semantic-core/src/tools/createQueryAnchors.ts)
- semantic ranking happens in [`recommendComponent.ts`](./../../semantic-core/src/tools/recommendComponent.ts)
- structural pattern routing happens in [`patternIntent.ts`](./../../semantic-core/src/tools/patternIntent.ts)
- workflow follow-through and safety gating happen after selection in [`publicContract.ts`](./../../semantic-core/src/tools/publicContract.ts) and [`workflowContracts.ts`](./../../semantic-core/src/tools/workflowContracts.ts)

That coupling makes host paraphrase hard to absorb cleanly. It also pushes us toward narrow fixes like [`createIntentSignals.ts`](./../../semantic-core/src/tools/createIntentSignals.ts), which improve one class of prompts but are not the right foundation.

## Current Failure Mode

Today, `create_salt_ui` can still behave like this:

1. infer `solution_type` too early from broad keywords
2. mix exact anchors, alias hits, structural heuristics, and field scoring in one pass
3. select a primary entity before the evidence is fully comparable across components and patterns
4. recover later through follow-through or host retries

That is why prompts like:

- `Metric`
- `user profile with tabs and avatar`
- `file manager with breadcrumbs and table`

have needed routing corrections despite the public contract already being sound.

## Goals

1. Preserve exact-name behavior for known Salt entities.
2. Improve first-pass routing for paraphrased and mixed-surface prompts.
3. Keep canonical aliases and registry identity clean.
4. Make component vs pattern choice evidence-based instead of keyword-first.
5. Give strong hosts enough grounded evidence to decompose requests without changing the public workflow model.
6. Fail closed when confidence is weak.

## Non-Goals

1. Do not introduce a new public front door such as `lookup_salt` or `plan_salt_composition`.
2. Do not change `salt_workflow_v3` compact output just to support this.
3. Do not make runtime internet or hosted embedding calls a requirement.
4. Do not pollute canonical aliases with inferred phrases.
5. Do not depend on the agent to guess the primary Salt target without grounded candidates.

## Design Principles

### Canonical Identity Stays Literal

Component names, aliases, sub-component exports, and pattern slugs should remain factual registry identity data. Phrase interpretations such as `tabbed content sections` belong in retrieval, not in canonical identity.

### Retrieval And Decision Must Be Separate

The system should first assemble grounded candidate evidence, then decide whether one owner is strong enough. Candidate generation and workflow decision should not be the same function.

### Agents Help After Grounding

The agent should help with:

- decomposing mixed prompts into primary and secondary surfaces
- following deterministic next actions
- asking clarifying questions when confidence is weak

The agent should not be the primary search system.

### Weak Confidence Must Fail Closed

If the top candidate is not dominant enough, `create_salt_ui` should return `partial` or `blocked` with a grounded next action instead of silently picking the wrong owner.

## Proposed Target Architecture

### Layer 0: Canonical Exact Resolution

Run exact and near-exact lookup first using the registry indexes that already back [`get_salt_entity`](./../../semantic-core/src/tools/getSaltEntity.ts) and [`componentLookup.ts`](./../../semantic-core/src/tools/componentLookup.ts).

Expected outcomes:

- exact entity hit
- exact ambiguity
- no exact hit

This layer should stay deterministic and literal.

### Layer 1: Create Query Normalization

Create a reusable normalization pass for create retrieval:

- tokenization and stemming
- camel-case splitting
- punctuation normalization
- plural and adjective normalization where safe
- compound phrase extraction

This should be generic. It should not be an entity-specific phrase list.

### Layer 2: Create Retrieval Corpus

Build a dedicated retrieval artifact during registry build, separate from `search_index`.

Each entity should contribute one or more retrieval documents from:

- name and aliases
- summary
- category
- `when_to_use`
- `when_not_to_use`
- derived semantics
- example titles, descriptions, and intent tags
- starter scaffold metadata
- composed-of relationships for patterns
- doc headings or short canonical doc excerpts where available

Each retrieval document should preserve provenance:

- entity type
- entity name
- field source
- source weight
- whether the evidence is owner-like, supporting, or cautionary

This is the right place to encode meaning such as `tabbed content sections`, not in canonical aliases.

### Layer 3: Hybrid Candidate Retrieval

Replace the current create-specific routing mix with a hybrid retrieval pass:

1. exact lookup candidates
2. lexical retrieval over the create corpus
3. field-aware reranking
4. aggregation from evidence documents back to entity candidates

Required scoring behaviors:

- reward full canonical matches heavily
- reward multi-token semantic matches from examples and semantics
- downweight weak single-token alias hits like `key`
- keep negative evidence from `when_not_to_use`
- treat pattern evidence and component evidence in the same candidate set before the final decision

This should produce a ranked `candidate_set`, not an immediate workflow answer.

### Layer 4: Owner And Supporting-Surface Decision

Add a small decision layer that operates on ranked candidates:

- choose a primary owner when confidence and score margin are high enough
- preserve secondary surfaces when they are meaningfully present
- return `partial` or `blocked` if the owner is not dominant

Examples:

- `Metric` -> owner `Metric`
- `user profile with tabs and avatar` -> owner `Tabs`, supporting surface `Avatar`
- `file manager with breadcrumbs and table` -> owner `Table`, supporting surface `Breadcrumbs`
- strong shell prompt with multiple regions -> owner pattern candidate if pattern evidence dominates clearly

This is where pattern-vs-component selection should happen. It should not happen before evidence is gathered.

### Layer 5: Workflow Contract Integration

Keep the compact public contract stable.

`create_salt_ui` should still emit `salt_workflow_v3`, but the internal decision path should come from retrieval evidence rather than prompt-specific routing heuristics.

Full output can add retrieval details such as:

- top candidates
- confidence
- owner/support classification
- reasons for blocking or partial status

Those details should be additive only.

### Layer 6: Agent-Assisted Decomposition

Strong hosts can use the retrieval result to continue safely:

- follow deterministic supporting surfaces
- call exact-name follow-through tools
- ask clarifying questions when the owner margin is weak

This should be host help on top of retrieval, not a substitute for retrieval.

## Proposed Internal Interfaces

Add internal types similar to:

```ts
interface CreateRetrievalEvidence {
  entity_type: "component" | "pattern" | "foundation" | "token";
  entity_name: string;
  source_kind:
    | "canonical_name"
    | "alias"
    | "summary"
    | "when_to_use"
    | "when_not_to_use"
    | "semantics"
    | "example"
    | "starter_scaffold"
    | "composition"
    | "doc_heading";
  evidence_role: "owner" | "supporting" | "caution";
  score: number;
  matched_terms: string[];
}

interface CreateCandidate {
  entity_type: "component" | "pattern" | "foundation" | "token";
  entity_name: string;
  owner_score: number;
  support_score: number;
  caution_score: number;
  total_score: number;
  confidence: number;
  evidence: CreateRetrievalEvidence[];
}
```

The exact shapes can change, but this is the abstraction we are missing today.

## Implementation Plan

### Phase 0: Freeze And Instrument

1. Freeze `createIntentSignals.ts` and do not add more target-specific entries.
2. Expand replay and eval coverage with the known host-shaped prompts.
3. Add retrieval/debug snapshots so scoring changes are explainable.

Deliverable:

- benchmark corpus for exact-name, mixed-surface, and structural prompts

### Phase 1: Build The Create Retrieval Artifact

1. Add a new build artifact, likely alongside `buildSearchIndex.ts`.
2. Generate retrieval documents from canonical component, pattern, example, and starter metadata.
3. Store provenance and field type for every retrieval document.

Candidate files:

- [`buildSearchIndex.ts`](./../../semantic-core/src/build/buildSearchIndex.ts)
- new `buildCreateRetrievalIndex.ts`
- [`types.ts`](./../../semantic-core/src/types.ts)
- registry loading and runtime cache files

Deliverable:

- a checked-in or built create retrieval artifact available at runtime

### Phase 2: Introduce A Shared Create Retrieval Engine

1. Create a new internal retrieval module, for example:
   - `createRetrieval.ts`
   - `createRetrievalRanking.ts`
2. Run exact lookup and lexical retrieval through a single candidate-set output.
3. Keep evidence visible for tests and full debug output.

Deliverable:

- one retrieval engine reused by create routing

### Phase 3: Refactor `create_salt_ui`

1. Make `create_salt_ui` consume the new candidate set.
2. Move pattern-vs-component choice to the post-retrieval decision layer.
3. Reduce `resolveSolutionType` to a hint, not a hard route.
4. Remove `createIntentSignals.ts`.
5. Remove or dramatically reduce prefix/pattern override patches that become redundant.

Deliverable:

- `create_salt_ui` = exact lookup -> retrieval -> owner decision -> workflow contract

### Phase 4: Agent And Host Integration

1. Add additive full-output debug for candidate evidence.
2. Keep compact-first host guidance.
3. Teach the skill and MCP descriptions to treat secondary surfaces as follow-through, not as primary-owner rewrites.

Deliverable:

- hosts can decompose mixed prompts without weakening compact safety

### Phase 5: Converge Shared Search Paths

After the create path is stable, decide whether to reuse the same retrieval engine in:

- `discover_salt`
- `get_salt_entity`
- capability search flows

This is optional for the first pass. Do not block create cleanup on full search unification.

## Confidence Policy

The new retrieval pipeline should have explicit thresholds:

- exact canonical hit -> immediate owner
- dominant owner with meaningful score margin -> owner plus optional supporting surfaces
- weak owner but useful candidates -> `partial`
- conflicting owner families or flat ranking -> `blocked` with clarification

This policy should be tested directly. It should not be buried inside ad hoc score adjustments.

## Evaluation Requirements

Before approval or rollout of this change, require:

1. external-host replay coverage for known paraphrase failures
2. deterministic tests for exact-name, mixed-surface, and structural prompts
3. payload budget checks for full-output retrieval debug
4. efficiency scorecards for:
   - tool calls per successful create workflow
   - compact-to-full escalation rate
   - repeated-call rate after first candidate set

## Risks

### Risk: Build Artifact Bloat

Mitigation:

- keep retrieval documents short
- use field provenance instead of large raw excerpts
- keep compact output unchanged

### Risk: New Scoring Still Overfits

Mitigation:

- use benchmark prompts from real host transcripts
- keep ranking debug visible
- require margin-based confidence rules

### Risk: Full Search Rewrite Delays Delivery

Mitigation:

- scope Phase 1-3 to create only
- treat `discover_salt` and `get_salt_entity` convergence as follow-on work

## Cut Lines

Must ship for this work to count:

- no more entity-specific create intent patches
- create owner selection comes from a ranked candidate set
- exact-name prompts remain exact
- mixed-surface prompts return grounded owner plus supporting surfaces
- weak confidence fails closed

Cut if schedule slips:

- full cross-tool search convergence
- embedding experiments
- richer design-side intake
- new public tools

## Recommendation

Approve this as the next structural create improvement only if we want to replace heuristic routing with a cleaner foundation.

If approved, start with Phases 0-3 and keep the public contract unchanged.
If not approved, at minimum freeze `createIntentSignals.ts` and stop adding target-specific patches.
