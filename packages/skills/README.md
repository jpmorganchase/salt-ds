# Salt Skills

`packages/skills` is the Salt-owned workflow layer for external consumer repos.

This README is the skill authoring reference. Keep the consumer setup path in the main AI page.

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
