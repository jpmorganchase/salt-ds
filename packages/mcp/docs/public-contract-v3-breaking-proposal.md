# Public Contract V3 Breaking-Change Proposal

Status: proposal only, not approved

Date: April 20, 2026

Use this document if Salt chooses to make one final intentional breaking change to the public workflow contract before broader consumer rollout.

## Executive Recommendation

If Salt is going to make breaking changes, do it now, before:

- Release 2 implementation
- external consumer onboarding
- broader host-specific integration work

Do not break toward a larger public tool family.

Break toward a smaller, stricter, more transport-stable `v3` workflow contract.

Recommended direction:

- keep the public workflow model:
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
- keep the default MCP surface workflow-first
- keep the current product story
- break the schema, not the product model

## Why Break At All

The current compact `v2` contract is workable, but it still carries some design debt:

- public branching state is spread across multiple top-level fields
- `next_step` and `required_post_step` are split instead of being one action model
- setup/support contracts and workflow contracts still sit too close together conceptually
- full output is parity-tested, but not one literal additive schema
- `starter-only` remains a useful but awkward special path
- contract versioning is manifest-level rather than payload-level

If Salt wants the cleanest long-lived consumer surface, this is the right moment to fix that.

## Recommendation On Timing

Yes, if you choose to do this, do it before the rest of the work that matters for rollout.

Concretely:

- do it before Release 2
- do it before external consumer onboarding
- do it before host-specific adoption docs
- do it before any broader ecosystem announcement

Do not do it after consumer repos are depending on compact `v2`.

## What Should Not Change

Even in a breaking window, keep these stable:

- one public skill: `salt-ds`
- one public CLI: `salt-ds`
- one public MCP package: `@salt-ds/mcp`
- one workflow-first public model
- one small default MCP workflow surface
- no `lookup_salt` / `discover_salt` / `plan_salt_composition` front-door rewrite

## Proposed V3 Direction

### 1. Add Explicit Payload Versioning

Every workflow payload should carry its contract version directly:

```json
{
  "contract": "salt_workflow_v3"
}
```

Do not rely on the capability manifest alone for version detection.

### 2. Replace Split Branching Fields With One Action Model

Current compact branching is spread across:

- `workflow_status`
- `blocking_reasons`
- `next_step`
- `required_post_step`
- `safe_to_implement_exact_request`

In `v3`, make one action contract authoritative:

```json
{
  "action": {
    "kind": "tool_call",
    "tool": "create_salt_ui",
    "mode": "exact_name",
    "args": {
      "query": "Chart"
    },
    "rule_ids": ["create-follow-through-required"],
    "post_action": null
  }
}
```

This should be the single host branch point.

### 3. Group Request Matching State Under One Object

Instead of scattering:

- `requested_entity`
- `resolved_entity`
- `match_status`

Use one stable request block:

```json
{
  "request": {
    "entity": "chart dashboard with filters and summary",
    "resolved_entity": "Analytical dashboard",
    "match_status": "broadened",
    "exact_match_required": false
  }
}
```

### 4. Group Safety State Under One Object

Instead of mixing safety fields across the root, use:

```json
{
  "safety": {
    "canonical_complete": false,
    "exact_request_safe": false,
    "blocking_reasons": [
      "required follow-through remains: Chart"
    ]
  }
}
```

### 5. Make Full Output Additive

Compact should be the base contract.

Full should be:

- compact `v3`
- plus one additive `details` block

Suggested shape:

```json
{
  "contract": "salt_workflow_v3",
  "workflow": "create",
  "transport": "mcp",
  "status": "partial",
  "request": {},
  "safety": {},
  "action": {},
  "summary": "Salt interpreted chart dashboard with filters and summary as the broader Salt entity Analytical dashboard.",
  "details": {
    "workflow": {},
    "result": {},
    "artifacts": {}
  }
}
```

Do not keep full output as a separate parallel contract with overlapping semantics.

### 6. Separate Workflow Contracts From Setup And Support Contracts

Use separate contract families:

- `salt_workflow_v3`
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
- `salt_setup_v1`
  - `init`
  - `bootstrap_salt_repo`
- `salt_context_v1`
  - `salt-ds info --json`
  - `get_salt_project_context`

This makes it clear that repo inspection/bootstrap and workflow execution are different public APIs.

### 7. Remove `starter-only` As A Public Contract

Recommended breaking move:

