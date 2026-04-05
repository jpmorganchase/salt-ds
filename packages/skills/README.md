# Salt Skills

`packages/skills` is the Salt-owned workflow layer for external consumer repos.

The intended consumer model is:

- `salt-ds + MCP` when MCP is available
- `salt-ds + CLI` when MCP is blocked
- manual CLI use stays workflow-first through `salt-ds init`, `salt-ds info`, `salt-ds create`, `salt-ds review`, `salt-ds migrate`, and `salt-ds upgrade`
- `salt-ds doctor` and `salt-ds runtime inspect` stay in the evidence/support layer
- `salt-ds review --url` is the main evidence-enabled review path when runtime confirmation is needed

Keep canonical Salt decisions in Salt MCP or the workflow CLI itself. Keep repo-specific wrappers, shells, and banned choices in `.salt/team.json`.

## Consumer Docs

Use [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx) as the canonical consumer guidance.

This README stays intentionally thin so the workflow story only needs to be maintained in one place.

## Public Skill

- `salt-ds`
  - the single public workflow skill for external consumers
  - routes build, review, migrate, upgrade, and conventions work through the same product surface

## Install Source

The current install source and verification flow live in [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx).

If you are working from a local checkout, validate `./packages/skills` with `npx skills add ./packages/skills --list` before pointing other docs at it.

## Source Layout

`packages/skills` is the authoring source in this monorepo.

```text
packages/skills/
├── AGENTS.md
├── README.md
└── salt-ds/
```
