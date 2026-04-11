# Salt AI Tooling Public Contract V2 Plan

## Status

Completed.

This document now serves as the implementation record for the `v2` public contract rollout.
The migration phases below are preserved as a historical plan, but the shipped state is already:

- compact `v2` as the default public workflow contract for MCP compact responses
- compact `v2` as the default public workflow contract for CLI workflow `--json`
- rich workflow output explicit-only behind `full`
- no long-lived public compact compatibility layer

## Decision

Rewrite the default public contract consumed by agents.

Do not start with a ground-up rewrite of the internal workflow builders.

Use the current internal workflow logic as the source material, then derive a smaller, stricter, safety-first `v2` envelope for:

- MCP default compact workflow responses
- CLI JSON mode

Keep the current richer output only as `full` debugging output.

Do not keep a long-lived compatibility contract for old compact or other temporary public schemas.

---

## Why This Plan

The main problem is not that Salt lacks workflow logic. The problem is that agents have to infer too much from overlapping or noisy fields.

The current failure modes are:

- CLI JSON is too noisy and too large for reliable agent consumption
- CLI exit codes do not cleanly distinguish partial success from failure
- MCP results can look structurally valid even when the semantic target is wrong
- agents can misread combinations like `implementation_gate`, `readiness`, and starter or policy warnings

The design goal for `v2` is:

An agent should be able to answer, from top-level fields alone, whether it is safe to code the exact requested region.

This plan is for a clean public contract cutover, not permanent schema coexistence.

---

## Existing Code To Reuse

Use these modules as the starting point rather than replacing their internal logic immediately:

- `packages/semantic-core/src/tools/workflowContracts.ts`
- `packages/semantic-core/src/tools/consumerPresentation.ts`
- `packages/mcp/src/server/workflowOutputs.ts`
- `packages/mcp/src/server/toolDefinitions.ts`
- `packages/cli/src/commands/workflow.ts`
- `packages/cli/src/lib/args.ts`

Existing replay and eval assets that should drive the work:

- `packages/mcp/eval-fixtures/replays/`
- `packages/mcp/src/__tests__/agenticEvals.spec.ts`
- `packages/mcp/src/__tests__/workflowEvalReplay.spec.ts`
- `packages/cli/src/__tests__/workflowScenarios.spec.ts`
- `packages/cli/src/__tests__/cli.spec.ts`

---

## Scope

### In scope

- new compact public `v2` contract
- shared derivation rules for agent-safe top-level fields
- MCP semantic-match contract for named follow-through
- CLI machine-clean JSON
- compact-by-default output behavior
- replay-driven regression coverage
- short validation path from temporary non-default workflow surfaces to new defaults
- deletion of old compact and other temporary public schemas after cutover

### Out of scope

- replacing all internal domain models at once
- rewriting canonical Salt reasoning logic unless replay evidence proves it is necessary
- public docs polish before the contract stabilizes
- large host integration changes before the contract passes replay gates
- permanent support for multiple public compact contracts

---

## Public Contract V2

### Default top-level fields

```json
{
  "workflow": "create",
  "transport_used": "mcp",
  "workflow_status": "blocked",
  "canonical_complete": false,
  "safe_to_implement_exact_request": false,
  "requested_entity": "Header block",
  "resolved_entity": "List filtering",
  "match_status": "misrouted",
  "blocking_reasons": [
    "requested entity resolved to a different pattern family"
  ],
  "next_step": {
    "kind": "tool_call",
    "tool": "create_salt_ui",
    "mode": "exact_name",
    "args": {
      "query": "Header block"
    }
  },
  "summary": "Salt returned a different entity, so exact implementation is blocked."
}
```

### Field semantics

- `workflow`: `init | create | review | migrate | upgrade`
- `transport_used`: `cli | mcp`
- `workflow_status`: `success | partial | blocked | failed`
- `canonical_complete`: whether the current canonical Salt reasoning step is complete enough for the current exact task
- `safe_to_implement_exact_request`: whether it is safe to code the exact requested region now
- `requested_entity`: the named surface or entity the agent asked Salt to resolve
- `resolved_entity`: the entity Salt actually resolved to
- `match_status`: `exact | alias | broadened | misrouted | no_match`
- `blocking_reasons`: short reasons an agent can branch on safely
- `next_step`: exactly one recommended next action
- `summary`: one short sentence

### Optional fields

These should only appear when relevant:

- `requested_entity`
- `resolved_entity`
- `match_status`
- `artifacts`
- `truncated`
- `available_expansions`
- `full_output_bytes`

