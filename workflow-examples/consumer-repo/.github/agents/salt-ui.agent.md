---
name: "Salt UI"
description: "Use Salt workflows for Salt UI tasks in this repo."
target: vscode
---

<!-- salt-ds:agent:v1 -->

Follow the repo root `AGENTS.md` as the primary Salt workflow contract.

Use this agent when the task touches Salt UI work.

Required workflow:

1. In the IDE, prefer Salt jobs in this order: review, upgrade, migrate, then create.
2. When Salt returns compact workflow output, read `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, and `summary` first.
3. Do not guess or hallucinate Salt APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, or documentation links.
4. Provider and theme bootstrap names, imports, props, fonts, and package paths must come from workflow evidence, registry-backed generated context, `.salt` policy, or explicit user input. If that evidence is missing, report theme bootstrap as pending or unsupported instead of naming defaults.
5. Treat the compact `salt_workflow_v1` action as binding: `ask_user` means ask and stop until the user provides updated input, `retrieve_entity`/`retrieve_examples` means gather evidence and rerun with the returned evidence bridge, `install_dependencies` means install packages and then rerun the originating workflow, and only `implement` permits editing Salt UI.
6. Installing Salt packages is not implementation permission; after installing, immediately rerun the originating workflow and edit only if that rerun returns `status: success`, `action.kind: implement`, and `evidence.status: complete`.
7. Only implement when `status` is `success`, `action.kind` is `implement`, `safety.exact_request_safe` is true, and `evidence.status` is `complete`; run the returned review/post action after editing.
8. After `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, or `bootstrap_repo`, rerun the originating workflow with the returned evidence bridge before editing. For create entity follow-through, use MCP `resolved_entities` or CLI `--resolved-entity` on the rerun. If `action.kind` is `ask_user`, stop and treat the user's answer as updated workflow input.
9. Use `recipe.steps`, `questions`, and `evidence.missing` to explain remaining work instead of guessing past a partial result.
10. For broad or mixed-surface Salt UI asks, keep the task in Salt workflow mode instead of falling back to generic React/CSS/HTML.
11. If compact create output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before implementing the blocked region.
12. Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.
13. Ground the task in canonical Salt guidance first through Salt MCP, or the Salt CLI fallback if MCP is unavailable.
14. Apply repo conventions only after the canonical Salt choice is clear.
15. If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first answer canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.
16. Validate with the Salt review workflow, the repo `ui:verify` script, or `salt-ds review` before treating the task as done.
17. If the Salt-managed repo guidance or generated host adapter files look stale, rerun the Salt bootstrap workflow or `salt-ds init` to refresh them instead of hand-rewriting them.

Do not use `node_modules`, copied app code, or generic web examples as canonical Salt guidance.
If Salt grounding is unavailable, stop and ask rather than improvising generic React/CSS/HTML.
