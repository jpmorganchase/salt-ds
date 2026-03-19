# @salt-ds/mcp

`@salt-ds/mcp` is a publishable MCP server package for Salt Design System runtime use cases.

It builds a machine-readable registry from Salt source material and serves it through a single MCP server with a compact, workflow-oriented public interface.

## Public Tool Surface

The server now exposes six workflow tools:

- `discover_salt`
  - Use this for broad, ambiguous, or exploratory Salt requests.
  - It searches, clarifies intent, and routes to the next best Salt workflow.
  - Do not use it when the caller already wants a direct recommendation or a known-entity lookup.
- `choose_salt_solution`
  - Use this for recommendation or side-by-side comparison.
  - If `names` is present, comparison mode wins. Otherwise `query` drives recommendation mode.
- `get_salt_entity`
  - Use this for known or near-known Salt entity lookup.
  - It resolves specific or almost-specific components, patterns, foundations, tokens, guides, pages, packages, icons, and country symbols.
  - Do not use it for broad discovery or recommendation/comparison.
- `get_salt_examples`
  - Find the best implementation example and nearby variants for a component or pattern.
  - Can return lightweight starter snippets when Salt already has a corresponding starter path.
- `analyze_salt_code`
  - Analyze existing React and Salt code with AST-based validation, version-aware deprecation checks, fix guidance, and migration suggestions.
- `compare_salt_versions`
  - Explain upgrade impact between versions, highlight breaking changes, and suggest the next actions.

## Usage

Minimal MCP config:

```json
{
  "mcpServers": {
    "Salt": {
      "command": "npx",
      "args": ["@salt-ds/mcp@latest"]
    }
  }
}
```

Build the package from the repo:

```sh
yarn workspace @salt-ds/mcp build
```

Generate registry artifacts from repo sources with the maintainer script:

```sh
yarn workspace @salt-ds/mcp build:package
node packages/mcp/scripts/buildRegistry.mjs \
  --source-root D:/Work/salt-ds-2 \
  --output-dir D:/Work/salt-ds-2/packages/mcp/generated
```

Run the MCP server over stdio from a built checkout:

```sh
node dist/salt-ds-mcp/bin/salt-mcp.js
```

## Notes

- Salt MCP stays intentionally single-server. The simplification is in the public tool contract, not in server splitting.
- Public tool responses are compact by default and decision-first. Use `view: "full"` when you need richer evidence.
- `discover_salt` absorbs broad docs search, browse-first catalog exploration, and related-entity exploration.
- `choose_salt_solution` absorbs component recommendation, pattern/composition recommendation, capability-driven selection, and option comparison.
- `get_salt_entity` absorbs entity lookup plus icon and country-symbol lookup/list flows.
- Tool boundary shorthand:
  - `discover_salt`: broad, ambiguous, exploratory routing.
  - `choose_salt_solution`: recommendation or comparison.
  - `get_salt_entity`: known or near-known lookup.
- `analyze_salt_code` absorbs validation, fix recipes, and migration guidance while preserving AST-based analysis and version-aware checks.
- `compare_salt_versions` supports both explicit version-to-version comparison and open-ended history mode when `to_version` is omitted.
- Starter scaffolds stay intentionally lightweight to keep the MCP focused on guidance instead of turning into a workflow engine.
- Tool responses include a top-level `sources` array that normalizes site routes to absolute URLs while preserving local repo paths for debugging.
- The published package serves the bundled registry by default. `--registry-dir` is only needed for local development or testing against a custom registry build.
- Registry generation is a repo-only build step. The published CLI only supports serving the bundled registry.
- The MCP handshake advertises the `@salt-ds/mcp` runtime version. Treat that separately from the Salt registry version and `generated_at` timestamp used for content metadata.

## Maintainer Notes

- Registry artifact filenames and payload keys are centralized in [`src/registry/artifacts.ts`](./src/registry/artifacts.ts).
- Runtime loading lives in [`src/registry/loadRegistry.ts`](./src/registry/loadRegistry.ts). Registry build output is assembled in [`src/build/buildRegistry.ts`](./src/build/buildRegistry.ts).
- MCP tool metadata is defined in [`src/tools/toolDefinitions.ts`](./src/tools/toolDefinitions.ts). The server registration layer in [`src/server/createServer.ts`](./src/server/createServer.ts) stays intentionally thin, with runtime-vs-registry version metadata centralized in [`src/server/serverMetadata.ts`](./src/server/serverMetadata.ts).
- Lookup, recommendation, search, and code-analysis helpers still live in `src/tools/` as internal building blocks. The public surface is the curated six-tool set above.
- The main test entry points are:
  - [`src/__tests__/tools.spec.ts`](./src/__tests__/tools.spec.ts)
  - [`src/__tests__/codeAnalysisTools.spec.ts`](./src/__tests__/codeAnalysisTools.spec.ts)
  - [`src/__tests__/registry.integration.spec.ts`](./src/__tests__/registry.integration.spec.ts)
