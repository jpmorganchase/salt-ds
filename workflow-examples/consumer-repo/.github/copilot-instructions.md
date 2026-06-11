<!-- salt-ds:copilot-instructions:start -->

# Salt UI Workflow

Follow the repo root `AGENTS.md` as the primary Salt workflow contract.

- In the IDE, prefer Salt jobs in this order: review, upgrade, migrate, then create.
- When Salt returns compact workflow output, read `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, and `summary` first.
- Do not guess or hallucinate Salt APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, or documentation links.
- Provider and theme bootstrap names, imports, props, fonts, and package paths must come from workflow evidence, registry-backed generated context, `.salt` policy, or explicit user input. If that evidence is missing, report theme bootstrap as pending or unsupported instead of naming defaults.
- Treat the compact `salt_workflow_v1` action as binding: `ask_user` means ask and stop until the user provides updated input, `retrieve_entity`/`retrieve_examples` means gather evidence and rerun with the returned evidence bridge, `install_dependencies` means install packages and then rerun the originating workflow, and only `implement` permits editing Salt UI.
- Installing Salt packages is not implementation permission; after installing, immediately rerun the originating workflow and edit only if that rerun returns `status: success`, `action.kind: implement`, and `evidence.status: complete`. Do not insert a manual `get_salt_project_context` call between the install and the rerun — Salt MCP marks the cached project context for the affected `root_dir` stale as soon as the workflow emits `install_dependencies`, so the next rerun transparently refetches new package state.
- Only implement when `status` is `success`, `action.kind` is `implement`, `safety.exact_request_safe` is true, and `evidence.status` is `complete`; run the returned review/post action after editing.
- After `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, or `bootstrap_repo`, rerun the originating workflow with the returned evidence bridge before editing. For create entity follow-through, use MCP `resolved_entities` or CLI `--resolved-entity` on the rerun. If `action.kind` is `ask_user`, stop and treat the user's answer as updated workflow input.
- Use `recipe.steps`, `questions`, and `evidence.missing` to explain remaining work instead of guessing past a partial result.
- For broad or mixed-surface Salt UI prompts, use the Salt workflow before editing.
- If compact create output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before implementing the blocked region.
- Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.
- If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first answer canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.
- Prefer the repo Salt UI agent in `.github/agents/salt-ui.agent.md` for those broad Salt UI tasks when your host supports custom agents.
- Do not use `node_modules`, copied app code, or generic web examples as canonical Salt guidance.
- Validate with the repo `ui:verify` script when it exists, or run `salt-ds review` directly, before considering Salt UI work done.
- If the Salt-managed repo guidance or generated host adapter files look stale, rerun `bootstrap_salt_repo` or `salt-ds init` to refresh them instead of hand-rewriting them.
- If Salt MCP and the Salt CLI are both unavailable, stop instead of improvising Salt-specific React/CSS/HTML.
<!-- salt-ds:copilot-instructions:end -->
