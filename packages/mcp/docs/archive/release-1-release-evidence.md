# Release 1 Release Evidence

Date: April 20, 2026

This note records the repo-local release evidence for the approved Release 1 work in [`../../../salt-ai-tooling-next-releases-plan.md`](../../../salt-ai-tooling-next-releases-plan.md), plus the first real-host external validation addendum.

## Public Surface Diff Against Baseline

Baseline source:

- [`../baselines/2026-04-20-release-1/README.md`](../baselines/2026-04-20-release-1/README.md)

Final shipped snapshot:

- [`../baselines/2026-04-20-release-1-v3/README.md`](../baselines/2026-04-20-release-1-v3/README.md)

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

- [`../baselines/2026-04-20-release-1-v3/README.md`](../baselines/2026-04-20-release-1-v3/README.md)

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
  - including host-rewritten exact-name create coverage for `Metric component ...`

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
- IntelliJ-derived post-Release-1 host fixtures for:
  - partial `Metric` stop-after-starter
  - first-pass `Tabs` drift to `Vertical navigation`
  - first-pass `Table` drift to `File upload`

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

## External Host Validation Addendum

Date: April 21, 2026

Host:

- IntelliJ AI Assistant MCP client

Overall result:

- pass with host orchestration issues

### Scenario 0. Capability Manifest

- Environment: MCP host
- Prompt or action: read the Salt MCP capability manifest and report the compact workflow contract version
- Expected: capability manifest available and `contracts.compact_workflow_contract_version = "v3"`
- Actual: IntelliJ successfully read the manifest and reported `v3`
- Result: pass
- Notes: confirms live MCP contract version and manifest availability in IntelliJ

### Scenario 1. Exact Named Create

- Environment: MCP host
- Prompt: `Create a Metric in Salt.`
- Expected: exact Metric grounding, safe workflow branching, no fake completion without context or follow-through
- Actual: the agent called `create_salt_ui` with `query: "Metric"`. Initial workflow state correctly blocked on missing context and required follow-through. After explicit context handling, the workflow returned `contract = "salt_workflow_v3"`, `resolved_entity = "Metric"`, `match_status = "exact"`, `status = "partial"`, `canonical_complete = false`, `exact_request_safe = false`, and blockers for `Link`, `Stack layout`, and `Text`. The host still created `Metric.tsx` and stopped.
- Result: pass with minor host drift
- Notes: Salt contract behavior was correct. The host should not have treated the partial result as complete.

### Scenario 2. Decorative Drift Protection

- Environment: MCP host
- Prompt: `Create a user profile with tabs and avatar.`
- Expected: primary anchoring on `Tabs`, with `Avatar` treated as decoration or follow-through
- Actual: the initial create drifted to `Vertical navigation` with `no_match`. The agent recovered by querying `Tabs`, which returned `resolved_entity = "Tabs"`, `status = "partial"`, and `match_status = "broadened"`. It then queried `Avatar`, which also returned `partial` and `broadened`, and later escalated into starter-code fallback and direct Salt repo querying.
- Result: pass with orchestration issue
- Notes: Salt eventually recovered to the right surfaces, but the host flow drifted first and used a loose, inefficient recovery path.

### Scenario 3. Exact Follow-Through

- Environment: MCP host
- Prompt: `Create a file manager with breadcrumbs and table.`
- Expected: primary result anchored on `Table` with deterministic follow-through to `Breadcrumbs`
- Actual: the initial create drifted to `File upload` with `no_match`, pulling in unrelated follow-through including `File Drop Zone`. An exact-query retry recovered to `resolved_entity = "Table"` with `Breadcrumbs` follow-through, but `match_status` remained `misrouted`.
- Result: fail on first pass, pass with routing issue on exact-query retry
- Notes: follow-through behavior is directionally correct on retry, but first-pass routing is still not stable enough.

### Scenario 4. Wrong Root Or Weak Context

- Environment: MCP host
- Prompt: repo-aware review from the wrong root
- Expected: fail closed, no false trust, actionable clarification or retry path
- Actual: the agent called `get_salt_project_context`, received `resolution.status = "mismatch"`, recognized that the root did not expose recognizable repo signals, and asked for clarification instead of continuing.
- Result: pass
- Notes: this is the intended safe behavior.

## External Validation Summary

- `salt_workflow_v3` contract availability: pass
- capability manifest availability: pass
- exact-name safety: pass
- weak-context safety: pass
- host branching from top-level workflow state: pass
- create routing under paraphrase or broadening: mixed
- IntelliJ host orchestration efficiency: mixed

## Sign-Off Read

Release 1 is externally validated for contract shape and safety behavior in IntelliJ, but the host-driven create flow still shows orchestration and routing weakness under broadened or paraphrased prompts. This supports rollout of the Release 1 foundation, with follow-up work focused on host orchestration quality and create routing robustness rather than another contract rewrite.
