# @salt-ds/mcp

`@salt-ds/mcp` is the canonical Salt Design System MCP server for consumer application repos.

It serves the Salt registry through a single MCP server with a compact, workflow-oriented public interface. Registry generation and loading semantics live in [`../semantic-core`](../semantic-core); `@salt-ds/mcp` packages the default generated snapshot and exposes the MCP transport over that shared canonical model. Use it when you want the nearest correct Salt answer for recommendation, translation, validation, and migration work.

## Role In The Consumer Stack

- `salt-ds`
  - the installable workflow skill that shapes the consumer workflow
- Salt MCP
  - canonical Salt guidance and the preferred transport when available
- Salt CLI
  - fallback transport when MCP is blocked
- project conventions
  - repo-specific wrappers, shells, and local patterns declared in `.salt` files and applied by repo-aware workflows

The MCP stays intentionally Salt-only. Repo-specific behavior belongs in declared project policy, not in the core Salt registry.

## Public Tool Surface

The visible MCP front door should stay small.

Primary repo-aware workflow tools:

- `get_salt_project_context`
  - inspect repo shape for diagnostics: framework, Salt package usage, repo instructions, declared policy, and likely runtime targets
  - returns a `context_id` that advanced hosts can pass back explicitly when they want to reuse context across multiple workflow calls
  - returns `artifacts.summary.recommended_next_tool` and `artifacts.summary.bootstrap_requirement` so hosts can tell whether bootstrap would improve future repo-aware refinement
  - keeps policy diagnostics compact by default; request `include_policy_diagnostics: true` only when full layer resolution details are needed
- `bootstrap_salt_repo`
  - bootstrap `.salt` policy files and repo instructions when a repo wants durable policy and managed instructions beyond the first canonical Salt result
  - returns a fresh `context_id` plus an embedded project-context envelope so the next repo-aware workflow can start immediately
- `create_salt_ui`
  - create workflow
  - return `result.ide_summary` first and respect `workflow.implementation_gate` before treating broad create output as implementation-ready
- `review_salt_ui`
  - review workflow
- `migrate_to_salt`
  - migrate workflow
- `upgrade_salt_ui`
  - upgrade workflow

The default beta MCP surface is intentionally limited to these six repo-aware workflow tools.
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

Generate registry artifacts for the MCP snapshot from repo sources with the maintainer script:

