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

### Public Support Tools

Read-only retrieval support (always safe):

- `get_salt_entity` — retrieve canonical Salt entity details by name
- `get_salt_examples` — retrieve canonical Salt examples for an entity
- `discover_salt` — broad Salt discovery and routing for exploratory requests

Advanced support tools (optional, for sophisticated hosts):

- `validate_salt_review_report` — validate durable review reports (read-only)
- `resume_salt_review` — resume state for durable review reports (read-only)
- `persist_salt_context_pack` — write release-gated context pack (**readOnlyHint: false**, **destructiveHint: true**, idempotent)
- `persist_salt_generated_artifact` — write release-gated artifact (**readOnlyHint: false**, **destructiveHint: true**, idempotent)

Rules:

- All thirteen tools are part of the default public MCP surface
- The four advanced tools are clearly marked as optional/advanced in capability manifest `support_tools`
- The two persistence tools have `readOnlyHint: false` and `destructiveHint: true` because caller-supplied paths inside `root_dir` may overwrite existing files (see §Annotation Audit below)
- Report validation and persistence tools do not change workflow contract semantics
- Hosts may choose to expose only workflow tools and basic support tools; advanced tools remain discoverable

## Annotation Audit (Task 0.8)

Performed: 2026-06-09. Source: [Tool Annotations as Risk Vocabulary](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/) (David Soria Parra et al., MCP blog, 2026-03-16).

The post defines what each existing hint should drive in a client and gives five evaluation questions: (1) what client behavior does it enable, (2) does it need trust to be useful, (3) could `_meta` handle it instead, (4) does it help reason about combinations, (5) is it a hint or a contract.

The Salt MCP tool surface (13 tools) was audited against the table below.

| Hint | Client behavior the spec wants it to drive |
|---|---|
| `readOnlyHint: true` | Skip the confirmation dialog |
| `destructiveHint: true` | Show a warning before executing |
| `idempotentHint: true` | Safe to retry on failure |
| `openWorldHint: true` | Scrutinize output for untrusted content; flag a trust-boundary cross |

### Findings

| Tool | Before | After | Change |
|---|---|---|---|
| `get_salt_project_context`, `discover_salt`, `migrate_to_salt`, `create_salt_ui`, `get_salt_entity`, `get_salt_examples`, `review_salt_ui`, `upgrade_salt_ui`, `validate_salt_review_report`, `resume_salt_review` | readOnly:true / destructive:false / idempotent:true / openWorld:false | unchanged | All ten are pure read-only against the bundled registry and the local repo. `openWorldHint: false` is correct — the only external surface (`siteBaseUrl`) is read-only. |
| `bootstrap_salt_repo` | readOnly:false / destructive:false / idempotent:true / openWorld:false | unchanged | Writes managed blocks to `AGENTS.md` (or `CLAUDE.md`), `.salt/team.json`, optionally `.salt/stack.json` and a `ui:verify` script. These are additive managed-block edits to known target files, not arbitrary writes. Per the spec definition of `destructiveHint` ("the tool may perform destructive updates"), this is genuinely additive. |
| `persist_salt_context_pack` | readOnly:false / destructive:**false** / idempotent:true / openWorld:false | `destructive:` **true** | Defaults write inside `.salt/context/`, but `output_dir` and `manifest_path` are caller-overridable. Any existing files at the resolved paths are overwritten. Per spec ("may perform destructive updates"), `destructiveHint: true` is the honest answer. |
| `persist_salt_generated_artifact` | readOnly:false / destructive:**false** / idempotent:true / openWorld:false | `destructive:` **true** | `artifact_path` is always caller-supplied and may resolve to any file inside `root_dir`. The tool overwrites whatever is there when the release gate passes. The path guard (`resolveWritablePathInsideRoot`) prevents traversal outside `root_dir` but does not constrain the destination. This is exactly the case the post says `destructiveHint: true` exists for. |

### Open SEPs reviewed and deliberately not adopted

The post lists five in-flight annotation SEPs: #1913 Trust and Sensitivity, #1984 Comprehensive Governance/UX, #1561 `unsafeOutputHint`, #1560 `secretHint`, #1487 `trustedHint`. None apply to Salt today: the registry data is canonical, no tool returns secrets, none reaches untrusted networks. Re-evaluate if any of these land in the spec or if Salt MCP grows a remote transport or an open-world tool.

### Things we deliberately did not change

- **No new annotation namespacing via `_meta`.** The post's question 3 says `_meta` is for namespaced metadata only one deployment style cares about. Nothing Salt-specific qualifies today.
- **`openWorldHint` stays `false` on `review_salt_ui`** even though it accepts caller-supplied source code. User-supplied input is not "open-world" in the spec sense; openWorld is reserved for tools whose output crosses a trust boundary (web fetch, external API, etc.).
- **No annotation downgrades from `readOnlyHint: true`.** Per the post's question 5, our read-only tools are honest hints; downgrading just to be conservative would defeat the host UX (auto-approval of safe lookups).

### Re-audit triggers

Re-run this audit when any of the following happen:

1. A new tool is added to `ALL_TOOL_DEFINITIONS` in `packages/mcp/src/server/toolDefinitions.ts`.
2. A tool starts reaching an external network (would flip `openWorldHint`).
3. The MCP spec adds new annotation hints (track via the MCP blog and the Tool Annotations Interest Group).
4. A Salt MCP user reports unexpected host approval-prompt behavior in a real session.

## Current Contract Facts

1. Compact CLI and MCP emit `salt_workflow_v1`.
2. Full CLI and MCP keep the same top-level `salt_workflow_v1` contract and add `details`.
3. The capability manifest advertises compact contract version `v1`.
4. `starter-only` is a create-only debug/detail artifact, not the main public contract.
5. Host branching belongs on the v1 top-level contract, not rich details.
