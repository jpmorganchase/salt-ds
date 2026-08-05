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
  - local-development configuration used only after repository tooling installs
    the exact packed tarball under test
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

- a consumer-owned project and policy fixture used by the MCP verification suite
- a locally packed `@salt-ds/mcp` install, not a public release claim
- agent-owned create and migration work grounded by read-only Salt retrieval
- zero-config canonical Salt value before repo policy exists
- optional `.salt/team.json` as the default conventions layer when a team chooses repo policy
- root `AGENTS.md` as the shared cross-IDE workflow contract
- `ui:verify` as a real repo-owned TypeScript gate that teams can extend with their own checks

## Important Boundary

- Salt MCP stays canonical for Salt decisions.
- Salt MCP is read-only and does not authorize edits or prove task completion;
  the host agent owns those decisions.
- `.salt/team.json` is optional, stays repo-local, and remains host/user-owned. Without it, Salt stays canonical-only and does not invent durable team policy.
- `.salt/stack.json` is optional and advanced, not the default.
- Public onboarding is paused during the breaking MCP redesign. A mutable branch
  URL is not an acceptable substitute for a verified release.
- The MCP config deliberately contains no registry install command or public
  version claim. It resolves only a locally installed packed artifact.
- There is no public CLI fallback. Runtime capture, durable attestation,
  bootstrap automation, and artifact persistence remain host- or repo-owned.

## Related Docs

- [`../../packages/skills/README.md`](../../packages/skills/README.md)
- [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx)
- [`../project-conventions/README.md`](../project-conventions/README.md)
