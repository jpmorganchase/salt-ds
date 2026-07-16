# Consumer Repo Workflow Example

This workflow example is the smallest external-consumer repo shape Salt expects.

Use it as a file-layout reference, not as the canonical workflow guide. Consumers should be able to use Salt from [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx) alone.

Node 22 or newer and Corepack are required. From a standalone copy of this directory, run:

```sh
corepack yarn install --immutable
corepack yarn ui:verify
```

The example pins public registry versions and carries its own Yarn lockfile and TypeScript configuration. It does not resolve through the Salt monorepo.

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
- the exact reviewed `@salt-ds/mcp@0.1.0` beta package, never `latest`
- an IDE-first workflow order of `review`, `migrate`, then `create`
- zero-config canonical Salt value before repo policy exists
- optional `.salt/team.json` as the default conventions layer when a team chooses repo policy
- root `AGENTS.md` as the shared cross-IDE workflow contract
- `ui:verify` as a real repo-owned TypeScript gate that teams can extend with their own checks

## Important Boundary

- Salt MCP stays canonical for Salt decisions.
- `.salt/team.json` is optional, stays repo-local, and remains host/user-owned. Without it, Salt stays canonical-only and does not invent durable team policy.
- `.salt/stack.json` is optional and advanced, not the default.
- The optional `salt-ds` skill is not part of public `0.1.0` onboarding because this release does not yet have a separately verified immutable skill commit. A mutable branch URL is not an acceptable substitute.
- There is no public CLI fallback. Runtime capture, durable attestation,
  bootstrap automation, and artifact persistence remain host- or repo-owned.

## Related Docs

- [`../../packages/skills/README.md`](../../packages/skills/README.md)
- [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx)
- [`../project-conventions/README.md`](../project-conventions/README.md)
