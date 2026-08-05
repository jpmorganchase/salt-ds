# Salt Skills

`packages/skills` contains the Salt-owned, agent-facing procedures for external
consumer repositories.

The `salt-ds` skill keeps creation, migration, and review orchestration in the
host agent while using Salt MCP only for canonical facts, bounded inspection,
and submitted-code analysis.

## Release status

Public installation is withheld while the MCP package undergoes its breaking
redesign. There is no reviewed immutable public skill reference yet, and a
mutable branch, `main`, or short commit reference must not be presented as a
release substitute.

The canonical remediation status is documented in
[`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx).
Local repository checks may validate `./packages/skills`, but that is development
verification rather than public onboarding.

## Source layout

```text
packages/skills/
├── AGENTS.md
├── README.md
└── salt-ds/
```
