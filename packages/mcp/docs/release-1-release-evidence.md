# Release 1 Release Evidence

Date: April 20, 2026

This note records the repo-local release evidence for the approved Release 1 work in [`../../../salt-ai-tooling-next-releases-plan.md`](../../../salt-ai-tooling-next-releases-plan.md).

## Public Surface Diff Against Baseline

Baseline source:

- [`./baselines/2026-04-20-release-1/README.md`](./baselines/2026-04-20-release-1/README.md)

Final shipped snapshot:

- [`./baselines/2026-04-20-release-1-v3/README.md`](./baselines/2026-04-20-release-1-v3/README.md)

Release 1 public-surface outcome:

- compact workflow vocabulary stayed stable:
  - `init`
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
  - `review --url`
- the public compact workflow contract is now `salt_workflow_v3` across CLI and MCP
- full CLI and MCP output now keep the same top-level `salt_workflow_v3` contract and add `details`
- `starter-only` stayed supported, but is now explicitly documented and enforced as:
  - create-only
  - `--json` only
  - incompatible with `--full`
- the machine-readable capability manifest is now part of the public setup contract:
  - CLI `salt-ds info --json` as `capabilityManifest`
  - MCP runtime metadata plus `salt://capabilities/manifest`
- the machine-readable capability manifest now advertises compact contract version `v3`
- create follow-through stayed compact-first:
  - compact hosts branch on `action`
  - rich/full create output now carries deterministic advanced-host follow-up under `details.workflow.implementation_gate.next_call` and `details.workflow.implementation_gate.rule_ids`
- repo context now fails closed with explicit retry contracts:
  - `retry_with.root_dir`
  - `retry_with.context_id`

## Final Artifact Snapshot

The post-migration shipped-artifact snapshot lives in:

- [`./baselines/2026-04-20-release-1-v3/README.md`](./baselines/2026-04-20-release-1-v3/README.md)

Key final observations from that snapshot:

- compact create output is the shared top-level `salt_workflow_v3` contract
- full create output keeps the same top-level contract and adds `details`
- CLI `starter-only` is narrow again instead of reusing the compact payload shape
- CLI and MCP capability metadata both advertise compact contract version `v3`
- MCP metadata still exposes the intended six-tool default public surface

## Contract And Payload Evidence

Contract evidence:

- compact CLI and MCP parity fixtures are checked in under `packages/mcp/src/__tests__/fixtures/public-contract/`
- compact and rich/full parity is enforced in `packages/mcp/src/__tests__/publicContractParity.spec.ts`
- create-routing and follow-through regressions are covered in:
  - `packages/mcp/src/__tests__/agenticEvals.spec.ts`
  - `packages/mcp/src/__tests__/registry.integration.spec.ts`
  - `packages/mcp/src/__tests__/workflowEvalReplay.spec.ts`

Payload and dedupe evidence:

- compact byte budgets are enforced in `packages/mcp/src/__tests__/publicContractParity.spec.ts`
  - create: `<= 700`
  - review: `<= 650`
  - migrate: `<= 850`
  - upgrade: `<= 650`
- full-output growth budgets are enforced in `packages/mcp/src/__tests__/publicContractParity.spec.ts`
  - create: `<= 120000`
  - review: `<= 25000`
  - migrate: `<= 400000`
  - upgrade: `<= 60000`
- parity tests also assert uniqueness on compact `blocking_reasons` plus rich `notes` and provenance/source URL arrays where applicable
- semantic-core public-contract validation stays green in `packages/semantic-core/src/tools/__tests__/publicContract.spec.ts`

## Replay And Eval Evidence

Replay corpus coverage now includes:

- prior compact and legacy create drift fixtures
- wrong-root context failure fixtures
- new create regression fixtures for:
  - Tabs over Avatar decoration
  - exact Breadcrumbs follow-through after Table
  - Chart-focused follow-through inside Analytical dashboard

Scorecard evidence:

- live eval reports now emit scorecards for:
  - correctness
  - context safety
  - next-step quality
  - payload size
  - transport parity
  - workflow efficiency
- replay reports emit the same scorecard shape

## Host And Pilot Coverage

Repo-local host coverage completed in two real transport environments:

- MCP local runner:
  - `packages/mcp/src/__tests__/liveEvalHarness.spec.ts`
- CLI local runner:
  - `packages/mcp/src/__tests__/liveEvalHarness.spec.ts`

Repo-local pilot coverage completed in both fixture classes required by the plan:

- internal Salt-style fixture repos:
  - `existing-salt`
  - `existing-salt-policy`
- external-like fixture repos:
  - `non-salt`
  - `new-project`

The default workflow scenario pack passed through both local host environments with the Release 1 budgets enabled.
