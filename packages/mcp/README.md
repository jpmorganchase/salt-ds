# @salt-ds/mcp

`@salt-ds/mcp` is the canonical Salt Design System MCP server for consumer application repos.

It builds a machine-readable registry from Salt source material and serves it through a single MCP server with a compact, workflow-oriented public interface. Use it when you want the nearest correct Salt answer for lookup, recommendation, translation, validation, and migration work.

## Role In The Consumer Stack

- `salt-ds`
  - the installable workflow skill that shapes the consumer workflow
- Salt MCP
  - canonical Salt guidance and the preferred transport when available
- Salt CLI
  - fallback transport when MCP is blocked
- project conventions
  - repo-specific wrappers, shells, and local patterns layered on afterward

The MCP stays intentionally Salt-only. Repo-specific behavior belongs in separate project conventions, not in the core Salt registry.

## Public Tool Surface

The visible MCP front door should stay small.

Primary repo-aware workflow tools:

- `get_salt_project_context`
  - detect the repo shape first: framework, Salt package usage, repo instructions, layered policy, and likely runtime targets
- `choose_salt_solution`
  - create workflow
- `analyze_salt_code`
  - review workflow
- `translate_ui_to_salt`
  - migrate workflow
- `compare_salt_versions`
  - upgrade workflow

The default beta MCP surface is intentionally limited to these five repo-aware workflow tools.
Grounding and exploratory support helpers remain available in the implementation layer, but they are not part of the default client-visible beta surface.

## Workflow Boundary

The public user workflows should stay the same across MCP and CLI:

- `create`
- `review`
- `migrate`
- `upgrade`
- `review --url` when runtime evidence is needed in the same pass

Treat the MCP tool names above as implementation details behind those workflows unless you are integrating or debugging the MCP directly.

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
  --source-root /path/to/salt-ds \
  --output-dir /path/to/salt-ds/packages/mcp/generated
