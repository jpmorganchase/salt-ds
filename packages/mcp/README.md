# @salt-ds/mcp

`@salt-ds/mcp` is a publishable MCP server package for Salt Design System runtime use cases.

It builds a machine-readable registry from Salt source material and is presented as a single MCP server with a consumer-first default experience.

## Default Consumer Workflows

These are the primary tools to surface in docs, prompts, and demos:

- `discover_salt`
  - Route a broad Salt question to the best starting point, with clarifying questions when the intent is still ambiguous.
- `recommend_component`
  - Choose the right Salt primitive from a user need, with opt-in starter code and shipping/a11y filters.
- `get_composition_recipe`
  - Assemble a common Salt flow or pattern correctly, with opt-in starter code and shipping/a11y filters.
- `get_component`
  - Look up a specific component once the name is known.
- `get_examples`
  - Find implementation examples with a best example, nearby variants, and scenario hints.
- `get_foundation`
  - Look up typography, spacing, density, size, and responsiveness guidance, with opt-in starter scaffolds.
- `recommend_tokens`
  - Find the right design tokens from styling intent.
- `recommend_fix_recipes`
  - Turn code issues into actionable Salt remediation steps.
- `compare_versions`
  - Understand upgrade impact between versions.
- `search_salt_docs`
  - General escape hatch when the caller is not sure where to start.

## Additional Tools

These stay available in the same server but are not the primary consumer starting points:

- `list_salt_catalog`
- `get_package`
- `get_guide`
- `list_foundations`
- `get_page`
- `get_changes`
- `get_icon`
- `get_icons`
- `get_country_symbol`
- `get_country_symbols`
- `get_pattern`
- `get_token`
- `search_api_surface`
- `search_component_capabilities`
- `get_related_entities`
- `compare_options`
- `suggest_migration`
- `validate_salt_usage`

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

Generate registry artifacts from repo sources with the repo-only maintainer script:

```sh
yarn workspace @salt-ds/mcp build:package
node packages/salt-mcp/scripts/buildRegistry.mjs \
  --source-root D:/Work/salt-ds-2 \
  --output-dir D:/Work/salt-ds-2/packages/salt-mcp/generated
```

Run the MCP server over stdio from a built checkout:

```sh
node dist/salt-ds-mcp/bin/salt-mcp.js
```

## Notes

- Salt MCP is intentionally a single-server setup. The simplification is in the recommended workflow and documentation, not in separate profiles or install modes.
- The main consumer tools are compact by default and optimized for decision-making. Use `view: "full"` on tools like `discover_salt`, `get_component`, `get_examples`, `get_foundation`, `recommend_component`, `get_composition_recipe`, `compare_versions`, `recommend_tokens`, and `recommend_fix_recipes` when you want the richer evidence.
- `discover_salt` can return structured `clarifying_questions` when a broad query still needs consumer decisions such as single vs multi-select or design guidance vs implementation help.
- `recommend_component`, `get_composition_recipe`, and `get_foundation` can return opt-in `starter_code` scaffolds that stay lightweight enough for MCP and avoid turning the server into a workflow skill. Where registry examples exist, the starter payload also includes an example-derived snippet.
- Consumer recommendation tools support filters like `production_ready`, `prefer_stable`, `a11y_required`, and `form_field_support` to bias toward ship-ready guidance.
- Consumer-facing tools now bias toward a decision-first shape with `best_example`, `caveats`, `ship_check`, and `suggested_follow_ups` fields before exposing raw scoring details.
- Tool responses are compact by default to reduce token usage.
- Tool responses include a top-level `sources` array that normalizes site routes to absolute URLs while preserving local repo paths for debugging.
- `get_changes` exposes changelog-derived package and component history for AI-friendly "what changed?" lookups.
- `list_salt_catalog` provides a browse-first catalog view when the consumer does not know the exact Salt name yet, including country symbols alongside icons and docs-backed entities.
- `get_guide` exposes structured setup and theming guidance sourced from the Salt docs.
- `list_foundations` and `get_foundation` expose foundations as a first-class consumer entry point instead of requiring generic page lookup.
- Icon search metadata is sourced from the same synonym dataset used by the site icon preview.
- Country symbol search metadata is sourced from `@salt-ds/countries` generated country metadata and includes both circle and sharp exports.
- The published package serves the bundled registry by default. `--registry-dir` is only needed for local development or testing against a custom registry build.
- Registry generation is a repo-only build step. The published CLI only supports serving the bundled registry.
- Use the package bin entrypoint (`bin/salt-mcp.js` or installed `salt-mcp`) when launching the CLI. `dist-cjs/cli.js` exports `runCli` but is not a direct executable.
- Use `view: "full"` or `include` fields on relevant tools to request expanded payloads.
- The default consumer workflow is centered on ten tools: `discover_salt`, `recommend_component`, `get_composition_recipe`, `get_component`, `get_examples`, `get_foundation`, `recommend_tokens`, `recommend_fix_recipes`, `compare_versions`, and `search_salt_docs`.
- `search_api_surface` is intended for more technical questions such as “which components support validationStatus?” or “what props are deprecated?”
- `recommend_tokens` and `get_related_entities` support discovery flows that start from styling intent or a nearby Salt entity instead of an exact API name.
- `compare_options` supports structured side-by-side comparison for close Salt choices such as `Button` vs `Link` or one pattern versus another.
- `recommend_fix_recipes` exposes consumer-facing remediation on top of the raw registry and code-analysis tools.
- `validate_salt_usage` uses AST-based React analysis and supports version-aware deprecation checks via `package_version`.

## Maintainer Notes

- Registry artifact filenames and payload keys are centralized in [`src/registry/artifacts.ts`](./src/registry/artifacts.ts). Update that file first when adding or renaming a generated artifact.
- Runtime loading lives in [`src/registry/loadRegistry.ts`](./src/registry/loadRegistry.ts). Registry build output is assembled in [`src/build/buildRegistry.ts`](./src/build/buildRegistry.ts).
- MCP tool metadata is defined in [`src/tools/toolDefinitions.ts`](./src/tools/toolDefinitions.ts). The server registration layer in [`src/server/createServer.ts`](./src/server/createServer.ts) is intentionally thin.
- Reusable lookup/ambiguity behavior for `get_*` tools lives in [`src/tools/lookupResolver.ts`](./src/tools/lookupResolver.ts).
- The main test entry points are:
  - [`src/__tests__/tools.spec.ts`](./src/__tests__/tools.spec.ts) for catalog/query tools
  - [`src/__tests__/codeAnalysisTools.spec.ts`](./src/__tests__/codeAnalysisTools.spec.ts) for AST-based code analysis tools
  - [`src/__tests__/registry.integration.spec.ts`](./src/__tests__/registry.integration.spec.ts) for generated-registry integration
