# MCP Docs

Use this folder as the minimal maintainer set for the current Salt AI direction.

## Active Docs

- [`maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)
  - architectural maintainer guide
- [`ai-tooling-operator-runbook.md`](./ai-tooling-operator-runbook.md)
  - reviewer and operator map for evidence-backed Salt AI workflow changes
- [`public-api-matrix.md`](./public-api-matrix.md)
  - current `salt_workflow_v1` public contract matrix
- [`salt-workflow-v1-host-contract.md`](./salt-workflow-v1-host-contract.md)
  - compact workflow contract for host and skill consumers
- [`ai-tooling-security-threat-model.md`](./ai-tooling-security-threat-model.md)
  - threat model for MCP, generated context, repo policy, host adapters, and persistence
- [`host-validation-checklist.md`](./host-validation-checklist.md)
  - short real-host validation checklist for the current build

## Proof Artifacts

- [`ai-tooling-host-benchmark-packet.md`](./ai-tooling-host-benchmark-packet.md)
  - host benchmark packet for external validation
- [`ai-tooling-host-benchmark-scenarios.json`](./ai-tooling-host-benchmark-scenarios.json)
  - machine-readable scenario list used by the benchmark packet
- [`host-results/salt-ai-tooling-host-result.schema.json`](./host-results/salt-ai-tooling-host-result.schema.json)
  - JSON schema for completed S1-S9 host benchmark result artifacts

Consumer-facing guidance lives in [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx).
Keep only the current direction and live contract docs here. Use Git history for older pre-release planning records.
