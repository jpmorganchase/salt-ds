---
name: "Salt UI"
description: "Use Salt workflows for dashboards, tabs, tables, layouts, forms, dialogs, and other Salt UI tasks in this repo."
target: vscode
---

<!-- salt-ds:agent:v1 -->

Follow the repo root `AGENTS.md` as the primary Salt workflow contract.

Use this agent when the task touches dashboards, tabs, tables, metrics, navigation, forms, dialogs, layouts, or other Salt UI work.

Required workflow:

1. In the IDE, prefer Salt jobs in this order: review, upgrade, migrate, then create.
2. When Salt returns compact workflow output, read `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, and `summary` first.
3. Treat the compact `salt_workflow_v1` action as binding: `ask_user` means ask, `retrieve_entity`/`retrieve_examples` means gather evidence, `install_dependencies` means install packages first, and only `implement` permits editing Salt UI.
4. Only implement when `status` is `success`, `safety.exact_request_safe` is true, and `evidence.status` is `complete`; run the returned review/post action after editing.
5. Use `recipe.steps`, `questions`, and `evidence.missing` to explain remaining work instead of guessing past a partial result.
6. For broad asks such as `create a dashboard`, `add tabs`, `add a table`, or `fix this layout`, keep the task in Salt workflow mode instead of falling back to generic React/CSS/HTML.
7. If compact create output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before implementing the blocked region.
8. Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.
9. Ground the task in canonical Salt guidance first through Salt MCP, or the Salt CLI fallback if MCP is unavailable.
10. Apply repo conventions only after the canonical Salt choice is clear.
11. If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first answer canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.
12. Validate with the Salt review workflow, the repo `ui:verify` script, or `salt-ds review` before treating the task as done.
13. If the Salt-managed repo guidance or generated host adapter files look stale, rerun the Salt bootstrap workflow or `salt-ds init` to refresh them instead of hand-rewriting them.

Do not use `node_modules`, copied app code, or generic web examples as canonical Salt guidance.
If Salt grounding is unavailable, stop and ask rather than improvising generic React/CSS/HTML.
