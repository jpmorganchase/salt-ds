# Phase 0 MCP TypeScript SDK v2 migration inventory

Recorded: 2026-07-29

This is the required dry-run inventory. No codemod edit was applied to the
production tree in Phase 0.

## Coordinated stable versions

The npm `latest` tag resolved to `2.0.0` for the coordinated MCP TypeScript
packages used by this redesign:

- `@modelcontextprotocol/core`
- `@modelcontextprotocol/server`
- `@modelcontextprotocol/client`
- `@modelcontextprotocol/node`
- `@modelcontextprotocol/codemod`

The repository currently declares the legacy
`@modelcontextprotocol/sdk@^1.29.0`. The lockfile pins `1.29.0`; the baseline
package capture installed the range-current `1.30.0`. The migration will remove
the legacy package rather than update it.

SDK v2 requires Node 20 or newer; this repository already requires Node 22 or
newer. The coordinated server/client packages require Zod `^4.2.0`, so the MCP
package's declared Zod floor must rise from `^4.1.11` even though the current
lockfile already resolves `4.4.3`.

## Reproducible dry run

Working directory:

```text
packages/mcp
```

Command:

```text
npx --yes @modelcontextprotocol/codemod@2.0.0 v1-to-v2 . --dry-run --verbose
```

Result:

```text
exit: 0
changes proposed: 9 across 8 files
warnings: 2
manifest: remove @modelcontextprotocol/sdk
manifest: add @modelcontextprotocol/client and @modelcontextprotocol/server
```

The migration-scope digest before and after the dry run was identical:

```text
1DAD2201330DAA2656AAE2FF3F38F897063A1449D78425E054BE4310B4E92C26
```

Git status was identical and the codemod wrote no error marker.

The published codemod artifact integrity observed for `2.0.0` was:

```text
sha512-VZMKhuAGMhST/T8XLcVmK92b5MrKeadBiuE0xsSoE8pV6Js1xzJacTI9g412FqXHSsVKPd7eVzz9dIgVr6c8JA==
```

## Proposed files

1. Phase 0 baseline harness (deleted rather than migrated in Phase 2)
2. `packages/mcp/src/cli.ts`
3. `packages/mcp/src/index.ts`
4. `packages/mcp/src/__tests__/cli.spec.ts`
5. `packages/mcp/src/__tests__/createServer.spec.ts` (two imports)
6. `packages/mcp/src/server/createServer.ts`
7. `packages/mcp/src/server/registerResources.ts`
8. `packages/mcp/src/server/registerTools.ts`

A supplemental dry run over `scripts/consumer-smoke` also exited zero and
proposed two import changes:

- `scripts/consumer-smoke/checks.mjs`
- `scripts/consumer-smoke/transport.mjs`

The baseline harness was deliberately deleted after the immutable captures were
locked. Migrating it would have retained executable SDK-v1 and private-workflow
semantics, contrary to the Phase 2 deletion boundary.

## Manual migration work

- Use `@modelcontextprotocol/server` for runtime server code and
  `@modelcontextprotocol/client` for tests and smoke clients.
- Keep both halves of each `InMemoryTransport` pair from the same package.
- Place the client package in development dependencies, not runtime
  dependencies.
- Give root consumer-smoke tooling direct dependency ownership rather than
  relying on workspace hoisting.
- Raise the declared Zod floor to at least 4.2 and regenerate the lockfile.
- Replace the architecture-boundary legacy-package literal with the
  `@modelcontextprotocol/` scope.
- Remove the permissive raw-record branch from `ToolSchema`; require Standard
  Schema objects.
- Replace tests that inspect SDK private registration fields with real protocol
  calls.
- Re-run packed declaration, ESM, CommonJS, stdio, and in-memory semantic
  checks.

The two codemod warnings concern indirect `inputSchema` and `outputSchema`
values in `registerTools.ts`. Current definitions pass complete Zod objects, but
the loose `ToolSchema` type permits raw shapes and must be narrowed in Phase 2.5.

## Protocol-era distinction

Installing SDK v2 does not by itself adopt MCP protocol revision `2026-07-28`.
The current direct `McpServer`/stdio connection remains on the earlier protocol
era. Phase 2.5 must explicitly select and test the supported protocol era.
Modern/both-era stdio support requires the SDK v2 serving helper, and tests must
cover its negotiation and error behavior rather than inferring support from the
package version.
