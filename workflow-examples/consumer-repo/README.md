# Consumer Repo Workflow Example

This workflow example is the smallest external-consumer repo shape Salt expects.

Use it as a file-layout reference, not as the canonical workflow guide. Consumers should be able to use Salt from [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx) alone.

## Example Layout

```text
consumer-app/
├── AGENTS.md
├── package.json
├── mcp.config.example.json
├── tsconfig.json
├── docs/
│   └── repo convention references
├── src/
│   ├── components/AppButton.tsx
│   └── theme/ConsumerBrandProvider.tsx
└── .salt/
    └── team.json
```

## Files

- `package.json`
  - minimal React app dependencies that consume Salt, plus a working `ui:verify` TypeScript check
- `mcp.config.example.json`
  - example Salt MCP configuration
- `AGENTS.md`
  - the shared repo workflow contract for Salt UI tasks
- `.salt/team.json`
  - the default repo-local conventions file
- `.github/copilot-instructions.md`
  - optional VS Code adapter generated only when a repo wants host-specific scaffolding
- `src/` and `docs/`
  - minimal, compilable implementations and documentation for every wrapper,
    provider, token alias, and pattern preference declared by `.salt/team.json`

## What This Example Shows

- Salt MCP as the only public v1 workflow path
- an IDE-first workflow order of `review`, `migrate`, then `create`
- zero-config canonical Salt value before repo policy exists
- `.salt/team.json` as the default conventions layer
- root `AGENTS.md` as the shared cross-IDE workflow contract
- `ui:verify` as a real repo-owned TypeScript gate that teams can extend with their own checks

## Important Boundary

- Salt MCP stays canonical for Salt decisions.
- `.salt/team.json` stays repo-local.
- `.salt/stack.json` is optional and advanced, not the default.
- There is no public CLI fallback. Runtime capture, durable attestation,
  bootstrap automation, and artifact persistence remain host- or repo-owned.

## Related Docs

- [`../../packages/skills/README.md`](../../packages/skills/README.md)
- [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx)
- [`../project-conventions/README.md`](../project-conventions/README.md)