```sh
yarn workspace @salt-ds/semantic-core build
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

- MCP server entrypoints:
  - `createSaltMcpServer`
  - `runCli`
  - `TOOL_DEFINITIONS`
- `ToolDefinition`

Registry build/load entrypoints and canonical workflow operations belong to [`../semantic-core`](../semantic-core), which is the shared owner used by both MCP and CLI. Support helpers such as discovery and entity/example lookup also live there as internal implementation detail. They are no longer part of the supported `@salt-ds/mcp` root API.
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

See:

- [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx)
- [`docs/maintainers/ai-v1-implementation-backlog.md`](./docs/maintainers/ai-v1-implementation-backlog.md)
- [`docs/maintainers/consumer-ai-roadmap.md`](./docs/maintainers/consumer-ai-roadmap.md)
- [`docs/maintainers/maintaining-salt-ai-tooling.md`](./docs/maintainers/maintaining-salt-ai-tooling.md)
- [`../skills/README.md`](../skills/README.md)

## Notes

- Salt MCP stays intentionally single-server. The simplification is in the public workflow contract, not in server splitting.
- Public workflow responses are compact and summary-first. Show `result.ide_summary` first, then expand raw artifacts only when needed.
- `create_salt_ui` can return `workflow.implementation_gate` with `required_follow_through` and `blocking_questions`. Treat that as a real implementation gate for broad or multi-surface asks.
- `get_salt_project_context` is the explicit repo-inspection path. Repo-aware workflow tools can also auto-collect context when it is omitted.
- `bootstrap_salt_repo` is the durable-policy step when a repo wants managed `.salt` files or repo instructions after the first canonical Salt result.
- `migrate_to_salt` owns canonical migration reasoning, but screenshot and mockup interpretation still stays outside MCP. Hosts should preprocess visual evidence into structured migrate inputs first.
- Repo-aware workflow results keep canonical Salt output separate from repo refinements. Use `artifacts.project_policy`, `artifacts.repo_refinement`, and `result.final_decision` to see that layering.
- Use `view: "full"` only when you need deeper provenance such as `raw.decision_debug`, `raw.routing_debug`, or the normalized `workflow.provenance.source_urls`.
- The published package serves the bundled registry by default. `--registry-dir` is only for local development or testing against a custom registry build.
- The published MCP contract stays root-only even though the internal source tree is more granular. Deep imports remain unsupported.

## Canonical Boundary

- Core Salt MCP answers: "What is the nearest correct Salt answer?"
- Detected context answers: "What does this repo look like right now?"
- Project conventions answer: "How should this repo apply Salt?"

Keep project-specific wrappers, approved local patterns, and repo conventions out of the core Salt registry. If a repo-aware workflow sets `project_conventions.check_recommended` to `true`, confirm that `.salt/team.json` or `.salt/stack.json` declares the needed local policy and use the workflow artifacts to carry the resulting repo refinement and provenance.

Use `guidance_boundary.project_conventions.topics` to narrow what kind of repo guidance is relevant, such as `wrappers`, `page-patterns`, `navigation-shell`, `local-layout`, or `migration-shims`.

The project conventions contract is described on [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx), with canonical schemas in [`../semantic-core/schemas`](../semantic-core/schemas).
The layered policy engine now lives in [`../semantic-core/src/policy`](../semantic-core/src/policy), and a concrete consumer repo workflow example lives in [`../../workflow-examples/consumer-repo`](../../workflow-examples/consumer-repo).
Repo-aware workflow artifacts can also carry structured project policy summaries for wrappers, theme defaults, token aliases, and token-family policy when those overlays are declared.

## Debugging Recommendation Provenance

Use `view: "full"` when you need to understand why the MCP chose a particular path.

- `create_salt_ui`
  - `raw.decision_debug.selected_name`
  - `raw.decision_debug.selected_guidance_sources`
  - `raw.decision_debug.selected_categories`
  - `raw.decision_debug.preferred_categories`
    These fields are intended for inspection and debugging. They help explain whether a result was driven mainly by category maps, usage-doc extraction, examples, or fallback routing logic.

## Maintainer Notes

For architectural maintenance guidance, see [`docs/maintainers/maintaining-salt-ai-tooling.md`](./docs/maintainers/maintaining-salt-ai-tooling.md).

- Registry artifact filenames and payload keys are centralized in [`src/registry/artifacts.ts`](./src/registry/artifacts.ts).
- Canonical registry build/load ownership lives in [`../semantic-core/src/build/buildRegistry.ts`](../semantic-core/src/build/buildRegistry.ts) and [`../semantic-core/src/registry/loadRegistry.ts`](../semantic-core/src/registry/loadRegistry.ts). MCP keeps a small internal runtime loader in [`src/registry/loadRegistry.ts`](./src/registry/loadRegistry.ts) for its bundled `generated/` snapshot and maintainer scripts.
- MCP tool metadata is defined in [`src/server/toolDefinitions.ts`](./src/server/toolDefinitions.ts). The server registration layer in [`src/server/registerTools.ts`](./src/server/registerTools.ts) and [`src/server/createServer.ts`](./src/server/createServer.ts) stays intentionally thin, with runtime-vs-registry version metadata centralized in [`src/server/serverMetadata.ts`](./src/server/serverMetadata.ts).
- Lookup, recommendation, search, translation, and code-analysis helpers now live in [`../semantic-core/src/tools`](../semantic-core/src/tools) as internal building blocks. The default public `@salt-ds/mcp` surface is the curated six-tool workflow set plus the server entrypoints and tool metadata above.
- The main test entry points are:
  - [`src/__tests__/tools.spec.ts`](./src/__tests__/tools.spec.ts)
  - [`src/__tests__/codeAnalysisTools.spec.ts`](./src/__tests__/codeAnalysisTools.spec.ts)
  - [`src/__tests__/registry.integration.spec.ts`](./src/__tests__/registry.integration.spec.ts)
