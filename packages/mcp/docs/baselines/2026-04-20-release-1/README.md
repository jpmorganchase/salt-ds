# Release 1 Baseline Snapshot

This folder captures the pre-implementation public surface baseline for Release 1 contract work.

Captured on: April 20, 2026

Source branch at capture time: `mcp`

## Purpose

Use these artifacts to diff public-surface changes during Release 1:

- CLI compact and full workflow output
- CLI repo-context output
- MCP tool metadata and server instructions
- doc-file hashes for the current public setup and maintainer docs

These files are the baseline for:

- contract diffs
- doc drift review
- rollout evidence

## Generated Files

- [`cli-info-root.json`](./cli-info-root.json)
  - current `salt-ds info . --json` output from the repo root
- [`cli-create-metric-compact.json`](./cli-create-metric-compact.json)
  - current `salt-ds create "Metric" --json` output
- [`cli-create-metric-full.json`](./cli-create-metric-full.json)
  - current `salt-ds create "Metric" --json --full` output
- [`cli-create-metric-starter-only.json`](./cli-create-metric-starter-only.json)
  - current `salt-ds create "Metric" --json --starter-only` output as emitted by the built CLI
- [`mcp-tool-definitions.json`](./mcp-tool-definitions.json)
  - current exported default MCP tool surface from `TOOL_DEFINITIONS`
- [`mcp-runtime-metadata.json`](./mcp-runtime-metadata.json)
  - current MCP runtime and registry version metadata
- [`mcp-server-info.json`](./mcp-server-info.json)
  - current MCP server info payload
- [`mcp-server-instructions.txt`](./mcp-server-instructions.txt)
  - current MCP instruction string built from runtime metadata
- [`doc-file-hashes.json`](./doc-file-hashes.json)
  - SHA-256 hashes for the current public setup and maintainer docs under review

## Commands Used

```sh
node packages/cli/bin/salt-ds.js info . --json --output packages/mcp/docs/baselines/2026-04-20-release-1/cli-info-root.json
node packages/cli/bin/salt-ds.js create "Metric" --json --output packages/mcp/docs/baselines/2026-04-20-release-1/cli-create-metric-compact.json
node packages/cli/bin/salt-ds.js create "Metric" --json --full --output packages/mcp/docs/baselines/2026-04-20-release-1/cli-create-metric-full.json
node packages/cli/bin/salt-ds.js create "Metric" --json --starter-only --output packages/mcp/docs/baselines/2026-04-20-release-1/cli-create-metric-starter-only.json
```

MCP metadata artifacts were generated from the built `@salt-ds/mcp` package exports and bundled registry metadata.

## Baseline Observations

1. Compact create output for the exact named query `Metric` is the expected small branchable contract:
   - `workflow_status: "success"`
   - `safe_to_implement_exact_request: true`
   - `match_status: "exact"`
   - `next_step.kind: "implement"`

2. Full create output is materially larger than compact output:
   - compact example file size: `416` bytes
   - full example file size: `92463` bytes

3. The root `info` baseline reports a package-manager inspection fallback:
   - `spawn yarn ENOENT`
   - fallback to `node_modules` scan

4. The default MCP metadata baseline exposes six workflow-first tools:
   - `get_salt_project_context`
   - `bootstrap_salt_repo`
   - `create_salt_ui`
   - `review_salt_ui`
   - `migrate_to_salt`
   - `upgrade_salt_ui`

5. The built CLI currently emits the same compact create shape for `--starter-only` as for normal `--json` in this environment.
   This is a Release 1 contract correction item because source tests expect a narrower starter-only shape.

## Related Docs

- [`../../release-1-execution-checklist.md`](../../release-1-execution-checklist.md)
- [`../../public-api-matrix.md`](../../public-api-matrix.md)
- [`../../../../../salt-ai-tooling-next-releases-plan.md`](../../../../../salt-ai-tooling-next-releases-plan.md)
