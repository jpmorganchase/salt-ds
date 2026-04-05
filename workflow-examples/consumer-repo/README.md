# Consumer Repo Workflow Example

This workflow example is the smallest external-consumer repo shape Salt expects.

Use it as a file-layout reference, not as the canonical workflow guide. Consumers should be able to use Salt from [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx) alone.

## Example Layout

```text
consumer-app/
├── AGENTS.md
├── package.json
├── mcp.config.example.json
└── .salt/
    └── team.json
```

## Files

- `package.json`
  - minimal React app dependencies that consume Salt, plus a `ui:verify` review script
- `mcp.config.example.json`
  - example Salt MCP configuration
- `AGENTS.md`
  - the shared repo workflow contract for Salt UI tasks
- `.salt/team.json`
  - the default repo-local conventions file
- `.github/copilot-instructions.md`
  - optional VS Code adapter generated only when a repo wants host-specific scaffolding
- `.github/agents/salt-ui.agent.md`
  - optional VS Code Salt UI custom agent for broad Salt UI tasks

## What This Example Shows

- `salt-ds + MCP` as the default path
- an IDE-first workflow order of `review`, `upgrade`, `migrate`, then `create`
- zero-config canonical Salt value before repo policy exists
- `.salt/team.json` as the default conventions layer
- root `AGENTS.md` as the shared cross-IDE workflow contract
- VS Code adapters generated from the same repo contract only when explicitly requested
- the Salt UI agent as the preferred path for broad asks like `create a dashboard`, `add tabs`, `add a table`, or `fix this layout`
- `salt-ds init` as the optional step that adds durable repo policy and the managed root instruction block after first-run value
- `ui:verify` as an optional repo-local wrapper around `salt-ds review`
- `salt-ds + CLI` as the restricted-environment fallback when MCP is blocked
- manual CLI kept workflow-first through `salt-ds info`, `salt-ds create`, `salt-ds review`, `salt-ds migrate`, and `salt-ds upgrade`
- `salt-ds doctor` and `salt-ds runtime inspect` reserved for runtime evidence and support work

## Important Boundary

- Salt MCP stays canonical for Salt decisions.
- `.salt/team.json` stays repo-local.
- `.salt/stack.json` is optional and advanced, not the default.
- runtime evidence supports a workflow; it does not replace canonical Salt guidance.

## Related Docs

- [`../../packages/skills/README.md`](../../packages/skills/README.md)
- [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx)
- [`../project-conventions/README.md`](../project-conventions/README.md)