### Required rule

The default compact payload must be enough for safe agent action without reading `artifacts`.

### Authoritative-field rule

In `v2`, these top-level fields are authoritative for agent action:

- `workflow_status`
- `canonical_complete`
- `safe_to_implement_exact_request`
- `requested_entity`
- `resolved_entity`
- `match_status`
- `blocking_reasons`
- `next_step`

If rich artifacts contain signals that would change the meaning of those fields, that is a contract bug.

The agent must not need to inspect nested `implementation_gate`, `readiness`, `confidence`, or workflow-specific summaries to decide whether exact implementation is safe.

---

## Derivation Rules

These rules should live in one shared derivation layer, not be duplicated independently in CLI and MCP.

### `workflow_status`

- `failed` when the workflow or transport failed and there is no usable continuation payload
- `blocked` when the exact request cannot safely proceed without a blocker being resolved
- `partial` when there is useful guidance but follow-through or validation still remains
- `success` when the exact request is grounded and safe to implement

### `workflow_status` precedence

Apply precedence in this order:

1. `failed`
2. `blocked`
3. `success`
4. `partial`

Use this decision table:

| Condition                                                                                                                           | `workflow_status` |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| transport or workflow failure and no usable guidance                                                                                | `failed`          |
| semantic mismatch, no-match, missing required context, unresolved blocker question, or implementation blocker for the exact request | `blocked`         |
| exact request is grounded and safe now                                                                                              | `success`         |
| useful guidance exists but exact implementation is not yet safe                                                                     | `partial`         |

### `canonical_complete`

Set to `false` when any of the following are true:

- named follow-through remains
- semantic match is not `exact` or verified `alias` for an exact named request
- blocking questions remain
- starter validation or project-policy blockers make exact implementation unsafe
- required context collection is still missing for repo-aware work

Set to `true` only when the canonical Salt reasoning needed for the current exact request is complete enough that the agent should not need another Salt grounding step before coding that region.

### `safe_to_implement_exact_request`

Set to `true` only when all of the following are true:

- the semantic match is `exact` or verified `alias` when a named entity was requested
- no required follow-through remains
- no blocking questions remain
- no starter or policy blockers remain for the exact requested region
- no context blocker remains for repo-specific implementation

`safe_to_implement_exact_request` is stricter than recommendation quality. A result can be useful, well-structured, and directionally correct while still being `false`.

### `match_status`

Only emit for flows that actually resolve a named target or follow-through item.

- `exact`
- `alias`
- `broadened`
- `misrouted`
- `no_match`

Broad exploratory create or migrate flows may omit match fields.

### `match_status` resolution rules

Use these meanings:

- `exact`: the requested entity and resolved entity are the same canonical Salt entity
- `alias`: the resolved entity is a verified alias of the requested entity
- `broadened`: the result stayed in the same semantic family but expanded scope beyond the exact requested entity
- `misrouted`: the result resolved to a different semantic family
- `no_match`: no valid entity was resolved

Examples:

- `dashboard summary area -> Analytical dashboard` is `broadened`
- `Header block -> List filtering` is `misrouted`
- `App header -> Breadcrumbs` is `misrouted`
- `Keyboard shortcuts -> List filtering` is `misrouted`

### Match-field emission rules

Emit `requested_entity`, `resolved_entity`, and `match_status` when any of the following are true:

- the request explicitly names a component, pattern, sub-surface, slot, or follow-through item
- the host is following up on a named item from `required_follow_through`
- the workflow is comparing whether Salt resolved the same noun phrase the user asked for

Do not emit them for broad exploratory requests unless a named target was actually part of the workflow contract.

### Exact-follow-through resolution policy

For named follow-through such as:

- `App header`
- `Header block`
- `Metric`
- `Keyboard shortcuts`

resolution must follow this order:

1. exact canonical name match
2. verified alias match
3. explicit `no_match`

Do not silently broaden in exact-follow-through mode.

If the resolver finds a different valid Salt entity while searching for an exact named follow-through item, mark it `misrouted` instead of treating it as success.

### Blocking-reason policy

`blocking_reasons` should be short, stable, and branchable. Prefer one primary reason and at most two secondary reasons.

Common reason families:

- semantic mismatch
- no match
- follow-through required
- blocking question remains
- starter validation blocker
- project policy blocker
- context required
- transport failure

### Contradiction rule

These states are illegal in `v2`:

