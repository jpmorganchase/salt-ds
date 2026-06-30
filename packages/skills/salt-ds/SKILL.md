---
name: salt-ds
description: Thin Salt Design System router for MCP-backed review, create, and migrate workflows in Salt consumer repos. Use when @salt-ds packages, Salt adoption, Salt-specific UI structure, or Salt MCP workflow evidence is involved; leave generic React, CSS, build, and product-design work to the host.
---

# Salt DS

Use this skill to route Salt-specific work to the public Salt MCP contract.

Do not invent Salt APIs, props, tokens, examples, imports, or package names from model memory. Canonical Salt facts come from MCP.

## Always Load

Load `references/core.md` first. Then load only the workflow reference that matches the user job:

- `references/review.md`
- `references/create.md`
- `references/migrate.md`

## Trigger Boundary

Use this skill when:

- the repo already uses `@salt-ds/*`
- the user asks to adopt or migrate to Salt
- the user asks for Salt-specific review, component choice, layout ownership, hierarchy, accessibility, forms, dialogs, tables, dashboards, navigation, or migration help

Do not use this skill for generic React, CSS, TypeScript, build, package-management, CI, or design critique that does not require Salt-specific evidence.

## Workflow Selection

- `review`: existing Salt UI, changed Salt code, deprecated usage, Salt accessibility or hierarchy concerns, primitive choice, and safest fixes.
- `create`: bounded new Salt UI such as a component, form, panel, dialog, dashboard, page section, or small workflow surface.
- `migrate`: non-Salt UI code, foreign component libraries, or structured source outlines that should become Salt while preserving task flow.

When in doubt, start with `get_salt_project_context`, then choose the workflow. Use `get_salt_reference` only when the workflow asks for canonical entity or example evidence.
