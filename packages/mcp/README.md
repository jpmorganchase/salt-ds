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

Start with `get_salt_project_context` for repo-aware work. Then call the workflow that matches the job:

- `review_salt_ui` for existing Salt UI and Salt-specific findings
- `create_salt_ui` for bounded new Salt UI
- `migrate_to_salt` for non-Salt UI or structured source outlines moving to Salt

Use `get_salt_reference` when a workflow asks for entity or example evidence. Use catalog resources for lightweight manifest and entity inspection.

Workflow tools return compact `salt_workflow_v1` output. Read `status`, `action.kind`, `evidence.status`, and `summary` before implementation detail.

## Package Boundary

Published package contents are intentionally limited to:

- the `salt-mcp` bin
- compiled runtime code
- minimized offline Salt catalog data needed by the public v1 tools
- schemas required by the bundled runtime

Internal eval runners, generated context packs, setup reports, review-state resources, and CLI workflow surfaces are not part of the public package contract.
