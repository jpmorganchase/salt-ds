# @salt-ds/mcp

Read-only Salt Design System MCP server.

This is the single public install path for the first Salt DS AI tooling release.

```json
{
  "mcpServers": {
    "Salt": {
      "command": "npx",
      "args": ["-y", "@salt-ds/mcp@latest"]
    }
  }
}
```

## Public v1 Contract

Tools:

- `get_salt_project_context`
- `get_salt_reference`
- `review_salt_ui`
- `create_salt_ui`
- `migrate_to_salt`

Resources:

- `salt://capabilities/manifest`
- `salt://catalog/manifest`
- `salt://catalog/entity/{name}`

The server is read-only. It does not write repo setup, persist generated artifacts, install packages, inspect browser runtimes, resume durable review reports, or expose a second public workflow transport.

## Workflow Model

Call the workflow that matches the job and pass `root_dir` for the active project or package (the target workspace package in a monorepo):

- `review_salt_ui` for existing Salt UI and Salt-specific findings
- `create_salt_ui` for bounded new Salt UI
- `migrate_to_salt` for non-Salt UI or structured source outlines moving to Salt

Use `get_salt_reference` when a workflow asks for entity or example evidence. Use catalog resources for lightweight manifest and entity inspection.

Workflow tools resolve repo context from `root_dir` or, when it is omitted, the MCP process working directory. Use `get_salt_project_context` only when you need explicit diagnostics or must resolve a disputed root; its result is not reusable workflow state.

Workflow tools return compact `salt_workflow_v1` output. Read `status`, `action.kind`, `action.post_action`, `guidance`, `evidence.status`, and `summary` before implementation detail. Guidance is workflow-specific and bounded: create returns a decision plus starter guidance; review returns findings and fixes; migrate returns translations, a migration plan, starter guidance, and post-migration verification.

Create reference-retrieval actions may include a one-level `action.post_action` that deterministically reruns `create_salt_ui` after the reference is grounded. Dependency installation stays outside the semantic workflow contract. `ask_user` stops with `action.post_action: null`; ask the question and wait for updated user input instead of inferring a rerun.

## Package Boundary

Published package contents are intentionally limited to:

- the `salt-mcp` bin
- one compiled runtime bundle per module format (ESM and CommonJS)
- minimized offline Salt catalog data needed by the public v1 tools
- direct runtime dependencies declared by `@salt-ds/mcp`

Internal core sources, registry builders, evaluation helpers, JSON schemas, and
repo-only support artifacts are not part of the public package contract. The
source-level core boundary is documented in the repository's
[`CORE_ARCHITECTURE.md`](https://github.com/jpmorganchase/salt-ds/blob/main/packages/mcp/CORE_ARCHITECTURE.md).
