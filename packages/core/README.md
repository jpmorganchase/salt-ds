# Core

Salt's stable React components. See the [Salt documentation site](https://www.saltdesignsystem.com/salt/getting-started/developing) to get started.

## Using Salt with AI coding agents

Salt packages include Markdown documentation for coding agents in their `docs` folder. It is generated from the Salt website for the exact version you install, so it matches your code: components with usage guidance, props, examples and accessibility, plus patterns, themes and design tokens.

Point your agent at it by adding this block to your project's `AGENTS.md` (or your agent's equivalent instructions file):

```md
<!-- BEGIN:salt-ds-agent-docs -->

## Salt Design System

This project uses the Salt Design System (`@salt-ds/*` packages). Salt's APIs may differ from your training data. Before writing or changing UI that uses Salt, read `node_modules/@salt-ds/core/docs/index.md` and the pages it links to; they match the installed package versions.

<!-- END:salt-ds-agent-docs -->
```

In a monorepo, `node_modules/@salt-ds/core` may be under the application's directory rather than the repository root.
