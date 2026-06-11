# MCP Docs

Use this folder as the minimal maintainer set for the current Salt AI direction.

## Reading order

For new maintainers, read in this order:

1. **`maintaining-salt-ai-tooling.md`** — architectural maintainer guide. The placement rules (docs → category map → build → runtime → skill) live here. Always start here.
2. **`public-api-matrix.md`** — the current public contract surface. Anything that needs to stay stable is in this matrix.
3. **`salt-workflow-v1-host-contract.md`** — the compact `salt_workflow_v1` action contract from the host/skill consumer's perspective.
4. **`ai-tooling-security-threat-model.md`** — assets, trust boundaries, prompt-injection, MCP best-practice references.
5. **`gold-standard-roadmap.md`** — the staged plan to take the tooling from beta to gold standard. **Includes §2.1.5 "Scope discipline" and Appendix B "What we explicitly will not do" — read those first if you're tempted to add something.**
6. **`session-findings-2026-06.md`** — companion to the roadmap, grounded in a real consumer Copilot trace. Tells you which roadmap items have direct evidence behind them.
7. **`implementation-handoff.md`** — paste-ready prompts, Copilot settings, model/mode/agent picks per PR, recovery patterns. Start here when you're about to cut your first PR.
8. **`ai-tooling-operator-runbook.md`** — reviewer/operator map for evidence-backed workflow changes.
9. **`host-validation-checklist.md`** — short real-host validation checklist for the current build.
10. **`ai-tooling-context-gap-catalog.md`** — known coverage gaps in the generated context surface.

## Active docs by purpose

### Architecture and principles

- [`maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md) — architectural maintainer guide
- [`gold-standard-roadmap.md`](./gold-standard-roadmap.md) — staged plan from beta to gold standard, with scope discipline and explicit cuts
- [`implementation-handoff.md`](./implementation-handoff.md) — paste-ready prompts and Copilot model/mode/agent settings per PR

### Public contract

- [`public-api-matrix.md`](./public-api-matrix.md) — current `salt_workflow_v1` public contract matrix
- [`salt-workflow-v1-host-contract.md`](./salt-workflow-v1-host-contract.md) — compact workflow contract for host and skill consumers

### Security and operations

- [`ai-tooling-security-threat-model.md`](./ai-tooling-security-threat-model.md) — threat model for MCP, generated context, repo policy, host adapters, persistence
- [`ai-tooling-operator-runbook.md`](./ai-tooling-operator-runbook.md) — reviewer and operator map for evidence-backed Salt AI workflow changes
- [`host-validation-checklist.md`](./host-validation-checklist.md) — short real-host validation checklist for the current build

### Evidence and gaps

- [`session-findings-2026-06.md`](./session-findings-2026-06.md) — root-cause analysis of a real consumer Copilot trace; ties every finding to a concrete fix and the matching roadmap item
- [`ai-tooling-context-gap-catalog.md`](./ai-tooling-context-gap-catalog.md) — known coverage gaps in generated context

### Proof artifacts

- [`ai-tooling-host-benchmark-packet.md`](./ai-tooling-host-benchmark-packet.md) — host benchmark packet for external validation
- [`ai-tooling-host-benchmark-scenarios.json`](./ai-tooling-host-benchmark-scenarios.json) — machine-readable scenario list used by the benchmark packet
- [`host-results/salt-ai-tooling-host-result.schema.json`](./host-results/salt-ai-tooling-host-result.schema.json) — JSON schema for completed S1–S9 host benchmark result artifacts

## Where things live elsewhere

- **Consumer setup guidance:** [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)
- **CLI command reference:** [`../../cli/README.md`](../../cli/README.md)
- **Skill authoring source:** [`../../skills/README.md`](../../skills/README.md)
- **Canonical reasoning core:** [`../../semantic-core/README.md`](../../semantic-core/README.md)

Keep only current direction and live contract docs here. Use Git history for older pre-release planning records.
