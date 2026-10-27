# @salt-ds/cli

Sets up coding agents with the documentation of your installed Salt packages, and checks Salt code against it.

```sh
npm install --save-dev @salt-ds/cli
npx salt-ds init --script typecheck
```

- `salt-ds init` adds an index of the installed Salt docs to `AGENTS.md`, imports it from `CLAUDE.md`, and with `--copilot` adds it to `.github/copilot-instructions.md`. `--script <name>` makes that `package.json` script, such as `typecheck` or `lint`, end by running `salt-ds check`, so the check runs in CI and for agents that run the script without loading `AGENTS.md`.
- `salt-ds check` reports deprecated or unknown design tokens, deprecated props and components missing a required part, with the docs page for each. `--changed` checks only files changed since the last commit.

Both read the docs and check data that each installed Salt package ships in its `docs` folder, so they match the installed Salt versions. They need Salt packages that ship agent docs; a package whose check data is newer than the CLI reads is skipped with a notice to upgrade the CLI. See [AI coding agents](https://www.saltdesignsystem.com/salt/getting-started/ai-coding-agents) for the options and client support.

The generated instructions also send agents repairing an accessibility issue or a failing accessibility check to Core's Fixing accessibility guide. Its path comes from the target application's installed Core manifest and resolved documentation path; with older packages that don't ship the guide, the instructions leave that sentence out. `--copilot` resolves its paths from the repository root separately from the `AGENTS.md` location.

Rerun `salt-ds init` after updating the CLI or adding or upgrading Salt packages. Use `salt-ds init --check` with the same setup options to detect stale generated instructions, including changes to the guidance when the indexed page list stays the same.
