# Release 1 Post-v3 Snapshot

This folder captures the shipped repo-local public surface after the `salt_workflow_v3` migration.

Captured on: April 20, 2026

Source branch at capture time: `mcp`

## Purpose

Use these artifacts as the post-migration counterpart to the pre-change baseline in [`../2026-04-20-release-1/README.md`](../2026-04-20-release-1/README.md).

These files are the final Release 1 snapshot for:

- baseline-versus-final contract diffs
- shipped CLI and MCP artifact review
- release evidence and rollout checks

## Generated Files

- [`cli-info-root.json`](./cli-info-root.json)
  - current built `salt-ds info . --json` output from the repo root
- [`cli-create-metric-compact.json`](./cli-create-metric-compact.json)
  - current built `salt-ds create "Metric" --json` output
- [`cli-create-metric-full.json`](./cli-create-metric-full.json)
  - current built `salt-ds create "Metric" --json --full` output
- [`cli-create-metric-starter-only.json`](./cli-create-metric-starter-only.json)
  - current built `salt-ds create "Metric" --json --starter-only` output
- [`mcp-tool-definitions.json`](./mcp-tool-definitions.json)
  - current exported default MCP tool surface from the built `TOOL_DEFINITIONS`
- [`mcp-runtime-metadata.json`](./mcp-runtime-metadata.json)
  - current built MCP runtime metadata, including the capability manifest
- [`mcp-server-info.json`](./mcp-server-info.json)
  - current built MCP server info payload
- [`mcp-server-instructions.txt`](./mcp-server-instructions.txt)
  - current built MCP instruction string derived from runtime metadata
- [`doc-file-hashes.json`](./doc-file-hashes.json)
  - SHA-256 hashes for the current public setup and maintainer docs under review

## Commands Used

```sh
node dist/salt-ds-cli/bin/salt-ds.js info . --json --output packages/mcp/docs/baselines/2026-04-20-release-1-v3/cli-info-root.json
node dist/salt-ds-cli/bin/salt-ds.js create "Metric" --json --output packages/mcp/docs/baselines/2026-04-20-release-1-v3/cli-create-metric-compact.json
node dist/salt-ds-cli/bin/salt-ds.js create "Metric" --json --full --output packages/mcp/docs/baselines/2026-04-20-release-1-v3/cli-create-metric-full.json
node dist/salt-ds-cli/bin/salt-ds.js create "Metric" --json --starter-only --output packages/mcp/docs/baselines/2026-04-20-release-1-v3/cli-create-metric-starter-only.json
```

MCP metadata artifacts were generated from the built `@salt-ds/mcp` CommonJS exports and bundled registry metadata.

## Final Snapshot Observations

1. Compact create output is now the shared top-level `salt_workflow_v3` contract:

   - `contract: "salt_workflow_v3"`
   - `workflow: "create"`
   - `transport: "cli"`
   - `status: "partial"`
   - top-level `request`, `safety`, `action`, and `summary`

2. Full create output now keeps that same top-level contract and adds `details`:

   - compact example file size: `724` bytes
   - full example file size: `110267` bytes

3. The built CLI `starter-only` path is now narrow again:

   - create-only artifact shape
   - `starter_code` content plus supporting composition details
   - no accidental reuse of the compact contract payload

4. The CLI capability manifest now advertises compact workflow contract version `v3`.

5. The default MCP metadata still exposes the intended six-tool workflow-first public surface:

   - `get_salt_project_context`
   - `bootstrap_salt_repo`
   - `create_salt_ui`
   - `review_salt_ui`
   - `migrate_to_salt`
   - `upgrade_salt_ui`

6. The MCP capability manifest now advertises compact workflow contract version `v3` and the `salt://capabilities/manifest` resource.

## Related Docs

- [`../../release-1-release-evidence.md`](../../release-1-release-evidence.md)
- [`../../public-api-matrix.md`](../../public-api-matrix.md)
- [`../../public-contract-v3-implementation-plan.md`](../../public-contract-v3-implementation-plan.md)
- [`../../../../../salt-ai-tooling-next-releases-plan.md`](../../../../../salt-ai-tooling-next-releases-plan.md)