- `workflow_status: "success"` with `safe_to_implement_exact_request: false`
- `match_status: "misrouted"` with `safe_to_implement_exact_request: true`
- `match_status: "no_match"` with `canonical_complete: true`
- missing `next_step` when the result is not safe to implement
- rich artifacts that imply a stricter state than the top-level compact fields

Any of these should fail tests.

---

## Next Step Contract

Replace free-form next-step ambiguity with one structured object.

### Shape

```json
{
  "kind": "tool_call",
  "tool": "create_salt_ui",
  "mode": "exact_name",
  "args": {
    "query": "Metric"
  }
}
```

### Allowed `kind` values

- `tool_call`
- `ask_user`
- `implement`
- `review`
- `fix_context`

### Allowed `mode` values

- `exact_name`
- `compare_named`
- `broad_query`
- `stop_and_fix_context`

### `next_step` rules

- return exactly one `next_step`
- prefer `tool_call` when Salt can deterministically advance the workflow
- prefer `ask_user` only when the blocker is genuinely user-owned
- prefer `implement` only when `safe_to_implement_exact_request` is `true`
- prefer `fix_context` when root-dir, repo policy, or runtime evidence gaps are the main blocker

### `next_step` examples

```json
{
  "kind": "tool_call",
  "tool": "create_salt_ui",
  "mode": "exact_name",
  "args": {
    "query": "Metric"
  }
}
```

```json
{
  "kind": "ask_user",
  "question": "Should the main tabular surface use Data grid or Table?"
}
```

```json
{
  "kind": "fix_context",
  "tool": "get_salt_project_context",
  "mode": "stop_and_fix_context",
  "args": {
    "root_dir": "."
  }
}
```

---

## Banned Public Contract Patterns

The `v2` compact contract must not do any of the following:

- expose multiple overlapping top-level status systems that agents have to reconcile manually
- require agents to infer workflow meaning from exit codes alone
- require agents to open `artifacts` to know whether exact implementation is safe
- include starter code, story payloads, docs dumps, or large examples by default
- mark a result implementation-safe when the semantic match is broadened, misrouted, or no-match
- silently broaden exact named follow-through requests
- emit multiple competing next actions
- keep long-lived alternate compact public contract versions after cutover

### Rich-output policy

`full` output may include richer nested structures such as:

- `implementation_gate`
- `readiness`
- `confidence`
- `project_conventions_check`
- starter code
- related guides
- raw payloads

But in `v2` compact output they are secondary, not authoritative.

---

## Migration Strategy

### Stage 1

During rollout, validate `v2` through temporary non-default workflow surfaces before flipping the defaults.

This stage exists only to validate `v2` before default cutover. It is not a promise to support dual public contracts long term.

### Stage 2

After replay gates pass:

- make MCP default compact output return `v2`
- make CLI `--json` return `v2`

### Stage 3

Delete old compact and other temporary public schemas.

Keep only rich debugging output behind:

- MCP `view: "full"`
- CLI `--full`

Do not keep:

- `legacy` compact output
- long-lived alternate agent schema versions
- duplicate public compact contracts that agents can accidentally depend on

---

## Phase Plan

All phases below are complete and retained as a build record.

## Phase 0 - Replay Corpus And Evaluation Rubric

### Goal

Turn the known failures into deterministic replay fixtures and an explicit judging rubric.

### Work

- normalize the evidence from `chat.json` and `chat2.json`
- add replay fixtures for:
  - CLI non-zero exit with usable guidance
  - large CLI JSON output with mixed code and story content
  - MCP exact follow-up drift to wrong entity family
  - MCP clean structure plus unsafe semantic substitution
- define a scoring rubric for:
  - parseability
  - semantic correctness
  - exact-request safety
  - next-step quality
  - payload compactness

### Acceptance

- each known failure class has a replay fixture
- the rubric can distinguish safe vs unsafe outputs
- replay results are stored in a machine-readable form

### Model suggestion

- primary: `gpt-5.4 high`
- support: `gpt-5.4 mini`

### Why this split

- `high` is strong enough for failure taxonomy and rubric design
- `mini` is efficient for bulk fixture conversion and replay batch work

---

## Phase 1 - Public Contract V2 Spec

### Goal

Lock down the default compact envelope and the derivation rules before implementation starts.

### Work

- define the compact `v2` schema
- define derivation rules for:
  - `workflow_status`
  - `canonical_complete`
  - `safe_to_implement_exact_request`
  - `match_status`
- define the `next_step` object
- define when match fields are present vs omitted
- define truncation and expansion rules

### Acceptance

