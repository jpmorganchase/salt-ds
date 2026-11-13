# @salt-ds/cli

Sets up coding agents with the documentation of your installed Salt packages, and checks Salt code against it.

```sh
npm install --save-dev @salt-ds/cli
npx salt-ds init --script typecheck
```

- `salt-ds init` adds an index of the installed Salt docs to `AGENTS.md`, imports it from `CLAUDE.md`, and with `--copilot` adds it to `.github/copilot-instructions.md`. `--script <name>` makes that `package.json` script, such as `typecheck` or `lint`, end by running `salt-ds check`, so the check runs in CI and for agents that run the script without loading `AGENTS.md`.
- `salt-ds check` reports deprecated or unknown design tokens, direct use of raw color foundations or color palettes, deprecated props and components missing a required part, and suggests Salt components and layouts for code that has one, such as NumberInput for an Input set up for numbers, ToggleButton for a Button with aria-pressed and GridLayout for a CSS grid, asks for NumberInput's clamped value to be announced and its range to be given in helper text, and reports an app's overrides of Salt's tokens, with the docs page for each. `--changed` checks only files changed since the last commit.

Both read the docs and check data that each installed Salt package ships in its `docs` folder, so they match the installed Salt versions. They need Salt packages that ship agent docs; a package whose check data is newer than the CLI reads is skipped with a notice to upgrade the CLI. See [AI coding agents](https://www.saltdesignsystem.com/salt/getting-started/ai-coding-agents) for the options and client support.

For color, prefer a component's API, or a semantic characteristic token for custom styling. Raw color foundations, including RGB and alpha variants, and color palettes are theme implementation details. The check warns about their direct use when the installed package supplies that metadata; documented non-color foundations, such as spacing, remain available. Categorical chart colors use semantic category tokens.

Scripts added by `init --script` use the package manager's application context, so an earlier `cd` in the script does not change which application is checked. Running `salt-ds check` manually still uses the current directory unless you pass `--project`.

The generated instructions also send agents repairing an accessibility issue or a failing accessibility check to Core's Fixing accessibility guide. Its path comes from the target application's installed Core manifest and resolved documentation path; with older packages that don't ship the guide, the instructions leave that sentence out. `--copilot` resolves its paths from the repository root separately from the `AGENTS.md` location.

Rerun `salt-ds init` after updating the CLI or adding or upgrading Salt packages. Use `salt-ds init --check` with the same setup options to detect stale generated instructions, including changes to the guidance when the indexed page list stays the same.
