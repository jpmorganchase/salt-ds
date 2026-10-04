# Core

Salt's stable React components. See the [Salt documentation site](https://www.saltdesignsystem.com/salt/getting-started/developing) to get started.

## Using Salt with AI coding agents

Salt packages include Markdown documentation for coding agents in their `docs` folder. It is generated from the Salt website for the exact version you install, so it matches your code: components with usage guidance, props, examples and accessibility, plus patterns, themes and design tokens.

Point your agent at it by running this in the folder that holds your `AGENTS.md`, usually the repository root:

```sh
node node_modules/@salt-ds/core/docs/agents-md.mjs
```

This adds a Salt block to `AGENTS.md`, which GitHub Copilot, Codex, Cursor and most other coding agents read, and makes `CLAUDE.md` import `AGENTS.md` for Claude Code. The block holds a compressed index of the docs in every installed `@salt-ds` package, so agents see which pages exist with every request instead of having to decide to look them up. The script keeps your other instructions.

Run it again after you add or upgrade Salt packages, because the index lists the pages of the installed versions. Add `--check` to fail in CI when either file needs updating, and `--no-claude` to leave `CLAUDE.md` alone; if you set up with `--no-claude`, check with it too.

The block looks like this, with one line per docs folder:

```md
<!-- BEGIN:salt-ds-agent-docs -->

## Salt Design System

This project uses the Salt Design System (`@salt-ds/*` packages), whose APIs may differ from your training data. For any Salt task, prefer retrieval-led reasoning over pre-training-led reasoning: before writing or changing UI that uses Salt, read the relevant pages from the index below. They are generated for the installed package versions. Index paths are relative to `root`, which is relative to this file. Names in brackets are other names for the same component, and each package's `docs/index.md` summarizes its pages.

[Salt docs index]|root: node_modules/@salt-ds
|core/docs/components:{accordion.md[Collapsible panel;Concertina;Expansion panel],avatar.md[Faces;Profile Picture;User Photo],...}
|core/docs/patterns:{analytical-dashboard.md,announcement-dialog.md,...}
|theme/docs:{foundations.md,themes.md,tokens.md}

<!-- END:salt-ds-agent-docs -->
```

In a monorepo, `node_modules/@salt-ds/core` may be under the application's directory rather than the repository root. Run the script by that path, for example `node apps/web/node_modules/@salt-ds/core/docs/agents-md.mjs`, and the block points to those docs.