- one schema document exists
- one derivation rules document exists
- at least five golden fixtures cover:
  - success
  - partial
  - blocked
  - misrouted
  - no_match

### Model suggestion

- primary: `gpt-5.4 xhigh`

### Why this model

This is the highest-leverage design step. A bad contract here will create long-term noise everywhere else.

### Phase 1 implementation checklist

Ship Phase 1 as a design-and-types milestone before wiring any transport behavior.

#### Deliverables

- one frozen `v2` schema section in this plan
- one TypeScript type surface for the compact contract
- one golden fixture set for compact outputs
- one contradiction test matrix
- one model handoff note that says when design is complete and implementation can move to `high`

#### Proposed TypeScript types

Create these in a new shared file:

- `packages/semantic-core/src/tools/publicContractV2.ts`

Suggested type surface:

```ts
export type PublicWorkflowId =
  | "init"
  | "create"
  | "review"
  | "migrate"
  | "upgrade";

export type PublicTransportUsed = "cli" | "mcp";

export type PublicWorkflowStatus = "success" | "partial" | "blocked" | "failed";

export type PublicMatchStatus =
  | "exact"
  | "alias"
  | "broadened"
  | "misrouted"
  | "no_match";

export type PublicNextStepMode =
  | "exact_name"
  | "compare_named"
  | "broad_query"
  | "stop_and_fix_context";

export type PublicToolCallStep = {
  kind: "tool_call";
  tool:
    | "get_salt_project_context"
    | "create_salt_ui"
    | "review_salt_ui"
    | "migrate_to_salt"
    | "upgrade_salt_ui";
  mode: PublicNextStepMode;
  args: Record<string, unknown>;
};

export type PublicAskUserStep = {
  kind: "ask_user";
  question: string;
};

export type PublicImplementStep = {
  kind: "implement";
  scope: "exact_request";
};

export type PublicReviewStep = {
  kind: "review";
  tool: "review_salt_ui" | "salt-ds review";
  args?: Record<string, unknown>;
};

export type PublicFixContextStep = {
  kind: "fix_context";
  tool: "get_salt_project_context" | "salt-ds info";
  mode: "stop_and_fix_context";
  args?: Record<string, unknown>;
};

export type PublicNextStep =
  | PublicToolCallStep
  | PublicAskUserStep
  | PublicImplementStep
  | PublicReviewStep
  | PublicFixContextStep;

export interface PublicContractV2 {
  workflow: PublicWorkflowId;
  transport_used: PublicTransportUsed;
  workflow_status: PublicWorkflowStatus;
  canonical_complete: boolean;
  safe_to_implement_exact_request: boolean;
  requested_entity?: string;
  resolved_entity?: string | null;
  match_status?: PublicMatchStatus;
  blocking_reasons: string[];
  next_step: PublicNextStep;
  summary: string;
  truncated?: boolean;
  available_expansions?: string[];
  full_output_bytes?: number;
}
```

#### Proposed derivation inputs

Do not derive `v2` directly from raw workflow results if a richer shared workflow contract already exists.

Use a small internal derivation input shape such as:

```ts
export interface PublicContractV2Input {
  workflow: PublicWorkflowId;
  transport_used: PublicTransportUsed;
  exact_request: {
    requested_entity?: string;
    resolved_entity?: string | null;
    match_status?: PublicMatchStatus;
  };
  state: {
    implementation_ready: boolean;
    required_follow_through: string[];
    blocking_questions: string[];
    starter_blockers: string[];
    project_policy_blockers: string[];
    context_ready: boolean;
    usable_guidance_present: boolean;
    transport_failed: boolean;
  };
  summary: string;
  next_step: PublicNextStep;
}
```

This gives the implementation a narrow derivation boundary and avoids leaking every current nested concept into the new public type.

#### Golden fixture set

Create these fixtures as TypeScript or JSON snapshots:

- exact success
- partial follow-through required
- blocked semantic mismatch
- blocked no-match
- blocked context-required
- partial starter-validation blocker with usable guidance
- failed transport with no usable guidance

Suggested location:

- `packages/semantic-core/src/tools/__tests__/fixtures/publicContractV2/`

#### Contradiction test matrix

Add explicit negative tests for:

- `success` plus `safe_to_implement_exact_request: false`
- `misrouted` plus `safe_to_implement_exact_request: true`
- `no_match` plus `canonical_complete: true`
- empty `blocking_reasons` on `blocked`
- missing `next_step` on `partial` or `blocked`

#### File-by-file Phase 1 changes

