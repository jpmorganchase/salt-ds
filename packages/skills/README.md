# Salt Skills

`packages/skills` is the Salt-owned workflow layer for external consumer repos.

This README is the skill authoring reference. Keep the consumer setup path in the main AI page.

Keep canonical Salt decisions in Salt MCP. Keep repo-specific wrappers, shells, and banned choices in declared repo policy when it already exists.

## Consumer Docs

Use [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx) as the canonical consumer guidance.

This README stays intentionally thin so the workflow story only needs to be maintained in one place.

## Authored Skill

- `salt-ds`
  - the single authored workflow skill for external consumers
  - routes Salt review, create, and migrate work through the v1 MCP surface

## Install Source

The skill is deliberately omitted from public `@salt-ds/mcp@0.1.0` onboarding because no immutable reviewed skill commit exists yet. Do not publish a mutable `main`, branch, or short-SHA install URL as a substitute. The current public setup and the condition for exposing the skill live in [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx).

If you are working from a local checkout, validate `./packages/skills` with `npx skills add ./packages/skills --list` before pointing other docs at it.

## Source Layout

`packages/skills` is the authoring source in this monorepo.

```text
packages/skills/
├── AGENTS.md
├── README.md
└── salt-ds/
```
