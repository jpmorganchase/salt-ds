# Salt AI Tooling Reviewer And Operator Runbook

Status: active maintainer guide

Use this runbook when reviewing, operating, or extending Salt AI tooling across
semantic-core, CLI, MCP, and the `salt-ds` skill.

This file is a map of the tooling workflow. It is not a source of Salt product
facts. Generated Salt claims must come from structured evidence, or the tooling
must report an unsupported or degraded state.

## Evidence Sources

Only these sources may support generated Salt claims:

- semantic-core registry records
- source-backed docs, examples, component source, or token data
- repo-local `.salt` project policy
- explicit workflow input

Do not move missing facts into prompts, skill prose, CLI handlers, MCP tool
descriptions, generated docs, or tests. If an output cannot resolve a claim
through evidence, record a docs/registry gap or return unsupported/degraded
status.

## Layer Map

Use this map to review the stack without reading every file first.

- `packages/semantic-core/src/evidence.ts`
  - EvidenceRef shape and validation.
- `packages/semantic-core/src/context*.ts`
  - generated context, manifests, coverage audits, unsupported surfaces, and
    release gates.
- `packages/semantic-core/src/generatedArtifactValidation.ts`
  - shared validation for generated artifacts before CLI or MCP exposes them.
- `packages/semantic-core/src/reviewReport*.ts`
  - durable report serialization and EvidenceRef preservation for review
    outputs.
- `packages/semantic-core/src/workflowFollowupReports.ts`
  - follow-up report serialization for workflow continuation.
- `packages/semantic-core/src/aiSetup.ts` and
  `packages/semantic-core/src/aiEvidenceClosureReport.ts`
  - setup and closure reporting contracts.
- `packages/cli/src/commands`
  - CLI transport and command wiring. Keep behavior delegated to semantic-core.
- `packages/mcp/src/server` and `packages/mcp/src/resources`
  - MCP transport, resource exposure, and tool metadata. Keep Salt facts out of
    tool descriptions.
- `packages/skills/salt-ds`
  - host-facing orchestration instructions. Keep the skill thin and point it at
    generated evidence rather than duplicating Salt facts.
- `packages/mcp/docs/ai-tooling-evidence-gap-register.md`
  - active list of missing source evidence and unsupported/degraded states.

## Run Phases

### 1. Intake

Identify the requested workflow and the likely transport surface:

- CLI command
- MCP tool or resource
- skill orchestration
- generated context or report
- registry/docs extraction

If the request needs a Salt fact, identify the evidence source before changing
the emitting layer.

### 2. Source Check

Before adding behavior, check the earliest source that can own it:

- canonical docs or examples
- component source or token data
- registry extraction
- `.salt` project policy
- explicit workflow input

If the source does not exist or cannot be extracted safely, add or update a
docs/registry gap. Do not patch the missing evidence by adding prompt guidance.

### 3. Shared Serialization

For any generated context, report, validation result, follow-up, setup output,
or closure output:

- model the data in semantic-core
- validate EvidenceRefs in semantic-core
- expose the same serialized shape through CLI and MCP
- let the skill describe how to call the shared workflow, not restate the facts

### 4. Release Gate

Before treating generated output as supported:

- validate every EvidenceRef
- verify registry fingerprints are current
- block undocumented props, tokens, imports, examples, statuses, and
  accessibility claims
- preserve explicit coverage gaps
- keep unsupported surfaces visible

Blocked output is useful signal. Do not turn it into confident guidance.

### 5. Slice Close-Out

For each slice, report:

- files changed
- Salt facts added and their source
- new EvidenceRef coverage
- hardcoded facts avoided or removed
- docs/registry gaps found
- tests or evals proving the guardrail
- unsupported or degraded behavior that remains

## Review Checklist

Use this checklist before accepting a change.

- Does the change add a generated Salt claim?
- Does that claim carry or resolve to an EvidenceRef?
- Did the claim come from registry data, source-backed docs/examples/source/token
  data, `.salt` policy, or explicit workflow input?
- If evidence is missing, is the result a docs/registry gap or unsupported
  state?
- Do CLI and MCP expose the same semantic-core shape?
- Did the skill stay orchestration-only?
- Do tests fail if generated context, reports, or validators emit undocumented
  props, tokens, imports, examples, statuses, or accessibility claims?
- Did the change avoid adding production Salt facts to tests, except clearly
  marked tiny fixtures?

## Useful Verification

Pick the narrowest checks that cover the edited surface, then widen before a
release or PR handoff.

```bash
yarn typecheck
yarn workspace @salt-ds/semantic-core build
yarn vitest run packages/semantic-core/src/__tests__/generatedArtifactValidation.spec.ts
yarn vitest run packages/semantic-core/src/__tests__/contextArtifacts.spec.ts
yarn vitest run packages/cli/src/__tests__/exportContext.spec.ts
yarn vitest run packages/mcp/src/__tests__/createServer.spec.ts
yarn vitest run packages/mcp/src/__tests__/publicContractParity.spec.ts
yarn vitest run packages/mcp/src/__tests__/contextCoverageProduction.spec.ts
```

Use more focused tests when the edited file already has a direct suite. Use the
broader checks when a change touches schemas, serializers, registry loading, or
transport parity.

## Unsupported Or Degraded Output

Unsupported and degraded outputs are intentional states, not failures to hide.

Use them when:

- source evidence is absent
- registry records are incomplete
- markdown or prompt serializers cannot preserve EvidenceRefs
- a report is stale or cannot be tied back to current source evidence
- a host asks for a surface the shared serializers do not support yet

Keep the output explicit about what is missing and where maintainers should
close the gap.