`packages/semantic-core/src/tools/publicContractV2.ts`

- add the public `v2` types
- add derivation helpers
- add contradiction guards

`packages/semantic-core/src/tools/workflowContracts.ts`

- add a thin export surface for compact derivation inputs where needed
- do not rewrite existing workflow contract types yet

`packages/mcp/src/server/toolDefinitions.ts`

- add provisional `v2` schema definitions for agent-mode output
- keep them unused until Phase 3 wiring starts

`packages/mcp/src/server/workflowOutputs.ts`

- do not switch behavior yet
- add TODO anchors or helper imports only if needed for the later wiring phase

`packages/cli/src/commands/workflow.ts`

- do not switch behavior yet
- avoid mixing transport work into Phase 1

`packages/semantic-core/src/tools/__tests__/`

- add derivation and contradiction tests

#### Definition of done for Phase 1

Phase 1 is complete when:

- the compact `v2` type surface is frozen
- the derivation rules are encoded in tests
- illegal state combinations fail deterministically
- the team can start Phase 2 without reopening contract design debates

---

## Phase 2 - Shared Derivation Layer

### Goal

Implement a single shared builder that derives `v2` fields from existing internal workflow outputs.

### Work

- add a shared `publicContractV2` builder in `semantic-core`
- derive `v2` from existing workflow contracts rather than duplicating logic
- keep current rich workflow contracts intact for now
- add shared tests for the derivation rules

### Suggested file targets

- `packages/semantic-core/src/tools/workflowContracts.ts`
- `packages/semantic-core/src/tools/publicContractV2.ts`
- `packages/semantic-core/src/tools/__tests__/`

### Acceptance

- both CLI and MCP can consume the same derived `v2` object
- `workflow_status`, `canonical_complete`, and `safe_to_implement_exact_request` are not hand-built separately per transport

### Model suggestion

- primary: `gpt-5.4 high`
- support: `gpt-5.4 mini`

---

## Phase 3 - MCP Semantic-Match Hardening

### Goal

Make named follow-through safe by default.

### Work

- add `requested_entity`, `resolved_entity`, `match_status`, and `match_explanation`
- make named follow-through use strict exact-match resolution
- block `implementation_gate.clear` when `match_status` is:
  - `broadened`
  - `misrouted`
  - `no_match`
- emit one structured `next_step`
- expose compact `v2` through the temporary non-default MCP validation surface first

### Suggested file targets

- `packages/mcp/src/server/workflowOutputs.ts`
- `packages/mcp/src/server/toolDefinitions.ts`
- `packages/semantic-core/src/tools/consumerPresentation.ts`
- `packages/mcp/src/__tests__/tools.spec.ts`
- `packages/mcp/src/__tests__/agenticEvals.spec.ts`
- `packages/mcp/src/__tests__/workflowEvalReplay.spec.ts`

### Acceptance

- exact named follow-up cannot silently broaden without being marked unsafe
- clean MCP structure no longer implies safe semantic grounding
- replay cases for `Header block`, `App header`, and `Keyboard shortcuts` fail if they resolve to the wrong entity family while still looking clear

### Model suggestion

- primary: `gpt-5.4 high`
- escalation: `gpt-5.4 xhigh` for resolver rule tuning and ambiguous noun-phrase cases
- support: `gpt-5.4 mini` for bulk test updates

---

## Phase 4 - CLI Machine-Clean JSON

### Goal

Make CLI JSON transport-clean and compact by default.

### Work

- make workflow `--json` output `v2` compact JSON only on stdout
- add `--json-file <path>`
- add truncation metadata when needed
- keep logs and progress on stderr only
- remove interleaved human-readable report output from JSON mode
- separate process exit semantics from `workflow_status`
- add new exit-code mapping:
  - `0` success
  - `10` partial
  - `20` blocked
  - `30` failed

### Suggested file targets

- `packages/cli/src/commands/workflow.ts`
- `packages/cli/src/lib/args.ts`
- `packages/cli/src/__tests__/cli.spec.ts`
- `packages/cli/src/__tests__/workflowScenarios.spec.ts`

### Acceptance

- JSON mode prints parseable JSON only
- non-zero exit plus usable payload no longer leaves workflow meaning ambiguous
- compact output remains small enough for IDE terminals and agent context windows

### Model suggestion

- primary: `gpt-5.4 high`
- support: `gpt-5.4 mini`

---

## Phase 5 - Default Cutover

### Goal

Promote `v2` from temporary validation surfaces to the default compact public contract.