```

Run the MCP server over stdio from a built checkout:

```sh
node dist/salt-ds-mcp/bin/salt-mcp.js
```

## Supported Programmatic Surface

The root `@salt-ds/mcp` export is intentionally curated.

Supported root exports:

- bundled registry entrypoints:
  - `buildRegistry`
  - `loadRegistry`
- MCP server entrypoints:
  - `createSaltMcpServer`
  - `runCli`
  - `TOOL_DEFINITIONS`
- MCP workflow helpers:
  - `getSaltProjectContext`
- the seven canonical semantic operations:
  - `discoverSalt`
  - `translateUiToSalt`
  - `chooseSaltSolution`
  - `getSaltEntity`
  - `getSaltExamples`
  - `analyzeSaltCode`
  - `compareSaltVersions`
- core Salt registry and tool input/result types

Helper-level semantic utilities now live under [`../semantic-core`](../semantic-core) as internal implementation detail. They are no longer part of the supported `@salt-ds/mcp` root API.
Published package exports now enforce that root-only contract. Deep imports such as `@salt-ds/mcp/server/...` or older helper paths are internal and unsupported.

## Consumer Setup

For consumer repos, keep the public model small:

1. install the `salt-ds` skill as the workflow layer
2. connect Salt MCP when available
3. keep repo-local rules in `.salt/team.json`
4. use `salt-ds + CLI` only when MCP is blocked or direct support/debug work is needed

Published CLI fallback:

```sh
npx -y @salt-ds/cli@latest info . --json
```

Or install it once:

```sh
npm install -g @salt-ds/cli
```

When the CLI is used directly, keep it workflow-first through `salt-ds init`, `salt-ds info`, `salt-ds create`, `salt-ds review`, `salt-ds migrate`, and `salt-ds upgrade`. Use `salt-ds review --url <url>` when source validation and runtime evidence should stay in the same workflow pass. Keep `salt-ds doctor` and `salt-ds runtime inspect` in the runtime-evidence layer.

Consumer start path:

- start with the main AI page
- use the beta guide as the short handoff
- use the setup and project-conventions docs as supporting references

See:

- [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx)
- [`docs/consumer/beta-guide.md`](./docs/consumer/beta-guide.md)
- [`docs/consumer/consumer-repo-setup.md`](./docs/consumer/consumer-repo-setup.md)
- [`docs/consumer/getting-good-results.md`](./docs/consumer/getting-good-results.md)
- [`docs/consumer/troubleshooting.md`](./docs/consumer/troubleshooting.md)
- [`docs/maintainers/ai-v1-implementation-backlog.md`](./docs/maintainers/ai-v1-implementation-backlog.md)
- [`docs/maintainers/consumer-ai-roadmap.md`](./docs/maintainers/consumer-ai-roadmap.md)
- [`docs/maintainers/maintaining-salt-ai-tooling.md`](./docs/maintainers/maintaining-salt-ai-tooling.md)
- [`../skills/README.md`](../skills/README.md)
- [`docs/consumer/consuming-project-conventions.md`](./docs/consumer/consuming-project-conventions.md)

## Notes

- Salt MCP stays intentionally single-server. The simplification is in the public tool contract, not in server splitting.
- Public tool responses are compact by default and decision-first. Use `view: "full"` when you need richer evidence.
- In `view: "full"`, recommendation and discovery tools include lightweight provenance blocks such as `raw.decision_debug` and `raw.routing_debug` so you can see which guidance sources and categories influenced the chosen path.
- The core MCP stays canonical-Salt-only by design. Context, recommendation, translation, code analysis, and version outputs keep repo-specific conventions separate from the canonical Salt layer.
- `get_salt_project_context` is the default first step for repo-aware work: framework, workspace shape, Salt package usage, repo instructions, layered policy, and likely runtime targets.
- `translate_ui_to_salt` absorbs non-Salt UI adoption planning, foreign-library translation, and rough interface-to-Salt mapping.
- `choose_salt_solution` absorbs component recommendation, pattern/composition recommendation, capability-driven selection, and option comparison.
- Tool boundary shorthand:
  - `get_salt_project_context`: repo-aware context detection before the main workflow tool is chosen.
  - `translate_ui_to_salt`: external UI translation into Salt.
  - `choose_salt_solution`: recommendation or comparison.
- `analyze_salt_code` absorbs validation, fix recipes, and migration guidance while preserving AST-based analysis and version-aware checks.
- `compare_salt_versions` supports both explicit version-to-version comparison and open-ended history mode when `to_version` is omitted.
- Starter scaffolds stay intentionally lightweight to keep the MCP focused on guidance instead of turning into a workflow engine.
- Tool responses include a top-level `sources` array that normalizes site routes to absolute URLs while preserving local repo paths for debugging.
- The published package serves the bundled registry by default. `--registry-dir` is only needed for local development or testing against a custom registry build.
- Registry generation is a repo-only build step. The published CLI only supports serving the bundled registry.
- The MCP handshake advertises the `@salt-ds/mcp` runtime version. Treat that separately from the Salt registry version and `generated_at` timestamp used for content metadata.
- `packages/mcp/package.json` intentionally keeps cross-package TypeScript settings so declaration generation can bundle the semantic-core source that `@salt-ds/mcp` publishes today. Do not remove `typescriptInclude` or `typescriptRootDir` unless the publish/build strategy changes.
- `packages/mcp/package.json` also intentionally uses a publish-time `exports` map so the public contract stays root-only even though the internal source tree is more granular.

## Canonical Boundary

- Core Salt MCP answers: "What is the nearest correct Salt answer?"
- Detected context answers: "What does this repo look like right now?"
- Project conventions answer: "How should this repo apply Salt?"

Keep project-specific wrappers, approved local patterns, and repo conventions out of the core Salt registry. If a tool response sets `project_conventions.check_recommended` to `true`, confirm local conventions through separate project conventions before treating the canonical Salt starter guidance as the final project answer.

Use `guidance_boundary.project_conventions.topics` to narrow what kind of repo guidance is relevant, such as `wrappers`, `page-patterns`, `navigation-shell`, `local-layout`, or `migration-shims`.

The recommended project conventions contract is documented in [`docs/consumer/project-conventions-contract.md`](./docs/consumer/project-conventions-contract.md), with a companion schema at [`schemas/project-conventions.schema.json`](./schemas/project-conventions.schema.json).
The consumer flow is documented in [`docs/consumer/consuming-project-conventions.md`](./docs/consumer/consuming-project-conventions.md). The optional deterministic merge helper lives in [`../project-conventions-runtime`](../project-conventions-runtime), and a concrete consumer repo workflow example lives in [`../../workflow-examples/consumer-repo`](../../workflow-examples/consumer-repo).

## Debugging Recommendation Provenance

Use `view: "full"` when you need to understand why the MCP chose a particular path.

- `choose_salt_solution`
  - `raw.decision_debug.selected_name`
  - `raw.decision_debug.selected_guidance_sources`
  - `raw.decision_debug.selected_categories`
  - `raw.decision_debug.preferred_categories`
    These fields are intended for inspection and debugging. They help explain whether a result was driven mainly by category maps, usage-doc extraction, examples, or fallback routing logic.

## Maintainer Notes

For architectural maintenance guidance, see [`docs/maintainers/maintaining-salt-ai-tooling.md`](./docs/maintainers/maintaining-salt-ai-tooling.md).

- Registry artifact filenames and payload keys are centralized in [`src/registry/artifacts.ts`](./src/registry/artifacts.ts).
- Runtime loading lives in [`src/registry/loadRegistry.ts`](./src/registry/loadRegistry.ts). Registry build output is assembled in [`src/build/buildRegistry.ts`](./src/build/buildRegistry.ts).
- MCP tool metadata is defined in [`src/server/toolDefinitions.ts`](./src/server/toolDefinitions.ts). The server registration layer in [`src/server/registerTools.ts`](./src/server/registerTools.ts) and [`src/server/createServer.ts`](./src/server/createServer.ts) stays intentionally thin, with runtime-vs-registry version metadata centralized in [`src/server/serverMetadata.ts`](./src/server/serverMetadata.ts).
- Lookup, recommendation, search, translation, and code-analysis helpers now live in [`../semantic-core/src/tools`](../semantic-core/src/tools) as internal building blocks. The default public `@salt-ds/mcp` surface is the curated five-tool workflow set plus registry and server entrypoints above.
- The main test entry points are:
  - [`src/__tests__/tools.spec.ts`](./src/__tests__/tools.spec.ts)
  - [`src/__tests__/codeAnalysisTools.spec.ts`](./src/__tests__/codeAnalysisTools.spec.ts)
  - [`src/__tests__/registry.integration.spec.ts`](./src/__tests__/registry.integration.spec.ts)
