# Public API Matrix

This file is the current Salt AI tooling public-output matrix after the `salt_workflow_v3` cutover.

Status: active `v3` contract

Last updated: April 20, 2026

Use this alongside:

- [`../../../salt-ai-tooling-next-releases-plan.md`](../../../salt-ai-tooling-next-releases-plan.md)
- [`./public-contract-v3-breaking-proposal.md`](./public-contract-v3-breaking-proposal.md)
- [`./public-contract-v3-implementation-plan.md`](./public-contract-v3-implementation-plan.md)

## Purpose

This document defines:

- which output paths are public stable, advanced stable, or internal only
- which `salt_workflow_v3` fields hosts are allowed to branch on
- how Salt workflows map across CLI and MCP
- what is stable in additive full output versus transport-specific detail

## Contract Tiers

### Public Stable

These are the default consumer-facing contracts that should remain stable through rollout:

- MCP compact workflow responses
- CLI workflow `--json`
- MCP `get_salt_project_context`
- MCP `bootstrap_salt_repo`
- CLI `salt-ds info --json`
- CLI `salt-ds init --json`
- workflow vocabulary:
  - `init`
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
  - `review --url`

### Advanced Stable

These are explicit richer or host-oriented surfaces. They can evolve more than compact output, but they still need deliberate compatibility:

- MCP `view: "full"`
- CLI `--full`
- CLI `starter-only`
- optional advanced support-tool outputs when they are exposed intentionally

### Internal Only

These must not become public compatibility commitments by accident:

- hidden implementation helpers
- deep import paths
- unexposed semantic-core helper outputs
- debug-only raw artifacts unless requested through explicit full output

## Workflow Mapping

| User workflow | CLI path | MCP path | Stable default contract |
| --- | --- | --- | --- |
| `create` | `salt-ds create <query> --json` | `create_salt_ui` | `salt_workflow_v3` compact |
| `review` | `salt-ds review <target> --json` | `review_salt_ui` | `salt_workflow_v3` compact |
| `migrate` | `salt-ds migrate <query> --json` | `migrate_to_salt` | `salt_workflow_v3` compact |
| `upgrade` | `salt-ds upgrade ... --json` | `upgrade_salt_ui` | `salt_workflow_v3` compact |
| repo context | `salt-ds info . --json` | `get_salt_project_context` | setup/support contract |
| repo bootstrap | `salt-ds init . --json` | `bootstrap_salt_repo` | setup/support contract |

## Compact Workflow Contract

For create, review, migrate, and upgrade workflow outputs, the public compact contract is the top-level object built from [`../../semantic-core/src/tools/publicContract.ts`](../../semantic-core/src/tools/publicContract.ts).

Compact public fields:

- `contract`
  - always `salt_workflow_v3`
- `workflow`
  - `create`, `review`, `migrate`, or `upgrade`
- `transport`
  - `cli` or `mcp`
- `status`
  - `success`, `partial`, `blocked`, or `failed`
- `request`
  - optional request-grounding block
  - when present, hosts may branch on `entity`, `resolved_entity`, and `match_status`
- `safety`
  - stable safety block
  - hosts may branch on `canonical_complete`, `exact_request_safe`, and `blocking_reasons`
- `action`
  - stable next-action block
  - hosts may branch on `kind`, `tool`, `mode`, `args`, `rule_ids`, and `post_action` when present
- `summary`
  - short branchable summary

Compact rules:

- hosts should branch on `status`, `safety`, `action`, and `summary` first
- hosts may inspect `request.match_status` and `request.resolved_entity` when grounding behavior matters
- compact hosts must not require `details`
- `safety.exact_request_safe: true` requires `status: "success"`
- `request.match_status: "misrouted"` or `request.match_status: "no_match"` must never look implementation-safe
- create follow-through should surface through `action` as an exact-name tool call when the next canonical Salt entity is already known
- repo-context repair should surface through `action.kind = "fix_context"` rather than through full-only nested artifacts

## Full And Advanced Output Paths

| Output path | Tier | Shape | Notes |
| --- | --- | --- | --- |
| MCP compact default | public stable | top-level `salt_workflow_v3` | main host branching path |
| MCP `view: "full"` | advanced stable | top-level `salt_workflow_v3` plus `details` | explicit-only rich mode |
| CLI `--json` | public stable | top-level `salt_workflow_v3` | main CLI machine path |
| CLI `--full` | advanced stable | top-level `salt_workflow_v3` plus `details` | explicit-only rich mode |
| CLI `starter-only` | advanced stable | create-only narrow JSON artifact | explicit advanced path for starter grounding and required follow-through |

Full-output guidance:

- full output keeps the same top-level branching contract as compact output
- full output adds `details.workflow`, `details.result`, and `details.artifacts`
- hosts should keep branching on the top-level `status` / `safety` / `action` / `summary` contract even when `details` is available
- `details` is advanced-stable, but transport-specific naming or artifact shape outside the parity-tested overlap may still evolve deliberately
- `starter-only` remains create-only, requires `--json`, and must reject `--full`

## Setup And Support Contracts

These outputs are public, but they are not the workflow compact contract:

- `salt-ds info --json`
- `salt-ds init --json`
- `get_salt_project_context`
- `bootstrap_salt_repo`

`init` remains part of the public workflow vocabulary, but its shipped output should currently be treated as setup/bootstrap contract rather than as part of the accepted `salt_workflow_v3` create/review/migrate/upgrade workflow surface.

Required rule:

- setup/support outputs must remain clearly separate from the workflow compact contract so hosts do not confuse repo inspection/bootstrap results with workflow readiness results

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
- compact workflow contract version: `v3`
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

- hosts should inspect the manifest rather than scraping README prose for contract version, workflow vocabulary, support-tool policy, or runtime version
- CLI and MCP must expose the same manifest semantics even though the transport wrapper differs
- the manifest is setup/support metadata, not a replacement for workflow result contracts

## Support Tool Availability Policy

Default public story:

- workflow-first surface
- compact by default
- full only when explicitly requested

Advanced-host support tools:

- may be exposed intentionally later
- must stay clearly secondary to the workflow-first public story
- must not change the meaning of the workflow contracts when absent

## Current Contract Facts

These are the current compatibility facts after the `v3` migration:

1. Compact CLI and MCP emit `salt_workflow_v3`.
2. Full CLI and MCP keep the same top-level `salt_workflow_v3` contract and add `details`.
3. The machine-readable capability manifest now advertises compact contract version `v3`.
4. `starter-only` remains an advanced create-only path, not the main public contract story.
5. Full parity is tested only for overlapping semantics; deeper transport-specific detail remains advanced-stable rather than compact-stable.