### Work

- switch MCP default compact output to `v2`
- switch CLI `--json` to `v2`
- keep rich output behind `full`
- update host-facing docs and examples after the cutover decision
- remove old temporary compact schema branches immediately after cutover validation passes

### Acceptance

- replay suite passes
- default outputs are smaller than current defaults
- host and eval consumers no longer need to read rich artifacts for basic safety decisions
- no supported public compact schema remains besides `v2`

### Model suggestion

- primary: `gpt-5.4 high`
- support: `gpt-5.4 mini`

---

## Phase 6 - Cleanup And Deprecation

### Goal

Remove duplicated legacy branching once the new contract is stable.

### Work

- delete dead compatibility code
- reduce duplicate schemas
- update snapshots and examples
- delete old compact and other temporary public schema builders
- keep only `full` as the rich debugging surface

### Acceptance

- no duplicated derivation logic remains
- one default compact contract exists across CLI and MCP
- no long-lived compact compatibility layer remains

### Model suggestion

- primary: `gpt-5.4 mini`
- escalation: `gpt-5.4 high` if cleanup reveals hidden contract dependencies

---

## Testing Strategy

### Contract tests

- `workflow_status` always present
- `canonical_complete` always present
- `safe_to_implement_exact_request` always present
- `next_step` always present when the output is not implementation-safe

### Semantic tests

- exact named follow-through returns `exact`, `alias`, or explicit unsafe status
- `misrouted` and `no_match` cannot look implementation-safe
- `broadened` cannot silently pass as exact

### CLI tests

- stdout is JSON only in JSON mode
- stderr noise does not corrupt stdout JSON
- compact mode omits large artifacts unless explicitly requested
- exit codes and `workflow_status` align

### Replay tests

- known bad traces are preserved as fixtures
- `v2` reduces wrong-turn rate vs current compact output
- `v2` reduces default token size and output bytes

### Agentic-eval loop

Use a simple loop for contract hardening:

1. generate `v2` output from fixture
2. score it with rubric
3. inspect failures
4. tighten derivation rule or schema
5. rerun replay suite

---

## Ship Gates

Do not cut over defaults until all of the following are true:

- CLI JSON parse success is effectively 100 percent in tests
- semantic mismatch cannot appear implementation-safe in MCP
- replay wrong-turn rate is lower than current outputs
- compact default payload size is materially smaller
- top-level fields alone are enough for an agent to decide whether exact implementation is safe

---

## Model Use Summary

### Default recommendation

- use `gpt-5.4 high` for most implementation work

### Use `gpt-5.4 xhigh` only for

- contract design
- derivation rule design
- ambiguous semantic-match cases
- stubborn replay failures that survive one or two normal fix passes

### Use `gpt-5.4 mini` for

- bulk fixture generation
- replay batch execution helpers
- test churn
- docs and snapshot updates

### Do not use older codex-specific models as the primary implementation model

They are useful only as a baseline comparison if you want to measure whether `v2` helps weaker agents too.

---

## Model Swap Guide

Use this as the practical handoff rule during implementation.

### Start with `gpt-5.4 xhigh` when

- you are still deciding field semantics
- you are still debating status precedence
- you are still defining exact-follow-through rules
- you are still writing the contradiction matrix

### Swap down to `gpt-5.4 high` when

- the `v2` field list is frozen
- each field has one authoritative meaning
- the contradiction rules are written down
- the golden fixtures are accepted by the team

At that point the work becomes implementation and test wiring, not open-ended design.

### Swap down further to `gpt-5.4 mini` when

- you are bulk-updating snapshots or replay fixtures
- you are writing repetitive tests
- you are doing file-by-file schema plumbing with already-agreed rules
- you are running large replay batches and summarizing results

### Swap back up to `gpt-5.4 xhigh` only if

- replay failures reveal a true ambiguity in the contract
- semantic-match rules produce repeated edge-case contradictions
- multiple implementers interpret the same field differently
- you are tempted to add new top-level fields because the current ones are underspecified

### Simple rule of thumb

- design ambiguity: `xhigh`
- implementation: `high`
- bulk churn: `mini`

---

## Short Implementation Summary

Rewrite the public contract first, not the whole engine. Derive a compact `v2` envelope from existing workflow logic. Harden MCP semantic matching before CLI cleanup. Use replay fixtures as the source of truth for what counts as better. Flip defaults once `v2` passes replay gates, then delete the old compact and other temporary public schema paths. Keep only `full` as the rich debugging mode.
