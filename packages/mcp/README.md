# @salt-ds/mcp

<!-- cspell:ignore realpath -->

Read-only Salt Design System MCP server.

This is the single public install path for the first Salt DS AI tooling release.

Node.js 22 or newer is required.

```json
{
  "mcpServers": {
    "Salt": {
      "command": "npx",
      "args": ["-y", "@salt-ds/mcp@0.1.0"]
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

Repo policy in `.salt/team.json` is optional and remains repo/user-owned. When it and the advanced optional `.salt/stack.json` are absent, Salt provides canonical-only guidance and does not invent durable team conventions. The authored `salt-ds` skill is deliberately omitted from public `0.1.0` setup until an immutable reviewed skill commit is available; do not install it from a mutable branch as a substitute.

## Local Filesystem Trust

The CLI is a local stdio process with the filesystem permissions of the account that launches it. `root_dir` selects where project-context discovery starts; it is not a sandbox or authorization boundary. Invalid package or tsconfig markers fail repo-specific workflows closed, but valid ancestor and inherited-config resolution may read outside `root_dir`.

Run Salt with the least practical privileges and sandbox it for untrusted repositories. Remote or shared embedders must add their own authentication, tenant isolation, and path confinement. See [CORE_ARCHITECTURE.md](./CORE_ARCHITECTURE.md#local-filesystem-trust-model) for the complete trust model and inspection limits.

## Workflow Model

Call the workflow that matches the job and pass `root_dir` for the active project or package (the target workspace package in a monorepo):

- `review_salt_ui` for existing Salt UI and Salt-specific findings
- `create_salt_ui` for bounded new Salt UI
- `migrate_to_salt` for non-Salt UI or structured source outlines moving to Salt

Use `get_salt_reference` when a workflow asks for entity or example evidence. Use catalog resources for lightweight manifest and entity inspection.

Workflow tools resolve repo context from `root_dir` or, when it is omitted, the MCP process working directory. Use `get_salt_project_context` only when you need explicit diagnostics or must resolve a disputed root; its result is not reusable workflow state.

Workflow tools return compact `salt_workflow_v1` output. Read `status`, `action.kind`, `action.post_action`, `guidance`, `evidence.status`, and `summary` before implementation detail. Guidance is workflow-specific and bounded: create returns a decision plus starter guidance; review returns findings and fixes; migrate returns translations, a migration plan, starter guidance, and post-migration verification.

When create returns an exact-name retry, execute the complete `action.args` object unchanged. It retains the canonical `root_dir` and every explicit create option while replacing only `query` with the exact requested entity. Do not reconstruct a query-only retry, relax `package`, `status`, or `solution_type`, or add unrelated names to `resolved_entities` as helpful evidence. Only the selected owner and current required follow-through identities can satisfy resolved evidence; ambiguous, unknown, or unrelated names block.

Create reference-retrieval actions may request one to three names and include a one-level `action.post_action` that reruns `create_salt_ui`. Execute that post-action only when the immediately preceding `get_salt_reference` result satisfies the complete all-found predicate:

- `decision.status === "results"`;
- `requested_count` equals the action's requested-name count;
- `found_count === requested_count`;
- `not_found_count === 0`, `ambiguous_count === 0`, and `unresolved_names` is empty;
- every result row's nested lookup decision is `found`.

On a partial, ambiguous, or missing result, stop or retry with only the names proven found. Never use the optimistic requested-name list in `action.post_action` as evidence. The server rechecks resolved names and remains fail-closed if a host ignores this precondition, but it cannot enforce host sequencing. Dependency installation stays outside the semantic workflow contract. `ask_user` stops with `action.post_action: null`; ask the question and wait for updated user input instead of inferring a rerun.

## Package Boundary

Published package contents are intentionally limited to:

- the `salt-mcp` bin
- one compiled runtime bundle per module format (ESM and CommonJS)
- minimized offline Salt catalog data needed by the public v1 tools
- direct runtime dependencies declared by `@salt-ds/mcp`

Internal core sources, registry builders, evaluation helpers, JSON schemas, and
repo-only support artifacts are not part of the public package contract. The
source-level core boundary is documented in the repository's
[`CORE_ARCHITECTURE.md`](./CORE_ARCHITECTURE.md).
