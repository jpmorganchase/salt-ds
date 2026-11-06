---
"@salt-ds/cli": minor
---

Added `@salt-ds/cli`. `salt-ds init` sets up `AGENTS.md`, `CLAUDE.md` and, with `--copilot`, Copilot's instructions with an index of the installed Salt docs; `--script typecheck` also makes that script run `salt-ds check`. `salt-ds check` reports deprecated or unknown design tokens, deprecated props, components missing a required part, and an `Input` set up for numbers where `NumberInput` fits. Both read the docs and check data in each installed Salt package, so they match the installed Salt versions.
