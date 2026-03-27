# Consumer Repo Workflow Example

This workflow example is the smallest external-consumer repo shape Salt expects.

Use it as a file-layout reference, not as the canonical workflow guide. The consumer workflow docs live in:

- [`../../packages/mcp/docs/consumer/consumer-repo-setup.md`](../../packages/mcp/docs/consumer/consumer-repo-setup.md)
- [`../../packages/mcp/docs/consumer/getting-good-results.md`](../../packages/mcp/docs/consumer/getting-good-results.md)
- [`../../packages/mcp/docs/consumer/troubleshooting.md`](../../packages/mcp/docs/consumer/troubleshooting.md)

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
  - minimal React app dependencies that consume Salt
- `mcp.config.example.json`
  - example Salt MCP configuration
- `AGENTS.md`
  - a small repo instruction block that points the agent at `.salt/team.json`
- `.salt/team.json`
  - the default repo-local conventions file

## What This Example Shows

- `salt-ds + MCP` as the default path
- `.salt/team.json` as the default conventions layer
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
- [`../../packages/mcp/docs/consumer/consuming-project-conventions.md`](../../packages/mcp/docs/consumer/consuming-project-conventions.md)
- [`../project-conventions/README.md`](../project-conventions/README.md)