- remove `starter-only` as a public mode
- replace it later, if still needed, with an explicit artifact request model

For example:

```json
{
  "expansions": {
    "starter_code": true
  }
}
```

If Salt keeps `starter-only`, it should remain advanced-only and not be part of the clean `v3` public story.

### 8. Allow More Structured `create` Input For Strong Hosts

Keep free-text input for users, but let hosts optionally provide:

```json
{
  "query": "chart dashboard with filters and summary",
  "requested_entity": "Chart",
  "match_mode": "exact_name",
  "include_starter_code": true
}
```

This does not change the product story.
It reduces brittle host-side prompt steering.

## Before / After Shape

### Current Compact V2

```json
{
  "workflow": "create",
  "transport_used": "mcp",
  "workflow_status": "partial",
  "canonical_complete": false,
  "safe_to_implement_exact_request": false,
  "requested_entity": "chart dashboard with filters and summary",
  "resolved_entity": "Analytical dashboard",
  "match_status": "broadened",
  "blocking_reasons": ["required follow-through remains: Chart"],
  "next_step": {
    "kind": "tool_call",
    "tool": "create_salt_ui",
    "mode": "exact_name",
    "args": {
      "query": "Chart"
    }
  },
  "summary": "Salt interpreted chart dashboard with filters and summary as the broader Salt entity Analytical dashboard."
}
```

### Proposed Compact V3

```json
{
  "contract": "salt_workflow_v3",
  "workflow": "create",
  "transport": "mcp",
  "status": "partial",
  "request": {
    "entity": "chart dashboard with filters and summary",
    "resolved_entity": "Analytical dashboard",
    "match_status": "broadened",
    "exact_match_required": false
  },
  "safety": {
    "canonical_complete": false,
    "exact_request_safe": false,
    "blocking_reasons": ["required follow-through remains: Chart"]
  },
  "action": {
    "kind": "tool_call",
    "tool": "create_salt_ui",
    "mode": "exact_name",
    "args": {
      "query": "Chart"
    },
    "rule_ids": ["create-follow-through-required"],
    "post_action": null
  },
  "summary": "Salt interpreted chart dashboard with filters and summary as the broader Salt entity Analytical dashboard."
}
```

## Exact Breaking Changes

If `v3` is approved, I would make these breaking changes deliberately:

1. Add required `contract` to every workflow payload.
2. Rename `transport_used` to `transport`.
3. Rename `workflow_status` to `status`.
4. Move `canonical_complete` and `safe_to_implement_exact_request` into `safety`.
5. Move `requested_entity`, `resolved_entity`, and `match_status` into `request`.
6. Replace `next_step` and `required_post_step` with `action`.
7. Promote `rule_ids` into the compact public action model.
8. Make full output additive under `details`.
9. Remove `starter-only` as a first-class public contract.
10. Split workflow/setup/context contracts into separate contract families.

## What I Would Not Break

I would not change:

- workflow names
- default MCP tool family shape
- the workflow-first user model
- the semantic meaning of create/review/migrate/upgrade
- capability manifest availability

## Migration Strategy

If approved, execute it as one focused pass:

1. Freeze `v2` and mark it legacy in docs.
2. Add internal dual-build support:
   - generate `v2`
   - generate `v3`
3. Move tests and fixtures to `v3` first.
4. Update CLI and MCP to emit only `v3` publicly.
5. Re-baseline docs, examples, replay fixtures, and eval reports.
6. Remove `v2` emission once repo-local parity is green.

Do not ship a long-lived mixed public story where some docs teach `v2` and others teach `v3`.

## Scope Impact

This is still one meaningful contract migration, not a total architecture restart.

It would add a focused pre-rollout pass for:

- public contract builders
- CLI output adapters
- MCP output adapters
- parity fixtures
- replay fixtures
- docs and setup examples
- host guidance

It should replace Release 2 start, not stack on top of it.

## Recommendation

My recommendation is:

- if you want the cleanest long-lived external API, do `v3` now
- if you want the fastest path to consumer rollout, keep `v2`

From the current branch state, I think `v3` is defensible if and only if you commit to doing it immediately and finishing it in one pass.

If you hesitate, do not partially do it.

## Suggested Decision

Choose one:

- approve `v3` and pause all remaining rollout work until the migration lands
- reject `v3` and keep the current Release 1 surface as the consumer contract

The wrong move is to keep debating it while continuing downstream adoption work.
