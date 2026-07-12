---
name: salt-ds
description: Thin Salt Design System router for evidence-backed review, create, and migrate work in consumer repos. Use when @salt-ds packages, Salt adoption, Salt-specific UI structure, or Salt MCP evidence is involved; leave generic React, CSS, build, runtime, and product-design work to the host repo and its existing tools.
---

# Salt DS

Route Salt-specific decisions through the public, read-only Salt MCP contract. Keep repo inspection, authorized edits, and local validation in the host.

Do not invent Salt APIs, props, tokens, examples, imports, or package names from model memory. Canonical Salt facts come from MCP.

## Load

Load `references/core.md` first. Then load only the workflow reference that matches the user job:

- `references/review.md`
- `references/create.md`
- `references/migrate.md`

Load `references/troubleshooting.md` only after a tool, schema, context, registry, or complete-source failure.

## Trigger Boundary

Use this skill when:

- the repo already uses `@salt-ds/*`
- the user asks to adopt or migrate to Salt
- the user asks for Salt-specific review, component choice, layout ownership, hierarchy, accessibility, forms, dialogs, tables, dashboards, navigation, or migration help

Do not use it for generic React, CSS, TypeScript, build, package-management, CI, or design critique that does not require Salt-specific evidence.

## Workflow Selection

- `review`: inspect existing or changed Salt UI and identify the safest evidence-backed fixes.
- `create`: build a bounded new Salt component, form, panel, dialog, dashboard, page section, or workflow surface.
- `migrate`: translate non-Salt UI, foreign libraries, or a structured source outline while preserving task flow.

Call one primary workflow per phase with `root_dir` set to the active project or package (the target workspace package in a monorepo), follow its returned continuation, and use review after edits. Without `root_dir`, the workflow inspects the MCP process working directory. Use `get_salt_project_context` only for diagnostics or a disputed root; its result is not reusable workflow state. Workflow evidence counts as grounding. Use `get_salt_reference` only when an action returns it, the user explicitly requests an exact reference, or an intended API remains ungrounded.
