<!-- salt-ds:copilot-instructions:start -->

# Salt UI Workflow

Follow the repo root `AGENTS.md` as the primary Salt workflow contract.

- In the IDE, prefer Salt jobs in this order: review, upgrade, migrate, then create.
- When Salt returns compact workflow output, read `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, and `summary` first.
- Do not guess or hallucinate Salt APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, or documentation links.
- Treat the compact `salt_workflow_v1` action as binding: `ask_user` means ask, `retrieve_entity`/`retrieve_examples` means gather evidence and rerun with the returned evidence bridge, `install_dependencies` means install packages first, and only `implement` permits editing Salt UI.
- Only implement when `status` is `success`, `action.kind` is `implement`, `safety.exact_request_safe` is true, and `evidence.status` is `complete`; run the returned review/post action after editing.
- After `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, `bootstrap_repo`, or an answered `ask_user`, rerun the originating workflow with the returned evidence bridge before editing.
- Use `recipe.steps`, `questions`, and `evidence.missing` to explain remaining work instead of guessing past a partial result.
- For broad prompts such as `create a dashboard`, `add tabs`, `add a table`, or `fix this layout`, use the Salt workflow before editing.
- If compact create output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before implementing the blocked region.
- Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.
- If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first answer canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.
- Prefer the repo Salt UI agent in `.github/agents/salt-ui.agent.md` for those broad Salt UI tasks when your host supports custom agents.
- Do not use `node_modules`, copied app code, or generic web examples as canonical Salt guidance.
- Validate with the repo `ui:verify` script when it exists, or run `salt-ds review` directly, before considering Salt UI work done.
- If the Salt-managed repo guidance or generated host adapter files look stale, rerun `bootstrap_salt_repo` or `salt-ds init` to refresh them instead of hand-rewriting them.
- If Salt MCP and the Salt CLI are both unavailable, stop instead of improvising Salt-specific React/CSS/HTML.
<!-- salt-ds:copilot-instructions:end -->
