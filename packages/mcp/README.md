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
  - returns a reusable `context_id` only when `resolution.status` is `resolved`
  - weak contexts instead expose `artifacts.summary.context_health` plus `artifacts.summary.retry_with` so hosts can retry with the right `root_dir` instead of guessing
  - returns `artifacts.summary.recommended_next_tool` and `artifacts.summary.bootstrap_requirement` so hosts can tell whether bootstrap would improve future repo-aware refinement
  - keeps policy diagnostics compact by default; request `include_policy_diagnostics: true` only when full layer resolution details are needed
- `bootstrap_salt_repo`
  - bootstrap `.salt` policy files and repo instructions when a repo wants durable policy and managed instructions beyond the first canonical Salt result
  - returns a fresh `context_id` plus an embedded project-context envelope so the next repo-aware workflow can start immediately
- `create_salt_ui`
  - create workflow
  - compact default returns top-level workflow state for safe branching
  - if compact output stays `partial` or `blocked`, do not treat starter code or early file creation as completion; follow top-level `action` and `safety.blocking_reasons` first
  - leave `solution_type` unset on broad or mixed-surface prompts unless the request already clearly points to a known Salt family
  - request `view: "full"` only when compact output is insufficient or the user explicitly asked for starter code, richer provenance, or implementation detail such as `details.result.ide_summary` or `details.workflow.implementation_gate`
- `review_salt_ui`
  - review workflow
- `migrate_to_salt`
  - migrate workflow
- `upgrade_salt_ui`
  - upgrade workflow

The default beta MCP surface exposes these six repo-aware workflow tools first, followed by read-only Salt support tools: `get_salt_entity`, `get_salt_examples`, and `discover_salt`.
The support tools exist so `salt_workflow_v1` actions such as `retrieve_entity` and `retrieve_examples` are directly followable by MCP hosts.

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

Capability metadata:

- MCP runtime metadata includes a shared `capability_manifest` object and `capability_manifest_uri`
- the same manifest is also available as the JSON resource `salt://capabilities/manifest`
- retrieval catalog support is available through:
  - `salt://catalog/manifest`
  - `salt://catalog/entity/{name}`
  - `salt://catalog/candidates/{query}`
  - `salt://catalog/family/{family}`
- use that manifest for machine-readable host setup checks instead of scraping prose for workflow vocabulary, contract version, or support-tool policy

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
Advanced retrieval inspection is available through `salt-ds info` and through read-only support command aliases that mirror MCP action names. Use `salt-ds get_salt_entity "<name>" --json` or `salt-ds get_salt_examples "<target>" --json` when a compact workflow returns `retrieve_entity` or `retrieve_examples`; use `salt-ds discover_salt "<prompt>" --json`, `salt-ds info --json --catalog-query "<prompt>"`, `salt-ds info --json --entity "<name>"`, or `salt-ds info --json --family "<category>"` for broader inspection without changing the main workflow story.

Consumer start path:

- start with the main AI page

See:

- [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx)
- [`./docs/ai-tooling-large-rewrite-plan.md`](./docs/ai-tooling-large-rewrite-plan.md)
- [`./docs/public-api-matrix.md`](./docs/public-api-matrix.md)
- [`./docs/maintaining-salt-ai-tooling.md`](./docs/maintaining-salt-ai-tooling.md)
- [`../skills/README.md`](../skills/README.md)

## Notes

- Salt MCP stays intentionally single-server. The simplification is in the public workflow contract, not in server splitting.
- Public workflow responses are compact and summary-first. Branch on top-level `salt_workflow_v1` fields such as `status`, `safety`, `action`, `summary`, and `request.match_status` / `request.resolved_entity` when present.
- If `status` is `partial` or `blocked`, do not stop after creating a starter file or scaffold. Continue the returned follow-through from `action`, or explicitly report that the workflow remains incomplete.
- Use `view: "full"` only when you need the additive `details` block for richer detail such as `details.result.ide_summary`, `details.workflow.implementation_gate`, starter code, or deeper provenance.
- Do not use `view: "full"` just to fix context or to guess past blocked compact output. Retry context or exact follow-through first.
- Inspect the machine-readable capability manifest at `salt://capabilities/manifest` when the host needs to confirm the workflow vocabulary, contract version, support-tool policy, or runtime version.
- In `view: "full"`, `create_salt_ui` keeps the same top-level `salt_workflow_v1` contract and adds `details`. Treat `details.workflow.implementation_gate` as a real implementation gate for broad or multi-surface asks.
- `get_salt_project_context` is the explicit repo-inspection path. Repo-aware workflow tools can also auto-collect context when it is omitted.
- Only treat `get_salt_project_context.result.context_id` as reusable when it is non-null. If `artifacts.summary.context_health.trusted` is `false`, stop and retry with `artifacts.summary.retry_with.root_dir` before relying on repo-specific guidance.
- `bootstrap_salt_repo` is the durable-policy step when a repo wants managed `.salt` files or repo instructions after the first canonical Salt result.
- `migrate_to_salt` owns canonical migration reasoning, but screenshot and mockup interpretation still stays outside MCP. Hosts should preprocess visual evidence into structured migrate inputs first.
- Repo-aware workflow results keep canonical Salt output separate from repo refinements. Use `details.artifacts.project_policy`, `details.artifacts.repo_refinement`, and `details.result.final_decision` to see that layering.
- Use `view: "full"` only when you need deeper provenance such as `details.raw.decision_debug`, `details.raw.routing_debug`, or the normalized `details.workflow.provenance.source_urls`.
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

For architectural maintenance guidance, see [`docs/maintaining-salt-ai-tooling.md`](./docs/maintaining-salt-ai-tooling.md).

- Registry artifact filenames and payload keys are centralized in [`src/registry/artifacts.ts`](./src/registry/artifacts.ts).
- Canonical registry build/load ownership lives in [`../semantic-core/src/build/buildRegistry.ts`](../semantic-core/src/build/buildRegistry.ts) and [`../semantic-core/src/registry/loadRegistry.ts`](../semantic-core/src/registry/loadRegistry.ts). MCP keeps a small internal runtime loader in [`src/registry/loadRegistry.ts`](./src/registry/loadRegistry.ts) for its bundled `generated/` snapshot and maintainer scripts.
- MCP tool metadata is defined in [`src/server/toolDefinitions.ts`](./src/server/toolDefinitions.ts). The server registration layer in [`src/server/registerTools.ts`](./src/server/registerTools.ts) and [`src/server/createServer.ts`](./src/server/createServer.ts) stays intentionally thin, with runtime-vs-registry version metadata centralized in [`src/server/serverMetadata.ts`](./src/server/serverMetadata.ts).
- Lookup, recommendation, search, translation, and code-analysis helpers now live in [`../semantic-core/src/tools`](../semantic-core/src/tools) as internal building blocks. The default public `@salt-ds/mcp` surface is the curated workflow-first set plus read-only Salt support tools, server entrypoints, and tool metadata above.
- The main test entry points are:
  - [`src/__tests__/tools.spec.ts`](./src/__tests__/tools.spec.ts)
  - [`src/__tests__/codeAnalysisTools.spec.ts`](./src/__tests__/codeAnalysisTools.spec.ts)
  - [`src/__tests__/registry.integration.spec.ts`](./src/__tests__/registry.integration.spec.ts)
