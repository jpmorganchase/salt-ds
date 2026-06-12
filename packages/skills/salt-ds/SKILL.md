---
name: salt-ds
description: Agent-agnostic Salt design system workflow for Salt-specific create, review, migrate, upgrade, init, quick-check, accessibility audits, repo conventions, and UI composition/layout work in consumer repos. Use only when @salt-ds packages, .salt policy, Salt MCP/CLI, or explicit Salt adoption is involved; leave non-Salt work to the host.
---

# Salt DS

Salt's public orchestrator skill for repo-aware design-system work in consumer repos.
Keep one public workflow surface: `init`, `create`, `review`, `migrate`, `upgrade`.
Do not make the user choose between separate builder, reviewer, migration, accessibility, or conventions skills.

## Always-Load First

Before any other Salt-specific reasoning, load `references/core.md`. It carries the always-on behavior bullets every Salt workflow shares: the No Salt Invention Rule, the Theme Evidence Rule, the Hard Gate, the Action Loop, Project Context First, the Shared Workflow Contract, the Stable-First Rule, and the Output Posture. It also folds in the host-specific guidance, degraded-tooling rules, design principles, modes, project memory, surface resolution, surfaces, theme bootstrap, and the canonical workflow/transport contract.
This file (SKILL.md) is a thin router; the binding behavior contract lives in `references/core.md`.

## Example Triggers

- `Quick-check this Salt form before I commit.`
- `Create a Salt-native dashboard page for this feature.`
- `Show me two Salt-valid directions for this workspace shell.`
- `Review this Salt dialog and tell me the safest next fix.`
- `Audit this screen for Salt-specific accessibility and hierarchy issues.`
- `Migrate this non-Salt page into Salt without changing the task flow.`
- `Upgrade this older Salt usage and separate required fixes from cleanup.`
- `Bootstrap Salt repo policy for this consumer app.`

## Trigger Boundary

Use this skill when:

- the repo already shows Salt signals such as `@salt-ds/*` packages, `.salt/team.json`, `.salt/stack.json`, Salt MCP workflows, or the `salt-ds` CLI
- the user explicitly asks to adopt Salt, migrate non-Salt UI into Salt, or bootstrap Salt repo policy
- the task touches Salt-specific UI structure, layout, hierarchy, navigation, forms, dialogs, tables, dashboards, accessibility, migration, or upgrades in a Salt consumer repo

Do not use this skill for generic React, CSS, accessibility, or product-design work that does not require Salt-specific guidance.
Do not use this skill for generic repo work that merely happens in a Salt repo, including generic refactors, TypeScript cleanup, CSS-only fixes, build/test/CI/package-management work, or generic debugging where Salt primitives, patterns, policy, migration, or upgrade logic are not part of the answer.

## Workflow Selection

Route by user job, not by IDE presence:

- `create`: new Salt-native components, panels, pages, screens, dashboards, shells, or bounded extensions to an existing Salt surface.
- `review`: existing Salt UI, Salt-specific bugs, accessibility audits, alignment/layout issues, or validation of changed Salt code.
- `migrate`: non-Salt UI, foreign component libraries, screenshots, mockups, or rough source experiences that should become Salt while preserving task flow and critical states.
- `upgrade`: Salt version moves, deprecations, package/API upgrades, and Salt-native modernization where the starting point is already Salt-based.
- `init`: repo-policy bootstrap and managed-instruction refresh.

Accessibility audits normally route through `review`.
Bootstrap tasks normally route through `init`.
Ask instead of guessing when the task genuinely spans more than one workflow.

For `create`, prefer this sequencing by default: compact workflow result; retrieval support inspection when the owner is still broad or mixed-surface; exact named follow-through for owner or supporting surfaces; `full` only when additive details are actually needed.

## Reference Routing

Always load `references/core.md` first. Then load only the file matching the current workflow: `create.md`, `review.md`, `migrate.md`, `upgrade.md`, or `conventions.md`.
