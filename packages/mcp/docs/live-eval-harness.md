# Live Eval Harness

This document describes the live workflow eval layer that now exists in `packages/mcp`.

Use it to compare real Salt transports against the same deterministic rubric instead of binding evaluation to one IDE host.

## Current Implementation

Checked-in harness code:

- `packages/mcp/src/evals/workflowEvalHarness.ts`
- `packages/mcp/src/evals/workflowEvalScenarios.ts`
- `packages/mcp/src/evals/runWorkflowEval.ts`
- `packages/mcp/src/evals/hostAttachmentEval.ts`

Checked-in fixtures:

- `packages/mcp/eval-fixtures/existing-salt`
- `packages/mcp/eval-fixtures/existing-salt-policy`
- `packages/mcp/eval-fixtures/non-salt`
- `packages/mcp/eval-fixtures/new-project`

Checked-in tests:

- `packages/mcp/src/__tests__/liveEvalHarness.spec.ts`
- `packages/mcp/src/__tests__/hostAttachmentEval.spec.ts`
- `packages/mcp/src/__tests__/agenticEvals.spec.ts`
- `packages/mcp/src/__tests__/createServer.spec.ts`

Commands:

- `yarn eval:deterministic`
- `yarn eval:live`
- `yarn eval:live:test`
- `yarn eval:live --runner mcp-local --scenario existing-salt-review-toolbar`
- `yarn eval:live --runner cli-local --scenario existing-salt-review-toolbar --json-out .salt-eval-cache/live-report-cli.json`

## Goal

Keep deterministic workflow tests as the required baseline, then exercise the same scenarios through real transports:

- `mcp-local`
- `cli-local`

The harness should answer:

- does the workflow return the expected `result.ide_summary`
- does verification stay present
- does MCP win when available
- does CLI fallback work when MCP is unavailable
- does the run stop cleanly when both transports are unavailable
- does canonical Salt stay separate from repo-local conventions
- does screenshot preprocessing stay outside Salt inputs

## Current Contract

Every scenario uses one normalized shape with:

- `id`
- `audience`
- `tags`
- `fixture`
- `task`
- `capabilities`
- `args`
- `expected`

Every runner returns one normalized trace with:

- `scenario_id`
- `runner_id`
- `status`
- `transport_trace`
- `workflow_result`
- `transcript`
- `artifacts`

The deterministic judge checks:

- workflow id
- summary-first output
- verification presence
- blocking-question count
- transport behavior
- canonical choice and final choice when relevant
- required and banned fragments

## Current Runners

`mcp-local`

- starts the real local MCP server through `packages/mcp/bin/salt-mcp.js`
- connects over stdio with the MCP SDK client
- loads project context before non-upgrade workflows
- retries one transient stdio startup failure and records that retry in the transport trace

`cli-local`

- shells the real `salt-ds` CLI
- normalizes CLI workflow output back into the same workflow envelope shape
- preserves `result.ide_summary` as the first-class contract even when the raw CLI payload differs

## Current Scenario Pack

Default scenarios:

- `existing-salt-review-toolbar`
- `existing-salt-upgrade-core`
- `non-salt-migrate-screen`
- `new-project-create-dashboard`
- `existing-salt-create-policy-aware-dashboard`
- `non-salt-migrate-screenshot-derived-outline`

Transport scenarios:

- `existing-salt-review-mcp-blocked-cli-fallback`
- `existing-salt-review-all-transports-blocked`

Planned but not in the default run:

- `existing-salt-review-runtime-evidence-escalation`

## Execution Model

PR-safe deterministic layer:

- `yarn eval:deterministic`

Focused live transport validation:

- `yarn eval:live --runner mcp-local --scenario existing-salt-review-toolbar`
- `yarn eval:live --runner cli-local --scenario existing-salt-review-toolbar`

Full local live suite:

- `yarn eval:live`

Focused harness regression:

- `yarn eval:live:test`

The live suite builds `@salt-ds/mcp` first, then runs the checked-in scenario pack through the selected runners.

## JSON Reports

`yarn eval:live` can emit machine-readable reports with `--json-out`.

The report includes:

- requested runner ids
- requested scenario ids
- overall pass or fail
- per-scenario runner id
- deterministic judgment
- normalized transport trace
- normalized workflow result

Store alpha or pre-release reports under `.salt-eval-cache/` locally or in a separate artifact store; do not commit ad hoc run outputs to the repo.

## Attachment Boundary

Host attachment preprocessing remains a separate deterministic surface:

- `packages/mcp/src/evals/hostAttachmentEval.ts`
- `packages/mcp/src/__tests__/hostAttachmentEval.spec.ts`

That layer checks that screenshot or mockup evidence:

- stays in the host or adapter layer
- becomes structured `source_outline` evidence before migrate
- preserves ambiguity markers
- never passes raw image payloads into Salt workflow tools

## Constraints

- do not make required CI depend on signed-in IDE hosts
- do not treat host transcripts as the only source of truth
- do not loosen the `result.ide_summary` contract to fit one transport
- do not add host automation before `mcp-local` and `cli-local` stay stable
