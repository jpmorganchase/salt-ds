# MCP Docs

Use this folder as the minimal maintainer set for the current Salt AI direction.

## Active Docs

- [`maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)
  - architectural maintainer guide
- [`ai-tooling-winning-foundation.md`](./ai-tooling-winning-foundation.md)
  - target product shape: registry-first for context, workflow-first for safety
- [`ai-tooling-change-review-rubric.md`](./ai-tooling-change-review-rubric.md)
  - change gate for future tooling work
- [`ai-tooling-large-rewrite-plan.md`](./ai-tooling-large-rewrite-plan.md)
  - active rewrite path for the current architecture
- [`host-validation-checklist.md`](./host-validation-checklist.md)
  - short real-host validation checklist for the current build
- [`public-api-matrix.md`](./public-api-matrix.md)
  - current `salt_workflow_v3` public contract matrix

## Historical Docs

- [`archive/public-contract-v3-implementation-plan.md`](./archive/public-contract-v3-implementation-plan.md)
  - retained `v3` migration record
- [`archive/release-1-release-evidence.md`](./archive/release-1-release-evidence.md)
  - retained release evidence and external validation note
- [`archive/README.md`](./archive/README.md)
  - minimal archive index

## Snapshots

- [`baselines/2026-04-20-release-1/README.md`](./baselines/2026-04-20-release-1/README.md)
  - pre-implementation Release 1 public-surface snapshot
- [`baselines/2026-04-20-release-1-v3/README.md`](./baselines/2026-04-20-release-1-v3/README.md)
  - post-migration shipped-artifact snapshot for `salt_workflow_v3`

Consumer-facing guidance lives in [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx).
Keep only the current direction and live contract docs here. Use Git history for anything older unless it is one of the two retained archive records above.
