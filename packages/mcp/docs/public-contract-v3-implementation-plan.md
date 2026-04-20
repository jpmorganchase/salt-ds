# Public Contract V3 Implementation Plan

Status: v3 migration complete

Date: April 20, 2026

This document is the execution plan for the approved `v3` public-contract migration described in [`./public-contract-v3-breaking-proposal.md`](./public-contract-v3-breaking-proposal.md).

## Goal

Replace the current compact workflow contract with a smaller, stricter, transport-stable `salt_workflow_v3` contract before additional rollout work continues.

## Current State

Completed in this migration pass:

- shared compact `salt_workflow_v3` builders in semantic-core
- compact CLI output cut over to `v3`
- compact MCP output cut over to `v3`
- full CLI output cut over to top-level `v3` plus `details`
- full MCP output cut over to top-level `v3` plus `details`
- compact parity fixtures refreshed to `v3`
- full parity fixtures refreshed to the additive `v3` shape
- live eval and replay normalization updated so `v2` replay fixtures and `v3` live runs can be judged consistently
- active README and API-matrix guidance updated to teach the additive full `v3` shape
- post-migration shipped-artifact snapshot captured under `packages/mcp/docs/baselines/2026-04-20-release-1-v3/`

## Scope

In scope:

- shared compact workflow schema for CLI and MCP
- additive full output model with shared top-level compact fields plus `details`
- eval, replay, and parity migration to `v3`
- contract docs and setup guidance
- `starter-only` removal from the public contract story

Out of scope:

- public workflow renames
- default MCP surface expansion
- Release 2 advanced-host/front-door work
- non-workflow setup/context contract redesign beyond version labeling and clearer family separation

## Sequencing

### Phase 1. Shared Contract Foundation

1. Add the new shared `v3` types in `packages/semantic-core/src/tools/publicContract.ts`.
2. Introduce the new top-level fields:
   - `contract`
   - `workflow`
   - `transport`
   - `status`
   - `request`
   - `safety`
   - `action`
   - `summary`
3. Move deterministic follow-through and post-review behavior into `action`.
4. Keep builders centralized in semantic-core so CLI and MCP cannot drift.

Acceptance:

- semantic-core public contract tests pass against `v3`
- invalid `v3` payloads fail shared validation

### Phase 2. Compact Output Cutover

1. Switch CLI `--json` workflow output to emit only `v3`.
2. Switch MCP compact/default workflow output to emit only `v3`.
3. Remove `starter-only` from the main public contract story.
4. Keep `starter-only` temporarily only if required for internal workflow support, but document it as deprecated and non-public if it remains.

Acceptance:

- CLI and MCP compact parity fixtures updated to `v3`
- public parity tests pass

### Phase 3. Full Output Normalization

1. Make CLI `--full` emit:
   - the full `v3` top-level compact contract
   - plus `details`
2. Make MCP `view: "full"` emit the same top-level shape.
3. Stop treating full output as a separate parallel contract.

Acceptance:

- CLI/MCP full parity covers the overlapping top-level `v3` contract and additive `details` structure

### Phase 4. Eval And Replay Migration

1. Update the live eval harness to read `v3`.
2. Update replay fixtures to `v3`.
3. Keep scorecards and efficiency budgets intact during the migration.

Acceptance:

- live eval harness passes on `v3`
- replay suite passes on `v3`

### Phase 5. Doc And Guidance Cutover

1. Update public docs to teach `v3` only.
2. Update maintainer docs, matrices, and examples.
3. Record the `v2` to `v3` contract diff as release evidence.

Acceptance:

- no active docs teach `v2` compact output as the current public contract

## Initial Migration Slice

The first implementation slice should land in this order:

1. shared semantic-core `v3` builder
2. CLI compact cutover
3. MCP compact cutover
4. compact parity tests
5. eval/replay compact readers

Do not start with docs-only edits or transport-local adapters.

## Test Gates

Green gates for the completed migration:

- `packages/semantic-core/src/tools/__tests__/publicContract.spec.ts`
- `packages/mcp/src/__tests__/publicContractParity.spec.ts`
- `packages/mcp/src/__tests__/createServer.spec.ts`
- `packages/mcp/src/__tests__/workflowEvalReplay.spec.ts`
- `packages/mcp/src/__tests__/liveEvalHarness.spec.ts`
- `packages/cli/src/__tests__/cli.spec.ts`
- `yarn workspace @salt-ds/cli build`
- `yarn workspace @salt-ds/mcp build`

## Risks

Main risks:

- hidden compact-field coupling in tests and host guidance
- replay fixtures expecting `v2` exact field names
- CLI helper code assuming `workflow_status` and `next_step` live at the root
- accidental half-migration where full output and compact output tell two different stories
- machine-readable capability metadata claiming the wrong compact contract version

Mitigation:

- keep the migration centralized in semantic-core first
- update parity fixtures before broad docs edits
- update the capability manifest in the same pass as the public contract change
- keep the plan sequential and do not start Release 2 work during this cutover

## Completion Criteria

This migration counts as complete when:

- compact CLI and MCP emit only `salt_workflow_v3`
- full CLI and MCP share the same top-level `v3` contract plus `details`
- parity fixtures, replay fixtures, and live evals are all green
- active docs describe `v3` as the current public contract
- a post-migration shipped-artifact snapshot exists alongside the pre-change baseline
