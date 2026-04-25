# Public API Matrix

Status: active `v1` contract

Last updated: April 24, 2026

## Purpose

This document defines the intended pre-release public surface for Salt AI tooling. There is no compatibility promise for older workflow shapes. Hosts should branch on the v1 contract and should not scrape prose, fallback fields, or rich output details when a v1 field exists.

## Public Surface

Default public workflow outputs:

- MCP compact workflow responses
- CLI workflow `--json`
- MCP `get_salt_project_context`
- MCP `bootstrap_salt_repo`
- CLI `salt-ds info --json`
- CLI `salt-ds init --json`

Workflow vocabulary:

- `init`
- `create`
- `review`
- `migrate`
- `upgrade`
- `review --url`

Rich/debug surfaces:

- MCP `view: "full"`
- CLI `--full`
- CLI `starter-only`
- optional support-tool outputs when intentionally exposed

Rich/debug surfaces may add detail, but they do not define host branching behavior. The top-level v1 workflow contract remains authoritative.

## Workflow Mapping

| User workflow  | CLI path                         | MCP path                   | Default contract       |
| -------------- | -------------------------------- | -------------------------- | ---------------------- |
| `create`       | `salt-ds create <query> --json`  | `create_salt_ui`           | `salt_workflow_v1`     |
| `review`       | `salt-ds review <target> --json` | `review_salt_ui`           | `salt_workflow_v1`     |
| `migrate`      | `salt-ds migrate <query> --json` | `migrate_to_salt`          | `salt_workflow_v1`     |
| `upgrade`      | `salt-ds upgrade ... --json`     | `upgrade_salt_ui`          | `salt_workflow_v1`     |
| repo context   | `salt-ds info . --json`          | `get_salt_project_context` | setup/support contract |
| repo bootstrap | `salt-ds init . --json`          | `bootstrap_salt_repo`      | setup/support contract |

## Compact Workflow Contract

For create, review, migrate, and upgrade workflow outputs, the public compact contract is the top-level object built from [`../../semantic-core/src/tools/publicContract.ts`](../../semantic-core/src/tools/publicContract.ts).

Compact public fields:

- `contract`
  - always `salt_workflow_v1`
- `workflow`
  - `create`, `review`, `migrate`, or `upgrade`
- `transport`
  - `cli` or `mcp`
- `status`
  - `success`, `partial`, `blocked`, or `failed`
- `request`
  - request-grounding block
  - hosts may branch on `entity`, `resolved_entity`, `match_status`, and `exact_match_required`
- `safety`
  - hosts may branch on `canonical_complete`, `exact_request_safe`, and `blocking_reasons`
- `action`
  - authoritative next-action block
  - hosts may branch on `kind`, `tool`, `mode`, `args`, `rule_ids`, and `post_action`
- `next_required_action`
  - mirrors the next action without rule/post-action decoration
- `allowed_next_actions`
  - valid action kinds the host may take next
- `recipe.steps`
  - ordered implementation or retrieval plan for composite work
- `questions`
  - user-facing blockers; non-empty questions block implementation
- `evidence`
  - source-backed grounding, missing evidence, and heuristic fallback status
- `summary`
  - short branchable summary

Compact rules:

- hosts should branch on `status`, `safety`, `action`, `next_required_action`, `recipe.steps`, `questions`, and `evidence`
- compact hosts must not require `details`
- `status: "success"` requires `safety.exact_request_safe: true`
- `safety.exact_request_safe: true` requires `evidence.status: "complete"` and source-backed evidence
- `action.kind: "implement"` is valid only when `safety.exact_request_safe` is true
- `action.kind: "implement"` on create, migrate, or upgrade requires a review post-action
- `partial`, `blocked`, and `failed` are non-implementable states
- `request.match_status: "broadened"`, `"misrouted"`, or `"no_match"` must not look implementation-safe unless the full request is covered by source-backed evidence
- create entity follow-through must rerun with the returned evidence bridge, using MCP `resolved_entities` or CLI `--resolved-entity`
- dependency, clarification, retrieval, bootstrap, and context repair actions block implementation until completed

## Setup And Support Contracts

These outputs are public, but they are not workflow contracts:

- `salt-ds info --json`
- `salt-ds init --json`
- `get_salt_project_context`
- `bootstrap_salt_repo`

Required rule:

- setup/support outputs must stay clearly separate from workflow readiness so hosts do not confuse repo inspection/bootstrap results with implementation permission

Context support fields hosts may branch on:

- `result.resolution.status`
  - `resolved`, `fallback`, `needs_explicit_root`, or `mismatch`
- `result.resolution.quality`
  - `ready` only when the repo root is trusted for repo-aware work
- `result.context_id`
  - reusable only when non-null; weak contexts return `null`
- `artifacts.summary.context_health`
  - compact trust summary for repo-specific workflow readiness
- `artifacts.summary.retry_with`
  - explicit `root_dir` / `context_id` retry contract for the next safe host call

## Capability Manifest

The shared machine-readable capability manifest is part of the public setup contract.

Manifest facts:

- manifest version: `salt_capability_manifest_v1`
- compact workflow contract version: `v1`
- default workflow vocabulary:
  - `init`
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
  - `review --url`

Published access paths:

- CLI:
  - `salt-ds info . --json`
  - top-level JSON field: `capabilityManifest`
- MCP:
  - runtime metadata field: `capability_manifest`
  - runtime metadata URI field: `capability_manifest_uri`
  - resource URI: `salt://capabilities/manifest`

Manifest rules:

- hosts should inspect the manifest rather than scraping README prose
- hosts should inspect `contracts.workflow_action_contract` for agent-agnostic v1 branching rules
- CLI and MCP must expose the same manifest semantics even though the transport wrapper differs
- the manifest is setup/support metadata, not a replacement for workflow result contracts

## Support Tool Availability Policy

Default public story:

- workflow-first surface
- compact by default
- full only when explicitly requested

Support helpers:

- may be exposed intentionally
- must stay secondary to the workflow-first public story
- must not change workflow contract meaning when absent

## Current Contract Facts

1. Compact CLI and MCP emit `salt_workflow_v1`.
2. Full CLI and MCP keep the same top-level `salt_workflow_v1` contract and add `details`.
3. The capability manifest advertises compact contract version `v1`.
4. `starter-only` is a create-only debug/detail artifact, not the main public contract.
5. Host branching belongs on the v1 top-level contract, not rich details.
