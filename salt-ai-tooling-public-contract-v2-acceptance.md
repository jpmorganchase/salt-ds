# Salt AI Tooling Public Contract V2 Acceptance

## Status

Accepted and shipped.

The compact public contract is now the default compact shape for:

- MCP workflow responses
- CLI workflow `--json`

Rich workflow output remains explicit-only behind:

- MCP `view: "full"`
- CLI `--full`

The temporary non-default workflow validation surfaces used during rollout have been removed.

## Evidence

### 1. Compact default output is machine-clean

Verified by live runner coverage in:

- `packages/mcp/src/__tests__/liveEvalHarness.spec.ts`
- `packages/cli/src/__tests__/cli.spec.ts`

Relevant checks:

- the real MCP-local runner passes the default scenario pack
- the real CLI-local runner passes the default scenario pack
- CLI workflow `--json` tests parse stdout as a single JSON object

### 2. Semantic mismatch cannot look implementation-safe

Verified by replay coverage in:

- `packages/mcp/src/__tests__/workflowEvalReplay.spec.ts`

Covered cases:

- exact match
- broadened descriptive match
- cross-family misroute
- named misroute

Acceptance rule:

- `broadened` and `misrouted` compact results must keep `safe_to_implement_exact_request: false`
- they must not report `workflow_status: "success"`

### 3. Compact payloads are materially smaller than legacy rich create output

Measured from replay fixtures used by the acceptance test:

- average compact create `workflow_result` bytes: `487.75`
- average legacy rich create `workflow_result` bytes: `1059.5`

Compact create output is therefore less than half the size of the legacy rich create shape in this replay set.

### 4. Transport fallback behavior is still correct

Verified by live runner coverage in:

- `packages/mcp/src/__tests__/liveEvalHarness.spec.ts`

Covered cases:

- MCP available
- CLI fallback when MCP is unavailable
- clean stop when all transports are unavailable

## Repro Commands

```bash
yarn vitest run packages/mcp/src/__tests__/workflowEvalReplay.spec.ts
yarn vitest run packages/mcp/src/__tests__/liveEvalHarness.spec.ts
yarn vitest run packages/cli/src/__tests__/cli.spec.ts -t "prints compact create json output|surfaces semantic-match metadata for exact named create json|writes compact create json to --json-file|surfaces broadened semantic-match metadata for descriptive create json|prints compact review json output|prints compact migrate json output|prints compact upgrade json output"
yarn biome check packages/mcp/src/server/toolDefinitions.ts packages/mcp/src/evals/workflowEvalHarness.ts packages/mcp/src/evals/workflowEvalScenarios.ts packages/mcp/src/__tests__/liveEvalHarness.spec.ts packages/mcp/src/__tests__/workflowEvalReplay.spec.ts packages/cli/src/commands/workflow.ts packages/cli/src/lib/args.ts packages/cli/src/__tests__/cli.spec.ts
```

## Notes

- The MCP stdio runner required a transport-layer schema cleanup. Workflow tool `outputSchema` is now permissive at the SDK boundary so compact and rich outputs can both travel without breaking `structuredContent`.
- Replay assets were renamed from `*-agent-v2.json` to `*-compact-v2.json` to remove transitional naming from the acceptance corpus.
- Workflow CLI help now advertises `--json` as the compact contract path for workflow commands and `--full` as the explicit rich-output path.
